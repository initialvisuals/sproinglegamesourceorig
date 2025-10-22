import React from 'react';

interface LevelUpModalProps {
  onChoice: (choice: 'hp' | 'attack') => void;
}

const ChoiceButton: React.FC<{ title: string, description: string, onClick: () => void }> = ({ title, description, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 transition-colors"
        style={{border: '2px solid var(--color-accent2)'}}
    >
        <h3 className="text-xl font-bold" style={{color: 'var(--color-accent2)'}}>{title}</h3>
        <p className="text-sm mt-1" style={{color: 'var(--color-text)'}}>{description}</p>
    </button>
);

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ onChoice }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 shadow-2xl w-full max-w-md animate-[sproing-text-animation_0.4s_ease-out]" style={{border: '4px solid var(--color-accent1)', color: 'var(--color-accent2)', boxShadow: '0 0 25px var(--color-accent1)'}}>
        <h2 className="text-3xl text-center mb-6" style={{color: 'var(--color-accent1)'}}>LEVEL UP!</h2>
        <p className="text-center mb-6">Choose an upgrade:</p>
        <div className="space-y-4">
          <ChoiceButton 
            title="Vigor" 
            description="+20 Maximum HP" 
            onClick={() => onChoice('hp')} 
          />
          <ChoiceButton 
            title="Strength" 
            description="+5 Attack" 
            onClick={() => onChoice('attack')} 
          />
        </div>
      </div>
    </div>
  );
};