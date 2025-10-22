import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  buttonText: string;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose, buttonText }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 shadow-2xl w-full max-w-md animate-[sproing-text-animation_0.4s_ease-out]" style={{border: '4px solid var(--color-accent1)', color: 'var(--color-accent2)', boxShadow: '0 0 25px var(--color-accent1)'}}>
        <h2 className="text-3xl text-center mb-6" style={{color: 'var(--color-accent1)'}}>{title}</h2>
        <div>{children}</div>
        <div className="mt-8 text-center">
          <button 
            onClick={onClose}
            className="text-gray-900 px-8 py-3 font-bold hover:opacity-90 active:scale-95 transform transition-all border-2"
            style={{backgroundColor: 'var(--color-accent2)', borderColor: 'var(--color-accent1)'}}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};