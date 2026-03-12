import { Composition } from 'remotion';
import { MyVideoTemplate, type VideoProps } from './Composition.js';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="MyVideoTemplate"
                component={MyVideoTemplate}
                durationInFrames={150} // Default backup
                fps={30}
                width={1080}
                height={1920}
                schema={null as any}
                calculateMetadata={({ props }) => {
                    const videoProps = props as VideoProps;
                    // Sum up all scene durations
                    const totalDuration = videoProps.scenes?.reduce((acc, scene) => acc + scene.duration, 0) || 5;
                    return {
                        durationInFrames: Math.round(totalDuration * 30),
                    };
                }}
                defaultProps={{
                    audioUrl: '',
                    captions: [],
                    scenes: [{
                        imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
                        imagePrompt: '',
                        duration: 5
                    }]
                } as VideoProps}
            />
        </>
    );
};
