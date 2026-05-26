import { useEffect, useState } from 'react'
import API from '../api/axios'

const allBadges = [
  { id: 'first_task', name: 'First Task', icon: '🎯', desc: 'Complete your first task' },
  { id: 'five_tasks', name: 'Getting Started', icon: '🌟', desc: 'Complete 5 tasks' },
  { id: 'ten_tasks', name: 'Task Master', icon: '🏆', desc: 'Complete 10 tasks' },
  { id: 'twenty_tasks', name: 'Legend', icon: '👑', desc: 'Complete 20 tasks' },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', desc: 'Complete task within 1 hour' },
  { id: 'early_bird', name: 'Early Bird', icon: '🐦', desc: 'Submit before deadline' },
]

export default function BadgesCard() {
  const [earned, setEarned] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/jobs/badges')
        setEarned(res.data.map(b => b.id))
      } catch {}
    }
    fetch()
  }, [])

  return (
    <div style={{
      background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
          🏅 Achievement Badges
        </h3>
        <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '2px' }}>
          {earned.length}/{allBadges.length} earned
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
        {allBadges.map(badge => {
          const isEarned = earned.includes(badge.id)
          return (
            <div key={badge.id} style={{
              background: isEarned ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isEarned ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '12px', padding: '14px 10px', textAlign: 'center',
              transition: 'all 0.2s', opacity: isEarned ? 1 : 0.4,
              filter: isEarned ? 'none' : 'grayscale(1)'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{badge.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: isEarned ? '#f59e0b' : '#4b5563', marginBottom: '2px' }}>
                {badge.name}
              </div>
              <div style={{ fontSize: '10px', color: '#374151' }}>{badge.desc}</div>
              {isEarned && (
                <div style={{ marginTop: '6px', fontSize: '10px', color: '#10b981', fontWeight: '600' }}>
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