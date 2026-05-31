import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'
import useSocket from '../hooks/useSocket'
import toast from 'react-hot-toast'

export default function Navbar({ onNotifClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifCount, setNotifCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { theme, toggleTheme, colors } = useTheme()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchNotifs = async () => {
    try {
      const res = await API.get('/jobs/notifications')
      setNotifCount(res.data.length)
    } catch {}
  }

  useEffect(() => { if (user?.role !== 'admin') fetchNotifs() }, [user])

  useSocket(user?.role !== 'admin' ? {
    events: {
      'job:completed': fetchNotifs,
      'job:failed': fetchNotifs,
      'job:updated': fetchNotifs
    }
  } : {})

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/login')
    setMenuOpen(false)
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
    toast.success(newLang === 'hi' ? 'हिंदी!' : 'English!')
  }

  return (
    <>
      <nav style={{
        background: colors.navBg,
        borderBottom: `1px solid ${colors.navBorder}`,
        padding: '0 16px', height: '60px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', boxShadow: '0 0 15px rgba(124,58,237,0.4)',
            flexShrink: 0
          }}>🎓</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: isMobile ? '13px' : '15px', color: colors.text }}>
              College Task Queue
            </div>
            {!isMobile && (
              <div style={{ fontSize: '10px', color: colors.textMuted }}>
                Student Task Management
              </div>
            )}
          </div>
        </div>

        {/* Desktop right */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={toggleLanguage} style={{
              background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
              borderRadius: '8px', padding: '6px 12px', color: colors.text,
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}>
              {i18n.language === 'en' ? '🇮🇳 हिं' : '🇬🇧 EN'}
            </button>

            <button onClick={toggleTheme} style={{
              background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
              borderRadius: '8px', width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', cursor: 'pointer'
            }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            {user?.role !== 'admin' && (
              <button onClick={onNotifClick} style={{
                position: 'relative', background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`, borderRadius: '8px',
                width: '34px', height: '34px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px'
              }}>
                🔔
                {notifCount > 0 && (
                  <div style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: '#ef4444', color: '#fff', borderRadius: '50%',
                    width: '16px', height: '16px', fontSize: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', border: '2px solid #030712'
                  }}>{notifCount}</div>
                )}
              </button>
            )}

            <div style={{
              background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
              borderRadius: '10px', padding: '5px 10px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', color: '#fff'
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
              padding: '7px 14px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
              color: '#f87171', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>
              {t('logout')}
            </button>
          </div>
        )}

        {/* Mobile right */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user?.role !== 'admin' && (
              <button onClick={onNotifClick} style={{
                position: 'relative', background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`, borderRadius: '8px',
                width: '34px', height: '34px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px'
              }}>
                🔔
                {notifCount > 0 && (
                  <div style={{
                    position: 'absolute', top: '-3px', right: '-3px',
                    background: '#ef4444', color: '#fff', borderRadius: '50%',
                    width: '14px', height: '14px', fontSize: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700'
                  }}>{notifCount}</div>
                )}
              </button>
            )}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
              borderRadius: '8px', width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '16px'
            }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0,
          background: colors.navBg, borderBottom: `1px solid ${colors.navBorder}`,
          zIndex: 99, padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
        }}>
          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px', background: 'rgba(124,58,237,0.1)',
            borderRadius: '12px', border: '1px solid rgba(124,58,237,0.2)'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ color: colors.text, fontWeight: '600', fontSize: '14px' }}>{user?.name}</div>
              <div style={{ color: colors.textMuted, fontSize: '12px' }}>{user?.email}</div>
              {user?.department && (
                <div style={{ color: '#a78bfa', fontSize: '11px' }}>
                  {user.department} {user.rollNumber ? `• ${user.rollNumber}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={toggleTheme} style={{
              padding: '10px', background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`, borderRadius: '10px',
              color: colors.text, fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>

            <button onClick={toggleLanguage} style={{
              padding: '10px', background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`, borderRadius: '10px',
              color: colors.text, fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>
              {i18n.language === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
            </button>
          </div>

          <button onClick={handleLogout} style={{
            padding: '12px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px',
            color: '#f87171', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif'
          }}>
            🚪 Logout
          </button>
        </div>
      )}
    </>
  )
}