import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    if (localStorage.getItem('theme') !== 'light') {
      localStorage.setItem('theme', 'light')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const colors = theme === 'dark' ? {
    bg: '#030712',
    bg2: '#0a0a1a',
    card: 'rgba(17,24,39,0.8)',
    cardBorder: 'rgba(255,255,255,0.08)',
    text: '#fff',
    textSecondary: '#9ca3af',
    textMuted: '#4b5563',
    navBg: 'rgba(5,5,15,0.95)',
    navBorder: 'rgba(124,58,237,0.15)',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.1)',
    rowHover: 'rgba(124,58,237,0.05)',
    rowAlt: 'rgba(255,255,255,0.01)',
  } : {
    bg: '#f8fafc',
    bg2: '#f1f5f9',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    navBg: '#ffffff',
    navBorder: '#e2e8f0',
    inputBg: '#f8fafc',
    inputBorder: '#cbd5e1',
    rowHover: '#f1f5f9',
    rowAlt: '#fafafa',
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)