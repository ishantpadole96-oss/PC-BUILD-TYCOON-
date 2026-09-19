import React, { useState } from 'react';

const GAME_WIDTH = 400;

export function TypingTest({ onBack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [textToType, setTextToType] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [finished, setFinished] = useState(false);
  
  const phrases = [
    "sudo apt-get update && sudo apt-get upgrade -y",
    "import React, { useState, useEffect } from 'react';",
    "const benchmark = runBenchmark(currentBuild, biosSettings);",
    "git commit -m \"Fixed bug in thermal throttling logic\"",
    "function evaluateCustomerSatisfaction(build, requirements) {"
  ];

  const startGame = () => {
    setTextToType(phrases[Math.floor(Math.random() * phrases.length)]);
    setUserInput("");
    setIsPlaying(true);
    setFinished(false);
    setStartTime(Date.now());
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setUserInput(val);
    
    if (val === textToType) {
      // Done!
      const timeTakenMinutes = (Date.now() - startTime) / 60000;
      const wordCount = textToType.split(" ").length;
      setWpm(Math.round(wordCount / timeTakenMinutes));
      setIsPlaying(false);
      setFinished(true);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0, color: 'white' }}>{finished ? `WPM: ${wpm}` : 'Typing Test'}</h2>
      </div>
      
      <div style={{ width: GAME_WIDTH, background: '#1e293b', borderRadius: '8px', padding: '20px', color: 'white', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
        {!isPlaying && !finished ? (
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <p>Type the code snippet as fast as possible.</p>
            <button onClick={startGame} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Start Test</button>
          </div>
        ) : finished ? (
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <h2>Test Complete!</h2>
            <h1 style={{ color: '#22c55e', fontSize: '48px', margin: '10px 0' }}>{wpm} WPM</h1>
            <button onClick={startGame} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Try Again</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '16px', lineHeight: '1.5' }}>
              {textToType.split('').map((char, i) => {
                let color = '#94a3b8';
                if (i < userInput.length) {
                  color = userInput[i] === char ? '#22c55e' : '#ef4444';
                }
                return <span key={i} style={{ color, backgroundColor: userInput[i] !== char && i < userInput.length ? 'rgba(239, 68, 68, 0.2)' : 'transparent' }}>{char}</span>;
              })}
            </div>
            
            <textarea
              autoFocus
              value={userInput}
              onChange={handleChange}
              style={{ width: '100%', height: '100px', background: '#334155', color: 'white', border: '1px solid #475569', borderRadius: '4px', padding: '10px', fontFamily: 'monospace', fontSize: '16px', outline: 'none' }}
              placeholder="Start typing..."
              spellCheck="false"
            />
          </div>
        )}
      </div>
    </div>
  );
}
