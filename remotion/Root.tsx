import { Composition } from 'remotion';
import { MyVideoTemplate } from './Composition.js';

export const RemotionRoot = () => {
    return (
        <>
            <Composition
                id="MyVideoTemplate"
                component={MyVideoTemplate}
                durationInFrames={300} // e.g., 10 seconds at 30fps
                fps={30}
                width={1080}
                height={1920} // TikTok/Shorts vertical format
                defaultProps={{
                    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809', // Fallback placeholder
                    voiceoverUrl: '',
                    caption: 'Hello, this is a generated video!',
                }}
            />
        </>
    );
};
