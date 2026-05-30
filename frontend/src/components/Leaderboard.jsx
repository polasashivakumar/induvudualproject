import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { colors } = useTheme()
  const { user } = useAuth()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/jobs/leaderboard')
        setData(res.data)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.cardBorder}`,
      borderRadius: '20px', overflow: 'hidden'
    }}>
      <div style={{
        padding: '20px 24px', borderBottom: `1px solid ${colors.cardBorder}`,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.05))'
      }}>
        <h3 style={{ color: colors.text, fontWeight: '700', fontSize: '16px' }}>
          🏆 Student Leaderboard
        </h3>
        <p style={{ color: colors.textMuted, fontSize: '12px', marginTop: '2px' }}>
          Top students by task completion
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
          Loading...
        </div>
      ) : data.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
          No data yet
        </div>
      ) : (
        <div>
          {data.map((item, i) => {
            const isMe = item.userId === user?._id
            return (
              <div key={i} style={{
                padding: '14px 20px',
                borderBottom: `1px solid ${colors.cardBorder}`,
                display: 'flex', alignItems: 'center', gap: '14px',
                background: isMe
                  ? 'rgba(124,58,237,0.08)'
                  : i % 2 === 0 ? 'transparent' : colors.rowAlt,
                transition: 'background 0.15s'
              }}>
                {/* Rank */}
                <div style={{
                  width: '36px', height: '36px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i < 3 ? '22px' : '14px',
                  fontWeight: '800',
                  color: i < 3 ? undefined : colors.textMuted,
                  background: i >= 3 ? colors.inputBg : 'transparent',
                  borderRadius: '50%'
                }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${
                    i === 0 ? '#f59e0b, #d97706' :
                    i === 1 ? '#9ca3af, #6b7280' :
                    i === 2 ? '#b45309, #92400e' :
                    '#7c3aed, #4f46e5'
                  })`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: '700', color: '#fff'
                }}>
                  {item.name?.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: isMe ? '#a78bfa' : colors.text,
                    fontWeight: '600', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    {item.name}
                    {isMe && (
                      <span style={{
                        fontSize: '10px', background: 'rgba(124,58,237,0.2)',
                        color: '#a78bfa', padding: '1px 6px', borderRadius: '4px'
                      }}>You</span>
                    )}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '11px', marginTop: '2px' }}>
                    {item.department} • {item.completed} tasks completed
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: '#10b981', fontWeight: '800', fontSize: '18px' }}>
                    {item.completionRate}%
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '10px' }}>
                    {item.completed}/{item.total}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '60px', flexShrink: 0 }}>
                  <div style={{ height: '6px', background: colors.inputBg, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${item.completionRate}%`,
                      background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : '#7c3aed',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}