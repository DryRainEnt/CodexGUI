import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import useThemeStore from './store/themeStore';

// Pages
import Launch from './pages/Launch';
import Projects from './pages/Projects';
import Project from './pages/Project';

function App() {
  // i18n 변수 제거하고 t 함수만 가져옴
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  
  // Apply theme class to document
  useEffect(() => {
    // If theme is 'system', check system preference
    if (theme === 'system') {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDarkMode);
      
      // Add listener for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Apply theme directly
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/launch" replace />} />
      <Route path="/launch" element={<Launch />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/project/:id" element={<Project />} />
    </Routes>
  );
}

export default App;
