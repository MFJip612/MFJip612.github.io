import { useState, useEffect } from 'react';

const ModeToggle = () => {
  const [mode, setMode] = useState<'light' | 'dark' | 'auto'>(() => {
    const savedMode = localStorage.getItem('color-mode');
    return (savedMode as 'light' | 'dark' | 'auto') || 'auto';
  });

  useEffect(() => {
    // 应用主题
    const applyTheme = () => {
      if (mode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      } else {
        document.documentElement.classList.toggle('dark', mode === 'dark');
      }
    };

    applyTheme();
    localStorage.setItem('color-mode', mode);

    // 监听系统主题变化
    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode]);

  return (
    <div className="mode-toggle">
      <button 
        onClick={() => setMode('light')}
        className={`px-2 py-1 rounded ${mode === 'light' ? 'bg-primary text-white' : ''}`}
      >
        Light
      </button>
      <button 
        onClick={() => setMode('dark')}
        className={`px-2 py-1 rounded ${mode === 'dark' ? 'bg-primary text-white' : ''}`}
      >
        Dark
      </button>
      <button 
        onClick={() => setMode('auto')}
        className={`px-2 py-1 rounded ${mode === 'auto' ? 'bg-primary text-white' : ''}`}
      >
        Auto
      </button>
    </div>
  );
};

export default ModeToggle;