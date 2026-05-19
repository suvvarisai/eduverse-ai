import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Apply background to document body so no white flash ever occurs
  useEffect(() => {
    document.body.style.background = isDark ? '#020314' : '#f8fafc';
    document.body.style.color = isDark ? '#ffffff' : '#0f172a';
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
