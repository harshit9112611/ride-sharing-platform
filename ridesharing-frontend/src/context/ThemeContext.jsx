import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const systemThemeQuery = '(prefers-color-scheme: dark)';
const themes = new Set(['light', 'dark', 'system']);

export function ThemeProvider({ children }) {
  const [theme, setCurrentTheme] = useState('system');
  const [systemIsDark, setSystemIsDark] = useState(() =>
    window.matchMedia(systemThemeQuery).matches
  );
  const isDark = theme === 'dark' || (theme === 'system' && systemIsDark);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (themes.has(storedTheme)) setCurrentTheme(storedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    if (theme !== 'system') return undefined;

    const mediaQuery = window.matchMedia(systemThemeQuery);
    const handleChange = (event) => setSystemIsDark(event.matches);
    setSystemIsDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (value) => {
    if (!themes.has(value)) return;
    localStorage.setItem('theme', value);
    setCurrentTheme(value);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
