import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useTheme } from '../context/ThemeContext'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const typeColors = {
  assignment:      '#7c3aed',
  lab_report:      '#06b6d4',
  project_review:  '#f59e0b',
  library_request: '#10b981',
  print_request:   '#ef4444',
}

export default function CalendarView() {
  const [jobs, setJobs] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const { colors } = useTheme()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/jobs/my')
        setJobs(res.data.filter(j => j.dueDate))
      } catch {}
    }
    fetch()
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getJobsForDay = (day) => {
    return jobs.filter(j => {
      const d = new Date(j.dueDate)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const today = new Date()
  const isToday = (day) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const selectedJobs = selectedDay ? getJobsForDay(selectedDay) : []

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
      {/* Calendar */}
      <div style={{
        background: colors.card, border: `1px solid ${colors.cardBorder}`,
        borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={prevMonth} style={{
            background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
            borderRadius: '8px', padding: '8px 14px', color: colors.text,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '600'
          }}>←</button>
          <h3 style={{ color: colors.text, fontWeight: '700', fontSize: '18px' }}>
            {MONTHS[month]} {year}
          </h3>
          <button onClick={nextMonth} style={{
            background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
            borderRadius: '8px', padding: '8px 14px', color: colors.text,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '600'
          }}>→</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '8px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', color: colors.textMuted, fontSize: '12px', fontWeight: '600', padding: '4px' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ aspectRatio: '1', borderRadius: '10px' }} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayJobs = getJobsForDay(day)
            const isSelected = selectedDay === day
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{
                  aspectRatio: '1', borderRadius: '10px', padding: '4px',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'flex-start',
                  background: isSelected
                    ? 'rgba(124,58,237,0.3)'
                    : isToday(day)
                    ? 'rgba(124,58,237,0.15)'
                    : 'transparent',
                  border: isToday(day)
                    ? '1px solid rgba(124,58,237,0.5)'
                    : isSelected
                    ? '1px solid rgba(124,58,237,0.6)'
                    : `1px solid transparent`,
                  transition: 'all 0.15s',
                  opacity: isPast && dayJobs.length === 0 ? 0.4 : 1
                }}
                onMouseOver={e => {
                  if (!isSelected && !isToday(day))
                    e.currentTarget.style.background = colors.rowHover
                }}
                onMouseOut={e => {
                  if (!isSelected && !isToday(day))
                    e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{
                  fontSize: '13px', fontWeight: isToday(day) ? '800' : '500',
                  color: isToday(day) ? '#a78bfa' : isSelected ? '#fff' : colors.text
                }}>
                  {day}
                </span>
                {/* Task dots */}
                {dayJobs.length > 0 && (
                  <div style={{ display: 'flex', gap: '2px', marginTop: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {dayJobs.slice(0, 3).map((j, ji) => (
                      <div key={ji} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: typeColors[j.type] || '#7c3aed'
                      }} />
                    ))}
                    {dayJobs.length > 3 && (
                      <span style={{ fontSize: '8px', color: colors.textMuted }}>+{dayJobs.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${colors.cardBorder}` }}>
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'capitalize' }}>
                {type.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div style={{
        background: colors.card, border: `1px solid ${colors.cardBorder}`,
        borderRadius: '20px', padding: '20px'
      }}>
        <h3 style={{ color: colors.text, fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>
          {selectedDay
            ? `📅 ${MONTHS[month]} ${selectedDay}`
            : '📅 Select a day'}
        </h3>

        {!selectedDay ? (
          <div>
            <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '16px' }}>
              Click any date to see tasks due that day
            </p>
            {/* Upcoming tasks */}
            <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Upcoming Tasks
            </p>
            {jobs
              .filter(j => new Date(j.dueDate) >= today)
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .slice(0, 5)
              .map(j => (
                <div key={j._id} style={{
                  padding: '10px 12px', background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderLeft: `3px solid ${typeColors[j.type]}`,
                  borderRadius: '8px', marginBottom: '8px'
                }}>
                  <div style={{ color: colors.text, fontWeight: '600', fontSize: '12px' }}>{j.title}</div>
                  <div style={{ color: colors.textMuted, fontSize: '11px', marginTop: '2px' }}>
                    Due: {new Date(j.dueDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            }
          </div>
        ) : selectedJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: colors.textMuted }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            No tasks due this day
          </div>
        ) : (
          selectedJobs.map(j => (
            <div key={j._id} style={{
              padding: '12px', background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              borderLeft: `3px solid ${typeColors[j.type]}`,
              borderRadius: '10px', marginBottom: '10px'
            }}>
              <div style={{ color: colors.text, fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                {j.title}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px',
                  background: j.state === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: j.state === 'completed' ? '#10b981' : '#f59e0b'
                }}>
                  {j.state}
                </span>
                <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'capitalize' }}>
                  {j.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}