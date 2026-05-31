import { useEffect, useState } from 'react'

export default function CountdownTimer({ jobs }) {
  const [now, setNow] = useState(new Date())
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const upcoming = jobs
    .filter(j => j.dueDate && j.state !== 'completed' && new Date(j.dueDate) > now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3)

  const overdue = jobs
    .filter(j => j.dueDate && j.state !== 'completed' && new Date(j.dueDate) <= now)

  const getTimeLeft = (dueDate) => {
    const diff = new Date(dueDate) - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const secs = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) return { text: `${days}d ${hours}h`, urgent: days < 1 }
    if (hours > 0) return { text: `${hours}h ${mins}m`, urgent: hours < 3 }
    return { text: `${mins}m ${secs}s`, urgent: true }
  }

  return (
    <div style={{
      background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: isMobile ? '18px' : '24px', backdropFilter: 'blur(10px)',
      minWidth: 0,        // ✅ FIX
      overflow: 'hidden'  // ✅ FIX
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: '#fff', fontWeight: '700', fontSize: isMobile ? '15px' : '16px' }}>
          ⏰ Deadline Countdown
        </h3>
        <p style={{ color: '#4b5563', fontSize: isMobile ? '11px' : '12px', marginTop: '2px' }}>
          Live countdown for upcoming tasks
        </p>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', padding: isMobile ? '10px 12px' : '12px 14px', marginBottom: '12px'
        }}>
          <p style={{ color: '#ef4444', fontWeight: '700', fontSize: isMobile ? '12px' : '13px' }}>
            ⚠️ {overdue.length} Overdue Task{overdue.length > 1 ? 's' : ''}!
          </p>
          {overdue.map(j => (
            <p key={j._id} style={{ color: '#fca5a5', fontSize: isMobile ? '11px' : '12px', marginTop: '4px' }}>
              • {j.title}
            </p>
          ))}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length === 0 ? (
        <div style={{ textAlign: 'center', padding: isMobile ? '22px 12px' : '30px', color: '#4b5563' }}>
          <div style={{ fontSize: isMobile ? '28px' : '32px', marginBottom: '8px' }}>🎉</div>
          <p style={{ fontSize: isMobile ? '12px' : '13px' }}>No upcoming deadlines!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {upcoming.map(job => {
            const time = getTimeLeft(job.dueDate)
            return (
              <div key={job._id} style={{
                background: time.urgent ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${time.urgent ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '12px', padding: isMobile ? '12px' : '12px 14px',
                display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center', gap: '8px'
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>  {/* ✅ FIX */}
                  <div style={{
                    color: '#e5e7eb', fontWeight: '600', fontSize: isMobile ? '12px' : '13px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'normal' : 'nowrap'
                  }}>
                    {job.title}
                  </div>
                  <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>
                    Due: {new Date(job.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  color: time.urgent ? '#ef4444' : '#10b981',
                  fontWeight: '700', fontSize: isMobile ? '11px' : '12px',
                  background: time.urgent ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  padding: isMobile ? '6px 8px' : '6px 10px', borderRadius: '8px',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  alignSelf: isMobile ? 'flex-start' : 'auto'
                }}>
                  {time.text}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
