import { useEffect, useState } from 'react'
import API from '../api/axios'

export default function NotificationPanel({ onClose }) {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/jobs/notifications')
        setNotifs(res.data)
        await API.put('/jobs/notifications/read')
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [])

  const stateColors = {
    completed: '#10b981',
    failed: '#ef4444',
    active: '#3b82f6'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      display: 'flex', justifyContent: 'flex-end'
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)'
      }} />

      {/* Panel */}
      <div style={{
        position: 'relative', width: '360px', height: '100%',
        background: '#0f1117',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.2s ease'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
              🔔 Notifications
            </h3>
            <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
              {notifs.length} unread updates
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', width: '32px', height: '32px',
            color: '#9ca3af', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        {/* Notifications */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#4b5563', padding: '40px' }}>
              Loading...
            </div>
          ) : notifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
              <p style={{ color: '#6b7280', fontWeight: '500' }}>All caught up!</p>
              <p style={{ color: '#374151', fontSize: '13px', marginTop: '4px' }}>
                No new notifications
              </p>
            </div>
          ) : (
            notifs.map(n => (
              <div key={n._id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: `3px solid ${stateColors[n.state] || '#7c3aed'}`,
                borderRadius: '10px', padding: '14px',
                marginBottom: '8px', transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>
                    {n.title}
                  </span>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '2px 8px',
                    borderRadius: '20px',
                    background: `${stateColors[n.state]}22`,
                    color: stateColors[n.state] || '#a78bfa'
                  }}>
                    {n.state?.toUpperCase()}
                  </span>
                </div>
                {n.adminNote && (
                  <p style={{ color: '#a78bfa', fontSize: '12px', marginBottom: '4px' }}>
                    💬 {n.adminNote}
                  </p>
                )}
                <p style={{ color: '#4b5563', fontSize: '11px' }}>
                  {new Date(n.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}