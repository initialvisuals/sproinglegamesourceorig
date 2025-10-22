import React from 'react';
import { SHOP_ITEMS } from '../constants';

interface ShopModalProps {
  playerGold: number;
  onBuy: (item: typeof SHOP_ITEMS[number]) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ playerGold, onBuy, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 shadow-2xl w-full max-w-lg animate-[sproing-text-animation_0.4s_ease-out]" style={{border: '4px solid var(--color-accent1)', color: 'var(--color-accent2)', boxShadow: '0 0 25px var(--color-accent1)'}}>
        <h2 className="text-3xl text-center mb-2" style={{color: 'var(--color-accent1)'}}>Wizard's Wares</h2>
        <p className="text-center mb-4">"Greetings, traveler. Care to trade coin for curios?"</p>
        <p className="text-center mb-6 text-xl" style={{color: 'var(--color-accent2)'}}>Your Gold: {playerGold} 💰</p>
        
        <div className="space-y-3">
            {SHOP_ITEMS.map((item, index) => {
                const canAfford = playerGold >= item.cost;
                return (
                    <div key={index} className="flex justify-between items-center bg-black/30 p-3">
                        <div>
                            <span className="text-2xl mr-3">{item.emoji}</span>
                            <span className="text-lg">{item.name}</span>
                        </div>
                        <button
                            onClick={() => onBuy(item)}
                            disabled={!canAfford}
                            className="text-gray-900 font-bold px-4 py-2 hover:opacity-90 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed active:scale-95 transition-transform border-2 disabled:border-gray-700"
                            style={{
                                backgroundColor: canAfford ? 'var(--color-accent2)' : undefined,
                                borderColor: canAfford ? 'var(--color-accent1)' : undefined
                            }}
                        >
                            {item.cost} G
                        </button>
                    </div>
                )
            })}
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={onClose}
            className="text-gray-900 px-8 py-3 font-bold hover:opacity-90 active:scale-95 transform transition-all border-2"
            style={{backgroundColor: 'var(--color-accent2)', borderColor: 'var(--color-accent1)'}}
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};