import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Navbar({ onNotifClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifCount, setNotifCount] = useState(0)
  const { theme, toggleTheme, colors } = useTheme()
  const { t, i18n } = useTranslation()

  const fetchNotifs = async () => {
    try {
      const res = await API.get('/jobs/notifications')
      setNotifCount(res.data.length)
    } catch {}
  }

  useEffect(() => {
    if (user?.role !== 'admin') {
      fetchNotifs()
      const interval = setInterval(fetchNotifs, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/login')
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
    toast.success(newLang === 'hi' ? 'हिंदी में बदला गया!' : 'Changed to English!')
  }

  return (
    <nav style={{
      background: colors.navBg,
      borderBottom: `1px solid ${colors.navBorder}`,
      padding: '0 32px', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
      transition: 'all 0.3s'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: '0 0 20px rgba(124,58,237,0.4)'
        }}>🎓</div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px', color: colors.text }}>
            College Task Queue
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Student Task Management
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Language toggle */}
        <button onClick={toggleLanguage} style={{
          background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
          borderRadius: '8px', padding: '6px 12px',
          color: colors.text, fontSize: '12px', fontWeight: '600',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif'
        }}>
          {i18n.language === 'en' ? '🇮🇳 हिं' : '🇬🇧 EN'}
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
          borderRadius: '8px', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s'
        }}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

        {/* Notification bell */}
        {user?.role !== 'admin' && (
          <button onClick={onNotifClick} style={{
            position: 'relative', background: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`, borderRadius: '10px',
            width: '38px', height: '38px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', transition: 'all 0.2s'
          }}>
            🔔
            {notifCount > 0 && (
              <div style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#ef4444', color: '#fff', borderRadius: '50%',
                width: '18px', height: '18px', fontSize: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', border: '2px solid #030712'
              }}>
                {notifCount}
              </div>
            )}
          </button>
        )}

        {/* User info */}
        <div style={{
          background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
          borderRadius: '10px', padding: '6px 12px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', color: '#fff'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: colors.text }}>{user?.name}</div>
            <div style={{ fontSize: '10px', color: colors.textMuted }}>
              {user?.role === 'admin' ? '👑 Admin' : user?.department || 'Student'}
            </div>
          </div>
        </div>

        <button onClick={handleLogout} style={{
          padding: '8px 16px', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
          color: '#f87171', fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif'
        }}>
          {t('logout')}
        </button>
      </div>
    </nav>
  )
}