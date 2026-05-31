import { useAuth } from '../context/AuthContext'

export default function ProgressCard({ stats }) {
  const { user } = useAuth()

  const completionRate = stats?.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0

  const getBadge = () => {
    if (completionRate >= 90) return { label: '🏆 Outstanding', color: '#f59e0b' }
    if (completionRate >= 70) return { label: '⭐ Good Progress', color: '#10b981' }
    if (completionRate >= 40) return { label: '📈 Keep Going', color: '#3b82f6' }
    return { label: '🚀 Just Started', color: '#7c3aed' }
  }

  const badge = getBadge()

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))',
      border: '1px solid rgba(124,58,237,0.2)',
      borderRadius: '20px', padding: '24px',
      minWidth: 0,        // ✅ FIX
      overflow: 'hidden'  // ✅ FIX
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '20px',
        flexWrap: 'wrap', gap: '8px'
      }}>
        <div>
          <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
            🏆 Your Progress
          </h3>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
            {user?.department || 'Student'} • {user?.rollNumber || ''}
          </p>
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: '20px',
          background: `${badge.color}22`,
          color: badge.color,
          fontSize: '12px', fontWeight: '700',
          border: `1px solid ${badge.color}44`,
          whiteSpace: 'nowrap'
        }}>
          {badge.label}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>Completion Rate</span>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>
            {completionRate}%
          </span>
        </div>
        <div style={{
          height: '8px', background: 'rgba(255,255,255,0.08)',
          borderRadius: '4px', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${completionRate}%`,
            background: 'linear-gradient(90deg, #7c3aed, #10b981)',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
        {[
          { label: 'Total', value: stats?.total || 0, color: '#a78bfa' },
          { label: 'Waiting', value: stats?.waiting || 0, color: '#f59e0b' },
          { label: 'Done', value: stats?.completed || 0, color: '#10b981' },
          { label: 'Failed', value: stats?.failed || 0, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '10px', padding: '10px 8px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
