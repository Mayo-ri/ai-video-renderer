import { AbsoluteFill, Audio, Img, useCurrentFrame, useVideoConfig } from 'remotion';

export type VideoProps = {
    imageUrl: string;
    voiceoverUrl?: string;
    caption?: string;
};

export const MyVideoTemplate: React.FC<VideoProps> = ({ imageUrl, voiceoverUrl, caption }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Simple animation: zoom in the image slowly over time
    // E.g., over 300 frames it zooms from 1.0 to 1.3
    const scale = 1 + frame / 1000;

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
            {/* 1. Background Image */}
            <AbsoluteFill>
                <Img
                    src={imageUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }}
                />
            </AbsoluteFill>

            {/* 2. Voiceover Audio */}
            {voiceoverUrl && <Audio src={voiceoverUrl} />}

            {/* 3. Text Caption overlay */}
            {caption && (
                <h1
                    style={{
                        position: 'absolute',
                        bottom: '100px',
                        color: 'white',
                        fontSize: '60px',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px black',
                        textAlign: 'center',
                        width: '80%',
                        fontFamily: 'sans-serif'
                    }}
                >
                    {caption}
                </h1>
            )}
        </AbsoluteFill>
    );
};
