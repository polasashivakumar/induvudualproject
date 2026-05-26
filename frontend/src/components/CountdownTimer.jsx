import { useEffect, useState } from 'react'

export default function CountdownTimer({ jobs }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
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

    if (days > 0) return { text: `${days}d ${hours}h ${mins}m`, urgent: days < 1 }
    if (hours > 0) return { text: `${hours}h ${mins}m ${secs}s`, urgent: hours < 3 }
    return { text: `${mins}m ${secs}s`, urgent: true }
  }

  return (
    <div style={{
      background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
          ⏰ Deadline Countdown
        </h3>
        <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '2px' }}>
          Live countdown for upcoming tasks
        </p>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', padding: '12px 14px', marginBottom: '12px'
        }}>
          <p style={{ color: '#ef4444', fontWeight: '700', fontSize: '13px' }}>
            ⚠️ {overdue.length} Overdue Task{overdue.length > 1 ? 's' : ''}!
          </p>
          {overdue.map(j => (
            <p key={j._id} style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px' }}>
              • {j.title}
            </p>
          ))}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#4b5563' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
          <p style={{ fontSize: '13px' }}>No upcoming deadlines!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {upcoming.map(job => {
            const time = getTimeLeft(job.dueDate)
            return (
              <div key={job._id} style={{
                background: time.urgent ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${time.urgent ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '12px', padding: '14px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#e5e7eb', fontWeight: '600', fontSize: '13px' }}>
                    {job.title}
                  </div>
                  <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>
                    Due: {new Date(job.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  color: time.urgent ? '#ef4444' : '#10b981',
                  fontWeight: '700', fontSize: '13px',
                  background: time.urgent ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  padding: '6px 12px', borderRadius: '8px',
                  fontFamily: 'monospace', minWidth: '100px', textAlign: 'center'
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