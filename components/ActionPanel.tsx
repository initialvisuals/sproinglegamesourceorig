import React from 'react';
import type { Player } from '../types';

interface ActionPanelProps {
    onFireArrow: () => void;
    onDropBomb: () => void;
    onUsePotion: () => void;
    onUseAntidote: () => void;
    player: Player;
}

const ActionButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
    count?: number;
}> = ({ onClick, disabled, children, count }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="relative w-16 h-16 flex items-center justify-center bg-gray-700/80 text-4xl select-none disabled:bg-gray-800/80 disabled:text-gray-500 active:bg-lime-400 active:text-gray-900"
        style={{
            color: 'var(--color-text)',
            border: '2px solid var(--color-accent2)',
        }}
    >
        {children}
        {count !== undefined && (
            <span className="absolute bottom-0 right-1 text-lg font-bold" style={{ color: 'var(--color-accent2)'}}>
                {count}
            </span>
        )}
    </button>
);


export const ActionPanel: React.FC<ActionPanelProps> = ({ onFireArrow, onDropBomb, onUsePotion, onUseAntidote, player }) => {
    return (
        <div className="grid grid-cols-2 gap-1">
            <ActionButton onClick={onFireArrow} disabled={player.arrows <= 0} count={player.arrows}>🏹</ActionButton>
            <ActionButton onClick={onDropBomb} disabled={player.bombs <= 0} count={player.bombs}>💣</ActionButton>
            <ActionButton onClick={onUsePotion} disabled={player.potions <= 0} count={player.potions}>🧪</ActionButton>
            <ActionButton onClick={onUseAntidote} disabled={player.antidotes <= 0 || !player.isPoisoned} count={player.antidotes}>🍶</ActionButton>
        </div>
    );
};