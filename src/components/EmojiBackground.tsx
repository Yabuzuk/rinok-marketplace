import React, { useEffect, useState } from 'react';

const EmojiBackground: React.FC = () => {
  const [emojis, setEmojis] = useState<Array<{ emoji: string; x: number; y: number; rotation: number }>>([]);

  const emojiList = [
    '🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🫐', '🍈', '🍑', '🍒',
    '🥕', '🌽', '🥒', '🥬', '🥦', '🧄', '🧅', '🍅', '🫑', '🥔',
    '🍆', '🥑', '🌶️', '🫒', '🥜', '🌰'
  ];

  useEffect(() => {
    const generateEmojis = () => {
      const newEmojis = [];
      const density = Math.floor((window.innerWidth * window.innerHeight) / 10000); // Плотность эмодзи
      
      for (let i = 0; i < density; i++) {
        newEmojis.push({
          emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 360
        });
      }
      
      setEmojis(newEmojis);
    };

    generateEmojis();
    
    const handleResize = () => {
      generateEmojis();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: -1,
      overflow: 'hidden'
    }}>
      {emojis.map((item, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: '32px',
            opacity: 0.15,
            transform: `rotate(${item.rotation}deg)`,
            userSelect: 'none',
            filter: 'sepia(60%) saturate(80%) hue-rotate(25deg) brightness(1.1)'
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
};

export default EmojiBackground;