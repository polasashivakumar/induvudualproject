import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useTheme } from '../context/ThemeContext'

export default function ActivityHeatmap() {
  const [data, setData] = useState({})
  const { colors } = useTheme()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/jobs/my')
        const counts = {}
        res.data.forEach(job => {
          const date = new Date(job.createdAt).toISOString().split('T')[0]
          counts[date] = (counts[date] || 0) + 1
        })
        setData(counts)
      } catch {}
    }
    fetch()
  }, [])

  // Generate last 52 weeks
  const weeks = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364)

  for (let w = 0; w < 53; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + w * 7 + d)
      if (date <= today) {
        const dateStr = date.toISOString().split('T')[0]
        week.push({ date: dateStr, count: data[dateStr] || 0 })
      } else {
        week.push(null)
      }
    }
    weeks.push(week)
  }

  const getColor = (count) => {
    if (count === 0) return colors.inputBg
    if (count === 1) return 'rgba(124,58,237,0.3)'
    if (count === 2) return 'rgba(124,58,237,0.5)'
    if (count === 3) return 'rgba(124,58,237,0.7)'
    return '#7c3aed'
  }

  const totalTasks = Object.values(data).reduce((a, b) => a + b, 0)
  const activeDays = Object.keys(data).length
  const maxStreak = (() => {
    const dates = Object.keys(data).sort()
    let max = 0, current = 0
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) { current = 1; continue }
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diff = (curr - prev) / (1000 * 60 * 60 * 24)
      if (diff === 1) { current++; max = Math.max(max, current) }
      else current = 1
    }
    return max
  })()

  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.cardBorder}`,
      borderRadius: '20px', padding: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ color: colors.text, fontWeight: '700', fontSize: '16px' }}>
            🗺️ Activity Heatmap
          </h3>
          <p style={{ color: colors.textMuted, fontSize: '12px', marginTop: '2px' }}>
            Task submissions over the past year
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Total', value: totalTasks, color: '#a78bfa' },
            { label: 'Active Days', value: activeDays, color: '#10b981' },
            { label: 'Best Streak', value: maxStreak, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: s.color, fontWeight: '800', fontSize: '18px' }}>{s.value}</div>
              <div style={{ color: colors.textMuted, fontSize: '10px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '3px', minWidth: 'fit-content' }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day ? `${day.date}: ${day.count} task${day.count !== 1 ? 's' : ''}` : ''}
                  style={{
                    width: '12px', height: '12px', borderRadius: '2px',
                    background: day ? getColor(day.count) : 'transparent',
                    border: day ? `1px solid ${colors.cardBorder}` : 'none',
                    cursor: day ? 'pointer' : 'default',
                    transition: 'transform 0.1s'
                  }}
                  onMouseOver={e => day && (e.currentTarget.style.transform = 'scale(1.4)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
        <span style={{ color: colors.textMuted, fontSize: '11px' }}>Less</span>
        {[0, 1, 2, 3, 4].map(l => (
          <div key={l} style={{
            width: '12px', height: '12px', borderRadius: '2px',
            background: getColor(l),
            border: `1px solid ${colors.cardBorder}`
          }} />
        ))}
        <span style={{ color: colors.textMuted, fontSize: '11px' }}>More</span>
      </div>
    </div>
  )
}