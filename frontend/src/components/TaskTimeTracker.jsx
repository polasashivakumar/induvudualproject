import { useEffect, useState } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

export default function TaskTimeTracker({ jobs, onUpdate }) {
  const [activeTimer, setActiveTimer] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { colors } = useTheme()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let interval
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - activeTimer.startMs) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTimer])

  const startTimer = async (job) => {
    try {
      await API.put(`/jobs/${job._id}/start-timer`)
      setActiveTimer({ jobId: job._id, title: job.title, startMs: Date.now() })
      setElapsed(0)
      toast.success(`⏱️ Timer started for: ${job.title}`)
    } catch { toast.error('Failed to start timer') }
  }

  const stopTimer = () => {
    setActiveTimer(null)
    setElapsed(0)
    toast.success('⏱️ Timer stopped!')
    onUpdate?.()
  }

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const activeTasks = jobs.filter(j => j.state !== 'completed' && j.state !== 'failed')

  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.cardBorder}`,
      borderRadius: '20px', padding: isMobile ? '18px' : '24px'
    }}>
      <h3 style={{ color: colors.text, fontWeight: '700', fontSize: isMobile ? '15px' : '16px', marginBottom: '16px' }}>
        ⏱️ Task Time Tracker
      </h3>

      {/* Active timer */}
      {activeTimer && (
        <div style={{
          background: colors.accentGradient,
          border: `1px solid ${colors.primarySoftBorder}`,
          borderRadius: '14px', padding: isMobile ? '16px' : '20px', marginBottom: '16px',
          textAlign: 'center'
        }}>
          <p style={{ color: colors.softPurple, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
            ⏱️ TRACKING
          </p>
          <p style={{ color: colors.text, fontWeight: '600', fontSize: isMobile ? '13px' : '14px', marginBottom: '12px' }}>
            {activeTimer.title}
          </p>
          <div style={{
            fontSize: isMobile ? '34px' : '42px', fontWeight: '800', color: colors.lightOnPrimary,
            fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '16px'
          }}>
            {formatTime(elapsed)}
          </div>
          <button onClick={stopTimer} style={{
            padding: '10px 24px', background: `rgba(239,68,68,0.12)`,
            border: `1px solid ${colors.danger}33`, borderRadius: '10px',
            color: colors.danger, fontWeight: '700', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif'
          }}>
            ⏹️ Stop Timer
          </button>
        </div>
      )}

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeTasks.length === 0 ? (
          <p style={{ color: colors.textMuted, fontSize: '13px', textAlign: 'center', padding: '20px' }}>
            No active tasks to track
          </p>
        ) : (
          activeTasks.map(job => (
            <div key={job._id} style={{
              display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? '10px' : '0', padding: '12px 14px', background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`, borderRadius: '10px'
            }}>
              <div>
                <div style={{ color: colors.text, fontWeight: '600', fontSize: '13px' }}>
                  {job.title}
                </div>
                {job.timeSpentMinutes > 0 && (
                  <div style={{ color: colors.textMuted, fontSize: '11px', marginTop: '2px' }}>
                    ⏱️ Total: {job.timeSpentMinutes} min
                  </div>
                )}
              </div>
              <button
                onClick={() => activeTimer?.jobId === job._id ? stopTimer() : startTimer(job)}
                style={{
                  padding: isMobile ? '8px 14px' : '6px 14px',
                  background: activeTimer?.jobId === job._id ? `rgba(239,68,68,0.12)` : colors.primarySoftBg,
                  border: `1px solid ${activeTimer?.jobId === job._id ? colors.danger + '33' : colors.primary + '33'}`,
                  borderRadius: '8px',
                  color: activeTimer?.jobId === job._id ? colors.danger : colors.softPurple,
                  fontSize: '12px', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                }}
              >
                {activeTimer?.jobId === job._id ? '⏹️ Stop' : '▶️ Start'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}