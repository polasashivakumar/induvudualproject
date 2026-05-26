import { useEffect, useState } from 'react'
import API from '../api/axios'

export default function StatsCards({ onStatsLoad }) {
  const [stats, setStats] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchStats = async () => {
    try {
      const res = await API.get('/jobs/stats')
      setStats(res.data)
      setLastUpdated(new Date().toLocaleTimeString())
      onStatsLoad?.(res.data)
    } catch {}
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 3000)
    return () => clearInterval(interval)
  }, [])

  const cards = [
    { label: 'Total Tasks', value: stats.total, icon: '📋', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)' },
    { label: 'Waiting', value: stats.waiting, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    { label: 'Processing', value: stats.active, icon: '⚙️', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
    { label: 'Completed', value: stats.completed, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    { label: 'Failed', value: stats.failed, icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>📈 Overview</h3>
        {lastUpdated && (
          <span style={{ fontSize: '11px', color: '#374151' }}>🔄 {lastUpdated}</span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
        {cards.map(({ label, value, icon, color, bg, border }) => (
          <div key={label} style={{
            background: bg, border: `1px solid ${border}`,
            borderRadius: '16px', padding: '18px 16px',
            transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
          }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = `0 8px 25px ${border}`
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color, lineHeight: 1 }}>
              {value ?? 0}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', fontWeight: '500' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}