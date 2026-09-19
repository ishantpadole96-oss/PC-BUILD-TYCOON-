import React, { useState } from 'react';

const GAME_WIDTH = 400;

export function TicTacToe({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (calculateWinner(board) || board[i]) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0, color: 'white' }}>{winner ? `Winner: ${winner}` : isDraw ? 'Draw!' : `Next: ${xIsNext ? 'X' : 'O'}`}</h2>
      </div>
      <div style={{ width: GAME_WIDTH, height: GAME_WIDTH, background: '#1e293b', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', padding: '5px', borderRadius: '8px' }}>
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            style={{ background: '#334155', border: 'none', fontSize: '48px', color: cell === 'X' ? '#ef4444' : '#3b82f6', cursor: 'pointer', borderRadius: '4px' }}
          >
            {cell}
          </button>
        ))}
      </div>
      <button onClick={() => { setBoard(Array(9).fill(null)); setXIsNext(true); }} style={{ marginTop: '20px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Restart Game</button>
    </div>
  );
}
