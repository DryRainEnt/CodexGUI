import { useEffect } from 'react';
import useThemeStore from '../store/themeStore';

/**
 * Hook to manage theme settings and apply them to the document
 * @returns Current theme and function to change theme
 */
export function useTheme() {
  const { theme, setTheme } = useThemeStore();
  
  useEffect(() => {
    const applyTheme = () => {
      const isDark = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      document.documentElement.classList.toggle('dark', isDark);
    };
    
    // Apply theme immediately
    applyTheme();
    
    // Listen for system theme changes if using system setting
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  
  return { theme, setTheme };
}

export default useTheme;
