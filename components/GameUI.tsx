import React, { useState, useEffect } from 'react';

interface GameUIProps {
  message: string;
}

export const GameUI: React.FC<GameUIProps> = ({ message }) => {
  const [displayedMessage, setDisplayedMessage] = useState(message);
  
  useEffect(() => {
    setDisplayedMessage(message);
  }, [message]);

  return (
    <div className="absolute top-0 left-0 w-full p-2 bg-black/75 z-20 pointer-events-none">
      <p className="text-center text-xs sm:text-sm md:text-base truncate" style={{color: 'var(--color-accent1)'}}>
        {displayedMessage}
      </p>
    </div>
  );
};