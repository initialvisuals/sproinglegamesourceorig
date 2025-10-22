import React from 'react';

interface VolumeControlsProps {
    musicVolume: number;
    sfxVolume: number;
    onMusicVolumeChange: (volume: number) => void;
    onSfxVolumeChange: (volume: number) => void;
}

export const VolumeControls: React.FC<VolumeControlsProps> = ({ musicVolume, sfxVolume, onMusicVolumeChange, onSfxVolumeChange }) => {
    return (
        <div className="w-full space-y-4 text-lg">
            <div className="flex flex-col">
                <label htmlFor="music-volume" className="mb-2">Music 🎵</label>
                <input
                    id="music-volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="sfx-volume" className="mb-2">SFX 🔊</label>
                 <input
                    id="sfx-volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sfxVolume}
                    onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
                />
            </div>
        </div>
    );
};