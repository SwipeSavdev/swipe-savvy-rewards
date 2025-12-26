import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LIGHT_THEME, DARK_THEME } from '@design-system/theme';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof LIGHT_THEME;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    // Default to system preference if available
    if (systemColorScheme === 'dark') {
      setMode('dark');
    } else {
      setMode('light');
    }
    setIsInitialized(true);
  }, [systemColorScheme]);

  const colors = mode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextType = {
    mode,
    colors,
    setMode,
    toggleTheme,
  };

  // Don't render children until theme is initialized
  if (!isInitialized) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
