import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useTheme } from '../context/ThemeContext'

export default function StatsCards({ onStatsLoad }) {
  const [stats, setStats] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { colors } = useTheme()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    { label: 'Total', value: stats.total, icon: '📋', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)' },
    { label: 'Waiting', value: stats.waiting, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    { label: 'Active', value: stats.active, icon: '⚙️', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
    { label: 'Done', value: stats.completed, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    { label: 'Failed', value: stats.failed, icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ color: colors.text, fontWeight: '700', fontSize: '15px' }}>📈 Overview</h3>
        {lastUpdated && (
          <span style={{ fontSize: '11px', color: colors.textMuted }}>🔄 {lastUpdated}</span>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))',
        gap: isMobile ? '10px' : '12px'
      }}>
        {cards.map(({ label, value, icon, color, bg, border }) => (
          <div key={label} style={{
            background: bg, border: `1px solid ${border}`,
            borderRadius: '14px', padding: isMobile ? '12px 8px' : '18px 16px',
            transition: 'transform 0.2s', cursor: 'default', textAlign: 'center'
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: isMobile ? '18px' : '22px', marginBottom: '6px' }}>{icon}</div>
            <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color, lineHeight: 1 }}>
              {value ?? 0}
            </div>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: colors.textMuted, marginTop: '4px', fontWeight: '500' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}