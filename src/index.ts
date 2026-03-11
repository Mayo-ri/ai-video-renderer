import express from 'express';
import cors from 'cors';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must be service_role to bypass RLS for uploads
const supabase = createClient(supabaseUrl, supabaseKey);
app.post('/api/render', async (req, res) => {
  try {
    const { videoData, userId, videoId } = req.body;
    console.log("Starting render for video:", videoId);
    // 1. Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.resolve(process.cwd(), 'remotion/Root.tsx'),
    });
    // 2. Select the composition we want to render
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'MyVideoTemplate',
      inputProps: videoData,
    });
    // 3. Render the media locally to a temporary file
    const outputFilename = `video_${videoId}.mp4`;
    const outputLocation = path.resolve(process.cwd(), outputFilename);
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps: videoData,
    });
    console.log("Render complete. Uploading to Supabase...");
    // 4. Upload the .mp4 file to Supabase Storage
    const fileBuffer = fs.readFileSync(outputLocation);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('generated_videos') 
      .upload(`public/${outputFilename}`, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });
    if (uploadError) throw new Error(`Supabase Upload failed: ${uploadError.message}`);
    
    const { data: publicUrlData } = supabase.storage.from('generated_videos').getPublicUrl(`public/${outputFilename}`);
    const publicVideoUrl = publicUrlData.publicUrl;
  
    const { error: dbError } = await supabase
      .from('video_result') 
      .update({ video_url: publicVideoUrl, status: 'completed' })
      .eq('id', videoId);
    if (dbError) throw new Error(`Database Update failed: ${dbError.message}`);
    
    fs.unlinkSync(outputLocation);
    console.log("Success! Video available at:", publicVideoUrl);
    res.json({ success: true, url: publicVideoUrl });
  } catch (err: any) {
    console.error("Rendering process failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Render Server running on port ${PORT}`);
});