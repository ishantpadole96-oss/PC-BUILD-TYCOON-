import React, { useState, useRef, useEffect } from 'react';
import { OS_SHORTCUTS } from './shortcutsConfig';

export function TerminalView() {
  const [history, setHistory] = useState([
    'Titan OS Terminal Version 1.0.0',
    '(c) TitanKart Corporation. All rights reserved.',
    '',
    'Type "help" to see a list of available commands.',
    ''
  ]);
  const [input, setInput] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [textColor, setTextColor] = useState('#0f0');
  const inputRef = useRef(null);
  const endRef = useRef(null);

  const availableCommands = [
    { name: 'help', desc: 'Shows this help message' },
    { name: 'clear', desc: 'Clears the terminal output' },
    { name: 'echo', desc: 'Echoes back your text (e.g. echo hello)' },
    { name: 'date', desc: 'Displays current date and time' },
    { name: 'whoami', desc: 'Displays current user' },
    { name: 'ping', desc: 'Sends packets to a network host (e.g. ping google.com)' },
    { name: 'systeminfo', desc: 'Displays system configuration' },
    { name: 'dir', desc: 'Displays a list of files and subdirectories in a directory' },
    { name: 'time', desc: 'Displays the current time' },
    { name: 'ipconfig', desc: 'Displays IP configuration' },
    { name: 'netstat', desc: 'Displays protocol statistics and current TCP/IP network connections' },
    { name: 'tracert', desc: 'Traces the route to a network host' },
    { name: 'tasklist', desc: 'Displays a list of currently running processes' },
    { name: 'vol', desc: 'Displays the disk volume label and serial number' },
    { name: 'ver', desc: 'Displays the Windows version' },
    { name: 'hostname', desc: 'Prints the name of the current host' },
    { name: 'color', desc: 'Sets the default console foreground color (e.g. color 0a)' },
    { name: 'tree', desc: 'Graphically displays the directory structure of a drive or path' },
    { name: 'calc', desc: 'Opens the Calculator' },
    { name: 'notepad', desc: 'Opens Notepad' },
    { name: 'exit', desc: 'Quits the CMD.EXE program' },
    { name: 'type', desc: 'Displays the contents of a text file' },
    { name: 'cd', desc: 'Displays the name of or changes the current directory' },
    { name: 'mkdir', desc: 'Creates a directory' },
    { name: 'format', desc: 'Formats a disk for use with Windows' },
    { name: 'shutdown', desc: 'Allows proper local or remote shutdown of machine' },
    { name: 'shortcuts', desc: 'Displays the global OS keyboard shortcuts' }
  ];

  const handleCommand = (cmdStr) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) {
      setHistory(prev => [...prev, `C:\\> ${trimmed}`]);
      return;
    }
    
    setHistory(prev => [...prev, `C:\\> ${trimmed}`]);
    
    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
      case 'help':
        setHistory(prev => [
          ...prev, 
          'Available commands:',
          ...availableCommands.map(c => `  ${c.name.padEnd(12)} - ${c.desc}`),
          ''
        ]);
        break;
      case 'clear':
      case 'cls':
        setHistory([]);
        break;
      case 'echo':
        setHistory(prev => [...prev, args, '']);
        break;
      case 'date':
        setHistory(prev => [...prev, new Date().toString(), '']);
        break;
      case 'whoami':
        setHistory(prev => [...prev, 'titan\\user', '']);
        break;
      case 'ping':
        if (!args) {
          setHistory(prev => [...prev, 'Usage: ping <host>', '']);
        } else {
          setHistory(prev => [
            ...prev, 
            `Pinging ${args} with 32 bytes of data:`,
            `Reply from ${args}: bytes=32 time=14ms TTL=118`,
            `Reply from ${args}: bytes=32 time=12ms TTL=118`,
            `Reply from ${args}: bytes=32 time=13ms TTL=118`,
            `Reply from ${args}: bytes=32 time=15ms TTL=118`,
            '',
            `Ping statistics for ${args}:`,
            `    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
            ''
          ]);
        }
        break;
      case 'systeminfo':
        setHistory(prev => [
          ...prev,
          'OS Name:                   Titan OS',
          'OS Version:                1.0.0',
          'System Manufacturer:       TitanKart',
          'System Type:               x64-based PC',
          'Processor(s):              1 Processor(s) Installed.',
          'BIOS Version:              TITAN 1.0.1, 09/19/2026',
          ''
        ]);
        break;
      case 'dir':
      case 'ls':
        setHistory(prev => [
          ...prev,
          ' Volume in drive C is TITAN',
          ' Volume Serial Number is 1337-CODE',
          '',
          ' Directory of C:\\',
          '',
          '09/19/2026  10:00 AM    <DIR>          Users',
          '09/19/2026  10:00 AM    <DIR>          Windows',
          '09/19/2026  10:00 AM    <DIR>          Program Files',
          '09/19/2026  10:00 AM                24 autoexec.bat',
          '               1 File(s)             24 bytes',
          '               3 Dir(s)  100,234,567,890 bytes free',
          ''
        ]);
        break;
      case 'time':
        setHistory(prev => [...prev, `The current time is: ${new Date().toLocaleTimeString()}`, '']);
        break;
      case 'ipconfig':
        setHistory(prev => [
          ...prev,
          'Windows IP Configuration',
          '',
          'Ethernet adapter Ethernet:',
          '',
          '   Connection-specific DNS Suffix  . :',
          '   Link-local IPv6 Address . . . . . : fe80::1234:5678:9abc:def0%12',
          '   IPv4 Address. . . . . . . . . . . : 192.168.1.100',
          '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . . . . . . : 192.168.1.1',
          ''
        ]);
        break;
      case 'netstat':
        setHistory(prev => [
          ...prev,
          'Active Connections',
          '',
          '  Proto  Local Address          Foreign Address        State',
          '  TCP    192.168.1.100:443      104.21.5.12:443        ESTABLISHED',
          '  TCP    192.168.1.100:80       192.168.1.1:80         TIME_WAIT',
          '  TCP    127.0.0.1:27015        0.0.0.0:0              LISTENING',
          ''
        ]);
        break;
      case 'tracert':
        setHistory(prev => [
          ...prev,
          `Tracing route to ${args || 'google.com'} over a maximum of 30 hops:`,
          '',
          '  1    <1 ms    <1 ms    <1 ms  192.168.1.1',
          '  2    10 ms    12 ms    11 ms  10.0.0.1',
          '  3    14 ms    13 ms    15 ms  172.16.254.1',
          '  4    20 ms    22 ms    21 ms  142.250.190.46',
          '',
          'Trace complete.',
          ''
        ]);
        break;
      case 'tasklist':
        setHistory(prev => [
          ...prev,
          'Image Name                     PID Session Name        Session#    Mem Usage',
          '========================= ======== ================ =========== ============',
          'System Idle Process              0 Services                   0          8 K',
          'System                           4 Services                   0        124 K',
          'Registry                       120 Services                   0     45,320 K',
          'TitanOS.exe                   1337 Console                    1    245,000 K',
          'cmd.exe                       9001 Console                    1      4,200 K',
          ''
        ]);
        break;
      case 'vol':
        setHistory(prev => [...prev, ' Volume in drive C is TITAN', ' Volume Serial Number is 1337-CODE', '']);
        break;
      case 'ver':
        setHistory(prev => [...prev, 'Titan OS [Version 1.0.0.0]', '']);
        break;
      case 'hostname':
        setHistory(prev => [...prev, 'TITAN-PC', '']);
        break;
      case 'color':
        if (args.length > 0) {
          const char = args.charAt(args.length - 1).toLowerCase();
          const colors = {
            '0': '#000000', '1': '#0000aa', '2': '#00aa00', '3': '#00aaaa',
            '4': '#aa0000', '5': '#aa00aa', '6': '#aaaa00', '7': '#aaaaaa',
            '8': '#555555', '9': '#5555ff', 'a': '#55ff55', 'b': '#55ffff',
            'c': '#ff5555', 'd': '#ff55ff', 'e': '#ffff55', 'f': '#ffffff'
          };
          if (colors[char]) {
            setTextColor(colors[char]);
            setHistory(prev => [...prev, 'Color changed.', '']);
          } else {
            setHistory(prev => [...prev, 'Color not found. Valid colors are 0-9, a-f.', '']);
          }
        } else {
          setTextColor('#0f0');
          setHistory(prev => [...prev, 'Color reset.', '']);
        }
        break;
      case 'tree':
        setHistory(prev => [
          ...prev,
          'Folder PATH listing',
          'Volume serial number is 1337-CODE',
          'C:.',
          '├───Users',
          '│   └───titan',
          '│       ├───Documents',
          '│       ├───Downloads',
          '│       └───Desktop',
          '├───Windows',
          '│   ├───System32',
          '│   └───Fonts',
          '└───Program Files',
          '    └───TitanKart',
          ''
        ]);
        break;
      case 'calc':
      case 'notepad':
        setHistory(prev => [...prev, `${command} cannot be opened from the command line in this simulated OS. Please use the GUI.`, '']);
        break;
      case 'shortcuts':
        const grouped = OS_SHORTCUTS.reduce((acc, s) => {
          if (!acc[s.type]) acc[s.type] = [];
          acc[s.type].push(s);
          return acc;
        }, {});
        
        const output = [
          '==================================================',
          '             TITAN OS KEYBOARD SHORTCUTS          ',
          '=================================================='
        ];

        for (const [type, shortcuts] of Object.entries(grouped)) {
          output.push('');
          output.push(` [ ${type.toUpperCase()} ]`);
          shortcuts.forEach(s => {
            output.push(`  ${s.key.padEnd(16)} : ${s.action}`);
          });
        }

        output.push('');
        output.push('==================================================');
        output.push('');
        
        setHistory(prev => [...prev, ...output]);
        break;
      case 'exit':
        setHistory(prev => [...prev, 'To exit, close the window using the "X" button.', '']);
        break;
      case 'type':
        setHistory(prev => [...prev, args ? 'Access denied.' : 'Usage: type <filename>', '']);
        break;
      case 'cd':
        setHistory(prev => [...prev, args ? `Access denied. Cannot change directory to ${args}.` : 'C:\\', '']);
        break;
      case 'mkdir':
        setHistory(prev => [...prev, args ? 'Access denied.' : 'Usage: mkdir <dirname>', '']);
        break;
      case 'format':
        setHistory(prev => [...prev, 'Access denied as you do not have sufficient privileges or the disk may be locked by another process.', '']);
        break;
      case 'shutdown':
        setHistory(prev => [...prev, 'Shutdown initiated... just kidding, you don\'t have privileges.', '']);
        break;
      default:
        setHistory(prev => [...prev, `'${command}' is not recognized as an internal or external command,`, 'operable program or batch file.', '']);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#000', color: textColor, fontFamily: 'monospace', fontSize: '14px', position: 'relative' }}>
      
      {/* Terminal Area */}
      <div 
        style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
        onClick={() => inputRef.current && inputRef.current.focus()}
      >
        {history.map((line, idx) => (
          <div key={idx} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{line}</div>
        ))}
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>C:\&gt;</span>
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#0f0', 
              fontFamily: 'monospace', 
              fontSize: '14px', 
              outline: 'none', 
              flex: 1 
            }}
            autoFocus
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div ref={endRef} />
      </div>

      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setShowCommands(!showCommands)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#333',
          color: '#fff',
          border: '1px solid #555',
          padding: '5px 15px',
          cursor: 'pointer',
          borderRadius: '4px',
          zIndex: 10,
          fontFamily: 'sans-serif',
          fontSize: '12px'
        }}
      >
        {showCommands ? 'Hide Commands' : 'Show Commands'}
      </button>

      {/* Sidebar / Tab */}
      {showCommands && (
        <div style={{
          width: '280px',
          background: '#111',
          borderLeft: '1px solid #333',
          padding: '20px',
          paddingTop: '50px',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.5)',
          overflowY: 'auto',
          fontFamily: 'sans-serif'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Available Commands</h3>
          {availableCommands.map((cmd, i) => (
            <div key={i} style={{ marginBottom: '15px' }}>
              <div style={{ color: '#0f0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{cmd.name}</div>
              <div style={{ color: '#aaa', fontSize: '12px', lineHeight: '1.4' }}>{cmd.desc}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
