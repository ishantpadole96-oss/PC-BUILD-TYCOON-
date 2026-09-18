export const DEFAULT_FS = {
  'C:': {
    type: 'dir',
    children: {
      'TitanOS': {
        type: 'dir',
        children: {
          'System32': { type: 'dir', children: {} },
          'boot.ini': { type: 'file', size: '12 KB', content: '[boot loader]\ntimeout=30\ndefault=multi(0)disk(0)rdisk(0)partition(1)\\WINDOWS' },
        }
      },
      'Users': {
        type: 'dir',
        children: {
          'Guest': {
            type: 'dir',
            children: {
              'Documents': { 
                type: 'dir', 
                children: { 
                  'passwords.txt': { type: 'file', size: '2 KB', content: 'admin123\npassword123' },
                  'todo_list.txt': { type: 'file', size: '1 KB', content: '- Buy more RAM\n- Clean the dust filter\n- Accept more orders' }
                } 
              },
              'Downloads': { 
                type: 'dir', 
                children: { 
                  'installer.exe': { type: 'file', size: '45 MB', content: 'MZ...' },
                  'game_patch.zip': { type: 'file', size: '120 MB', content: 'PK...' }
                } 
              },
              'Pictures': { 
                type: 'dir', 
                children: { 
                  'wallpaper.png': { type: 'file', size: '2.5 MB', content: '' },
                  'vacation.jpg': { type: 'file', size: '4.2 MB', content: '' }
                } 
              },
              'Music': {
                type: 'dir',
                children: {
                  'lofi_beats.mp3': { type: 'file', size: '12 MB', content: 'ID3...' }
                }
              },
              'Games': {
                type: 'dir',
                children: {
                  'CyberPunk.exe': { type: 'file', size: '65 GB', content: 'MZ...' }
                }
              }
            }
          }
        }
      }
    }
  }
};
