import React, { useState, useEffect } from 'react';

export function CalculatorView() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);
  const [lastOperator, setLastOperator] = useState(null);
  const [previousValue, setPreviousValue] = useState(null);

  const handleNumber = (num) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (operator) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
      setEquation(`${current} ${operator}`);
    } else if (lastOperator) {
      const result = calculate(previousValue, current, lastOperator);
      setPreviousValue(result);
      setDisplay(String(result));
      setEquation(`${result} ${operator}`);
    }
    
    setLastOperator(operator);
    setIsNewNumber(true);
  };

  const calculate = (a, b, op) => {
    switch(op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? 'Error' : a / b;
      default: return b;
    }
  };

  const handleEqual = () => {
    if (!lastOperator || previousValue === null) return;
    
    const current = parseFloat(display);
    const result = calculate(previousValue, current, lastOperator);
    
    setDisplay(String(result));
    setEquation('');
    setPreviousValue(null);
    setLastOperator(null);
    setIsNewNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setPreviousValue(null);
    setLastOperator(null);
    setIsNewNumber(true);
  };

  const handleDecimal = () => {
    if (isNewNumber) {
      setDisplay('0.');
      setIsNewNumber(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleDelete = () => {
    if (isNewNumber) return;
    if (display.length === 1) {
      setDisplay('0');
      setIsNewNumber(true);
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent handling if user is typing in some other input elsewhere in the OS
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleClear();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        handleOperator(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, isNewNumber, lastOperator, previousValue, equation]);

  const btnStyle = {
    background: '#222',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '4px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.1s',
  };

  const operatorStyle = { ...btnStyle, background: '#a200ff', border: '1px solid #c85eff' };
  const actionStyle = { ...btnStyle, background: '#444' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* Display */}
      <div style={{ background: '#1a1a1a', padding: '20px', borderBottom: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minHeight: '100px' }}>
        <div style={{ color: '#888', fontSize: '14px', minHeight: '20px' }}>{equation}</div>
        <div style={{ fontSize: '36px', fontWeight: 'bold', wordBreak: 'break-all' }}>{display}</div>
      </div>

      {/* Keypad */}
      <div style={{ flex: 1, padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        
        {/* Row 1 */}
        <button style={actionStyle} onClick={handleClear} onMouseEnter={e => e.target.style.background='#555'} onMouseLeave={e => e.target.style.background='#444'}>C</button>
        <button style={actionStyle} onClick={handleDelete} onMouseEnter={e => e.target.style.background='#555'} onMouseLeave={e => e.target.style.background='#444'}>⌫</button>
        <button style={operatorStyle} onClick={() => handleOperator('/')} onMouseEnter={e => e.target.style.background='#c85eff'} onMouseLeave={e => e.target.style.background='#a200ff'}>÷</button>
        <button style={operatorStyle} onClick={() => handleOperator('*')} onMouseEnter={e => e.target.style.background='#c85eff'} onMouseLeave={e => e.target.style.background='#a200ff'}>×</button>
        
        {/* Row 2 */}
        <button style={btnStyle} onClick={() => handleNumber('7')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>7</button>
        <button style={btnStyle} onClick={() => handleNumber('8')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>8</button>
        <button style={btnStyle} onClick={() => handleNumber('9')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>9</button>
        <button style={operatorStyle} onClick={() => handleOperator('-')} onMouseEnter={e => e.target.style.background='#c85eff'} onMouseLeave={e => e.target.style.background='#a200ff'}>−</button>
        
        {/* Row 3 */}
        <button style={btnStyle} onClick={() => handleNumber('4')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>4</button>
        <button style={btnStyle} onClick={() => handleNumber('5')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>5</button>
        <button style={btnStyle} onClick={() => handleNumber('6')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>6</button>
        <button style={operatorStyle} onClick={() => handleOperator('+')} onMouseEnter={e => e.target.style.background='#c85eff'} onMouseLeave={e => e.target.style.background='#a200ff'}>+</button>
        
        {/* Row 4 */}
        <button style={btnStyle} onClick={() => handleNumber('1')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>1</button>
        <button style={btnStyle} onClick={() => handleNumber('2')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>2</button>
        <button style={btnStyle} onClick={() => handleNumber('3')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>3</button>
        <button style={{...operatorStyle, gridRow: 'span 2'}} onClick={handleEqual} onMouseEnter={e => e.target.style.background='#c85eff'} onMouseLeave={e => e.target.style.background='#a200ff'}>=</button>
        
        {/* Row 5 */}
        <button style={{...btnStyle, gridColumn: 'span 2'}} onClick={() => handleNumber('0')} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>0</button>
        <button style={btnStyle} onClick={handleDecimal} onMouseEnter={e => e.target.style.background='#333'} onMouseLeave={e => e.target.style.background='#222'}>.</button>
        
      </div>
    </div>
  );
}
