import React from 'react';
import { useTranslation } from 'react-i18next';
import useTheme from '../../hooks/useTheme';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Theme toggle component for switching between light, dark and system themes
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 ${className}`} role="group" aria-label={t('common.themeToggle')}>
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
          theme === 'light' 
            ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        aria-pressed={theme === 'light'}
        aria-label={t('common.lightTheme')}
      >
        <SunIcon className="w-4 h-4 mr-1.5" />
        <span className="hidden sm:inline">{t('common.light')}</span>
      </button>
      
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
          theme === 'dark' 
            ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        aria-pressed={theme === 'dark'}
        aria-label={t('common.darkTheme')}
      >
        <MoonIcon className="w-4 h-4 mr-1.5" />
        <span className="hidden sm:inline">{t('common.dark')}</span>
      </button>
      
      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
          theme === 'system' 
            ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        aria-pressed={theme === 'system'}
        aria-label={t('common.systemTheme')}
      >
        <MonitorIcon className="w-4 h-4 mr-1.5" />
        <span className="hidden sm:inline">{t('common.system')}</span>
      </button>
    </div>
  );
};

export default ThemeToggle;
