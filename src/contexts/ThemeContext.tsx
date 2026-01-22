import React, { createContext, useContext, useState } from 'react';
import { DARK_THEME, LIGHT_THEME } from '../design-system/theme';

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
  // Always use light mode as the app was designed for light theme
  // The app doesn't currently support dark mode - all screens use light colors
  const [mode, setMode] = useState<ThemeMode>('light');

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

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
