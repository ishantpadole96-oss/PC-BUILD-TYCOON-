import React, { useState } from 'react';
import './VirtualOS.css';

export function MiniGameView() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
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
  
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = "Draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="mini-game-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', width: '100%', height: '100%' }}>
      <h2 style={{ marginBottom: '20px', color: '#38bdf8' }}>TitanOS Tic-Tac-Toe</h2>
      
      <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>{status}</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', background: '#334155', padding: '5px', borderRadius: '8px' }}>
        {board.map((square, i) => (
          <button 
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: '80px', height: '80px', fontSize: '32px', fontWeight: 'bold',
              background: '#1e293b', color: square === 'X' ? '#ef4444' : '#38bdf8',
              border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}
          >
            {square}
          </button>
        ))}
      </div>
      
      <button 
        onClick={resetGame}
        style={{ marginTop: '30px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Restart Game
      </button>
    </div>
  );
}
