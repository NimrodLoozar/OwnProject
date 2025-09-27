import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme modes: 'light', 'dark', 'system'
const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(THEME_MODES.SYSTEM);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to detect system preference
  const getSystemPreference = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  // Initialize theme from localStorage and user preferences
  useEffect(() => {
    // Try to get user preference first, then fall back to localStorage, then system
    const initTheme = async () => {
      try {
        const { useAuth } = await import('./AuthContext');
        const authContext = useAuth();
        if (authContext?.user?.theme_preference) {
          const userTheme = authContext.user.theme_preference;
          setThemeMode(userTheme);
          localStorage.setItem('themeMode', userTheme);
          return;
        }
      } catch (error) {
        // AuthContext not available yet, continue with localStorage
      }
      
      const savedTheme = localStorage.getItem('themeMode') || THEME_MODES.SYSTEM;
      setThemeMode(savedTheme);
    };
    
    initTheme();
  }, []);

  // Update theme when mode changes
  useEffect(() => {
    if (themeMode === THEME_MODES.SYSTEM) {
      setIsDarkMode(getSystemPreference());
    } else {
      setIsDarkMode(themeMode === THEME_MODES.DARK);
    }
  }, [themeMode]);

  // Listen to system theme changes when in system mode
  useEffect(() => {
    if (themeMode === THEME_MODES.SYSTEM && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => setIsDarkMode(e.matches);
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // Apply theme to document body
  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const setTheme = async (newThemeMode) => {
    setLoading(true);
    
    try {
      // Update local state immediately
      setThemeMode(newThemeMode);
      localStorage.setItem('themeMode', newThemeMode);
      
      // Try to update server if possible
      try {
        const { useAuth } = await import('./AuthContext');
        const authContext = useAuth();
        if (authContext?.user && authContext?.apiCall) {
          await authContext.apiCall(`/users/me/profile`, 'PUT', {
            theme_preference: newThemeMode
          });
          if (authContext.refreshUser) {
            await authContext.refreshUser();
          }
        }
      } catch (error) {
        console.warn('Could not save theme to server:', error);
        // Continue anyway - theme works locally
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
      // Revert local state if something failed
      const oldTheme = localStorage.getItem('themeMode') || THEME_MODES.SYSTEM;
      setThemeMode(oldTheme);
    } finally {
      setLoading(false);
    }
  };

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      ...(isDarkMode && {
        colorBgContainer: '#141414',
        colorBgElevated: '#1f1f1f',
        colorBorder: '#303030',
        colorText: 'rgba(255, 255, 255, 0.85)',
        colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
      }),
    },
  };

  const value = {
    themeMode,
    isDarkMode,
    loading,
    setTheme,
    THEME_MODES,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export { THEME_MODES };
export default ThemeProvider;