import React from 'react';
import type { Direction } from '../types';

interface DpadProps {
  onMove: (direction: Direction) => void;
}

const ControlButton: React.FC<{
  direction: Direction;
  onClick: (direction: Direction) => void;
  children: React.ReactNode;
  gridArea: string;
}> = ({ direction, onClick, children, gridArea }) => {
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); onClick(direction); }}
      className={`w-14 h-14 flex items-center justify-center bg-gray-700/80 text-3xl active:bg-lime-400 active:text-gray-900 select-none`}
      style={{ 
        gridArea,
        color: 'var(--color-accent2)',
        border: '2px solid var(--color-accent2)',
      }}
      aria-label={`Move ${direction.replace('Arrow', '')}`}
    >
      {children}
    </button>
  );
};

export const Dpad: React.FC<DpadProps> = ({ onMove }) => {
  return (
    <div
      className="z-40 grid w-44 h-28"
      style={{
        gridTemplateAreas: `
          ". up ."
          "left down right"
        `,
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '2px',
      }}
    >
      <ControlButton direction="ArrowUp" onClick={onMove} gridArea="up">▲</ControlButton>
      <ControlButton direction="ArrowLeft" onClick={onMove} gridArea="left">◄</ControlButton>
      <ControlButton direction="ArrowRight" onClick={onMove} gridArea="right">►</ControlButton>
      <ControlButton direction="ArrowDown" onClick={onMove} gridArea="down">▼</ControlButton>
    </div>
  );
};