import React, { useState, useEffect } from 'react';

const GAME_WIDTH = 400;

export function MemoryMatch({ onBack }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  const emojis = ['💻', '🖱️', '⌨️', '🖥️', '🎧', '🎮', '🔋', '🔌'];

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipped([]);
    setMatched([]);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0, color: 'white' }}>Pairs: {matched.length / 2} / 8</h2>
      </div>
      <div style={{ width: GAME_WIDTH, height: GAME_WIDTH, background: '#1e293b', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '10px', borderRadius: '8px' }}>
        {cards.map((emoji, i) => {
          const isRevealed = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleCardClick(i)}
              style={{
                background: isRevealed ? '#3b82f6' : '#334155',
                border: 'none', fontSize: '32px', cursor: 'pointer', borderRadius: '4px',
                transition: 'background 0.3s'
              }}
            >
              {isRevealed ? emoji : '❓'}
            </button>
          );
        })}
      </div>
      {matched.length === 16 && (
        <button onClick={initGame} style={{ marginTop: '20px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Play Again</button>
      )}
    </div>
  );
}
