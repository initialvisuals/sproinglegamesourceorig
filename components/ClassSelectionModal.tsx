import React from 'react';
import { PLAYER_CLASSES } from '../constants';
import type { PlayerClass } from '../types';

interface ClassSelectionModalProps {
  onSelect: (choice: PlayerClass) => void;
}

const ClassChoiceButton: React.FC<{ playerClass: PlayerClass, onSelect: () => void }> = ({ playerClass, onSelect }) => {
    const classData = PLAYER_CLASSES[playerClass];
    return (
        <button 
            onClick={onSelect}
            className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 transition-colors"
            style={{border: '2px solid var(--color-accent2)'}}
        >
            <h3 className="text-xl font-bold" style={{color: 'var(--color-accent2)'}}>
                <span className="mr-2">{classData.icon}</span>{classData.name}
            </h3>
            <p className="text-xs mt-2" style={{color: 'var(--color-text)'}}>{classData.description}</p>
        </button>
    );
};

export const ClassSelectionModal: React.FC<ClassSelectionModalProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 shadow-2xl w-full max-w-md animate-[sproing-text-animation_0.4s_ease-out]" style={{border: '4px solid var(--color-accent1)', color: 'var(--color-accent2)', boxShadow: '0 0 25px var(--color-accent1)'}}>
        <h2 className="text-3xl text-center mb-6" style={{color: 'var(--color-accent1)'}}>Choose your Class</h2>
        <div className="space-y-4">
          <ClassChoiceButton playerClass="Knight" onSelect={() => onSelect('Knight')} />
          <ClassChoiceButton playerClass="Ranger" onSelect={() => onSelect('Ranger')} />
          <ClassChoiceButton playerClass="Sapper" onSelect={() => onSelect('Sapper')} />
        </div>
      </div>
    </div>
  );
};