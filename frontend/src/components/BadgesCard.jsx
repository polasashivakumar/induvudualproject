import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useTheme } from '../context/ThemeContext'

const allBadges = [
  { id: 'first_task', name: 'First Task', icon: '🎯', desc: 'Complete your first task' },
  { id: 'five_tasks', name: 'Getting Started', icon: '🌟', desc: 'Complete 5 tasks' },
  { id: 'ten_tasks', name: 'Task Master', icon: '🏆', desc: 'Complete 10 tasks' },
  { id: 'twenty_tasks', name: 'Legend', icon: '👑', desc: 'Complete 20 tasks' },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', desc: 'Complete task within 1 hour' },
  { id: 'early_bird', name: 'Early Bird', icon: '🐦', desc: 'Submit before deadline' },
]

export default function BadgesCard() {
  const { colors } = useTheme()
  const [earned, setEarned] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/jobs/badges')
        setEarned(res.data.map(b => b.id))
      } catch {}
    }
    fetch()
    const onBadgesUpdated = (e) => {
      try {
        fetch()
      } catch {}
    }
    window.addEventListener('badges:updated', onBadgesUpdated)
    return () => window.removeEventListener('badges:updated', onBadgesUpdated)
  }, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.cardBorder}`,
      borderRadius: '20px', padding: isMobile ? '18px' : '24px', backdropFilter: 'blur(10px)',
      minWidth: 0,
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: colors.text, fontWeight: '700', fontSize: isMobile ? '15px' : '16px' }}>
          🏅 Achievement Badges
        </h3>
        <p style={{ color: colors.muted, fontSize: '12px', marginTop: '2px' }}>
          {earned.length}/{allBadges.length} earned
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
        {allBadges.map(badge => {
          const isEarned = earned.includes(badge.id)
          return (
            <div key={badge.id} style={{
              background: isEarned ? `rgba(245,158,11,0.08)` : colors.inputBg,
              border: `1px solid ${isEarned ? 'rgba(245,158,11,0.18)' : colors.inputBorder}`,
              borderRadius: '12px', padding: '14px 10px', textAlign: 'center',
              transition: 'all 0.2s', opacity: isEarned ? 1 : 0.9,
              filter: isEarned ? 'none' : 'grayscale(0)'
            }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '6px' }}>{badge.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: isEarned ? '#f59e0b' : colors.muted, marginBottom: '2px', lineHeight: 1.2 }}>
                {badge.name}
              </div>
              <div style={{ fontSize: '10px', color: colors.textMuted || '#374151', lineHeight: 1.3 }}>{badge.desc}</div>
              {isEarned && (
                <div style={{ marginTop: '6px', fontSize: '10px', color: colors.success, fontWeight: '600' }}>
                  ✅ Earned!
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}