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

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/render', async (req, res) => {
  try {
    const { videoData, videoId } = req.body;
    console.log("Starting render for video:", videoId);

    // 1. Bundle the project (Make sure this path is correct in your Render repo)
    const bundleLocation = await bundle({
      entryPoint: path.resolve(process.cwd(), 'remotion/Root.tsx'),
    });

    // 2. Select Composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'MyVideoTemplate',
      inputProps: videoData,
    });

    const outputFilename = `video_${videoId}.mp4`;
    const outputLocation = path.resolve(process.cwd(), outputFilename);

    // 3. Render
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps: videoData,
    });

    console.log("Render complete. Uploading...");

    // 4. Upload to Supabase ('video-assets' bucket)
    const fileBuffer = fs.readFileSync(outputLocation);
    const { error: uploadError } = await supabase.storage
      .from('video-assets')
      .upload(`renders/${outputFilename}`, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    
    const { data: { publicUrl } } = supabase.storage.from('video-assets').getPublicUrl(`renders/${outputFilename}`);
  
    // 5. Update Database ('video_results' table)
    const { error: dbError } = await supabase
      .from('video_results') 
      .update({ video_url: publicUrl })
      .eq('id', videoId);

    if (dbError) throw new Error(`Database Update failed: ${dbError.message}`);
    
    fs.unlinkSync(outputLocation);
    console.log("Success! URL:", publicUrl);
    res.json({ success: true, url: publicUrl });

  } catch (err: any) {
    console.error("Rendering failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
