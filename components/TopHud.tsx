import React from 'react';
import type { Player } from '../types';

interface TopHudProps {
    player: Player;
    onPause: () => void;
}

const HudStat: React.FC<{ emoji: string, value: string | number, colorClass: string }> = ({ emoji, value, colorClass }) => (
    <div className={`flex items-center justify-center text-xs sm:text-sm ${colorClass}`}>
        <span className="text-base sm:text-lg mr-1">{emoji}</span>
        <span className="min-w-0 truncate">{value}</span>
    </div>
);

export const TopHud: React.FC<TopHudProps> = ({ player, onPause }) => {
    const xpPercentage = Math.max(0, (player.xp / player.xpToNextLevel) * 100);
    return (
        <header className="relative w-full max-w-lg mx-auto px-2 bg-black/40 rounded-lg z-30 text-white" style={{border: '2px solid var(--color-accent1)'}}>
            <button onClick={onPause} className="absolute top-1 right-2 text-xl hover:opacity-80 active:scale-90" aria-label="Pause Menu">☰</button>
            <div className="grid grid-cols-4 gap-x-2 gap-y-0 py-1">
                <div className="col-span-4 text-sm sm:text-base text-center" style={{color: 'var(--color-accent2)'}}>
                    Lvl: {player.level}
                </div>
                <div className="col-span-2 flex items-center justify-center text-green-400 text-xs sm:text-sm">
                    <span className="text-base sm:text-lg mr-1">❤️</span>
                    <span>{`${player.hp}/${player.maxHp}`}</span>
                    {player.isPoisoned && <span className="ml-1 text-base sm:text-lg animate-pulse">☠️</span>}
                </div>
                <HudStat emoji="💰" value={player.gold} colorClass="text-yellow-400" />
                <HudStat emoji="⚔️" value={player.attack} colorClass="text-red-400" />
                <HudStat emoji="🏹" value={`${player.arrows}/${player.maxArrows}`} colorClass="text-orange-400" />
                <HudStat emoji="💣" value={`${player.bombs}/${player.maxBombs}`} colorClass="text-gray-400" />
                <HudStat emoji="🧪" value={player.potions} colorClass="text-pink-400" />
                 <HudStat emoji="🍶" value={player.antidotes} colorClass="text-cyan-400" />
            </div>
            <div className="mb-1">
                <div className="w-full bg-purple-900 h-1.5 rounded-full overflow-hidden border border-purple-500">
                    <div 
                        className="bg-purple-400 h-full transition-all duration-300" 
                        style={{width: `${xpPercentage}%`}}
                    />
                </div>
            </div>
        </header>
    );
};