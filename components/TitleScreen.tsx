import React from 'react';

interface TitleScreenProps {
  onStart: () => void;
  onSettings: () => void;
}

const TitleButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-full text-gray-900 px-8 py-4 font-bold hover:opacity-90 active:scale-95 transform transition-all text-xl border-2"
    style={{ backgroundColor: 'var(--color-accent2)', borderColor: 'var(--color-accent1)' }}
  >
    {children}
  </button>
);

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onSettings }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 animate-[sproing-text-animation_0.5s_ease-out]">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
        Sproingle
      </h1>
      <p className="text-lg mb-8" style={{ color: 'var(--color-accent1)' }}>
        A Crunchy Rogue-lite
      </p>

      <div className="text-8xl my-8 animate-pulse">
        💀
      </div>
      
      <div className="w-full max-w-xs space-y-4">
        <TitleButton onClick={onStart}>Start</TitleButton>
        <TitleButton onClick={onSettings}>Settings</TitleButton>
      </div>
    </div>
  );
};