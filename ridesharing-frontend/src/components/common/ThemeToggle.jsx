import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-surface-hover dark:text-gray-300 dark:hover:bg-gray-700"
      title={isDark ? 'Use light theme' : 'Use dark theme'}
      aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
