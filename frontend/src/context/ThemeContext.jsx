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
    bg: '#f6f8fb',
    bg2: '#f3f5ff',
    card: '#ffffff',
    cardBorder: 'rgba(99,102,241,0.08)',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#6b7280',
    navBg: 'linear-gradient(90deg,#efe8ff,#f8fbff)',
    navBorder: 'rgba(99,102,241,0.12)',
    inputBg: '#ffffff',
    inputBorder: '#e6e9f2',
    rowHover: '#f3f4f6',
    rowAlt: '#fbfbfe',
    primary: '#7c3aed',
    primarySoftBg: 'rgba(124,58,237,0.08)',
    primarySoftBorder: 'rgba(124,58,237,0.15)',
    accentGradient: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(79,70,229,0.08))',
    softPurple: '#a78bfa',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    lightOnPrimary: '#ffffff'
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)