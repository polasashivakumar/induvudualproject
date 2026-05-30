import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Announcements({ isAdmin }) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', message: '', type: 'info' })
  const [posting, setPosting] = useState(false)
  const { colors } = useTheme()

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get('/announcements')
      setAnnouncements(res.data)
    } catch {}
    setLoading(false)
  }

  const postAnnouncement = async () => {
    if (!form.title || !form.message) return toast.error('Fill all fields!')
    setPosting(true)
    try {
      await API.post('/announcements', form)
      toast.success('📢 Announcement posted!')
      setForm({ title: '', message: '', type: 'info' })
      fetchAnnouncements()
    } catch { toast.error('Failed to post') }
    setPosting(false)
  }

  const deleteAnnouncement = async (id) => {
    try {
      await API.delete(`/announcements/${id}`)
      toast.success('Deleted!')
      fetchAnnouncements()
    } catch { toast.error('Failed') }
  }

  useEffect(() => {
    fetchAnnouncements()
    const interval = setInterval(fetchAnnouncements, 30000)
    return () => clearInterval(interval)
  }, [])

  const typeConfig = {
    info:    { icon: 'ℹ️', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)'  },
    warning: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
    success: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.2)'  },
    urgent:  { icon: '🚨', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.2)'   },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Post form (admin only) */}
      {isAdmin && (
        <div style={{
          background: colors.card, border: `1px solid ${colors.cardBorder}`,
          borderRadius: '20px', padding: '24px'
        }}>
          <h3 style={{ color: colors.text, fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
            📢 Post Announcement
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title..."
              style={{
                background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
                borderRadius: '10px', padding: '11px 14px',
                color: colors.text, fontSize: '14px', outline: 'none',
                fontFamily: 'Inter, sans-serif'
              }}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = colors.inputBorder}
            />
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Write your announcement..."
              rows={3}
              style={{
                background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
                borderRadius: '10px', padding: '11px 14px',
                color: colors.text, fontSize: '14px', outline: 'none',
                fontFamily: 'Inter, sans-serif', resize: 'vertical'
              }}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = colors.inputBorder}
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(typeConfig).map(([type, config]) => (
                <button key={type} onClick={() => setForm({ ...form, type })} style={{
                  padding: '7px 14px', borderRadius: '8px', border: 'none',
                  background: form.type === type ? config.bg : colors.inputBg,
                  borderWidth: '1px', borderStyle: 'solid',
                  borderColor: form.type === type ? config.border : colors.inputBorder,
                  color: form.type === type ? config.color : colors.textMuted,
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {config.icon} {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
              <button onClick={postAnnouncement} disabled={posting} style={{
                marginLeft: 'auto', padding: '7px 20px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', borderRadius: '8px', color: '#fff',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
              }}>
                {posting ? 'Posting...' : '📢 Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements list */}
      <div style={{
        background: colors.card, border: `1px solid ${colors.cardBorder}`,
        borderRadius: '20px', overflow: 'hidden'
      }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${colors.cardBorder}` }}>
          <h3 style={{ color: colors.text, fontWeight: '700', fontSize: '16px' }}>
            📢 Announcements
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>Loading...</div>
        ) : announcements.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
            <p style={{ color: colors.textMuted }}>No announcements yet</p>
          </div>
        ) : (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcements.map(a => {
              const tc = typeConfig[a.type] || typeConfig.info
              return (
                <div key={a._id} style={{
                  background: tc.bg, border: `1px solid ${tc.border}`,
                  borderLeft: `4px solid ${tc.color}`,
                  borderRadius: '12px', padding: '14px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '16px' }}>{tc.icon}</span>
                        <span style={{ color: colors.text, fontWeight: '700', fontSize: '14px' }}>
                          {a.title}
                        </span>
                      </div>
                      <p style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: 1.6, marginBottom: '8px' }}>
                        {a.message}
                      </p>
                      <p style={{ color: colors.textMuted, fontSize: '11px' }}>
                        📅 {new Date(a.createdAt).toLocaleString()} • By Admin
                      </p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => deleteAnnouncement(a._id)} style={{
                        marginLeft: '12px', padding: '4px 10px', flexShrink: 0,
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '6px', color: '#f87171',
                        fontSize: '11px', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif', fontWeight: '600'
                      }}>🗑️</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}