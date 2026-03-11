import { AbsoluteFill, Audio, Img, useCurrentFrame, Series } from 'remotion';

export type VideoProps = {
    audioUrl: string;
    captions: any;
    scenes: {
        imageUrl: string;
        imagePrompt: string;
        duration: number;
    }[];
};

export const MyVideoTemplate: React.FC<VideoProps> = ({ audioUrl, scenes }) => {
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            <Series>
                {scenes.map((scene, index) => (
                    <Series.Sequence key={index} durationInFrames={Math.round(scene.duration * 30)}>
                        <SceneItem imageUrl={scene.imageUrl} />
                    </Series.Sequence>
                ))}
            </Series>
            {audioUrl && <Audio src={audioUrl} />}
        </AbsoluteFill>
    );
};

const SceneItem: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const frame = useCurrentFrame();
    const scale = 1 + frame / 1000;
    return (
        <AbsoluteFill>
            <Img
                src={imageUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }}
            />
        </AbsoluteFill>
    );
};
