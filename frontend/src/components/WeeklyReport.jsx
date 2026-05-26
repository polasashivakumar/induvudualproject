import { useEffect, useState } from 'react'
import API from '../api/axios'

export default function WeeklyReport() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/jobs/weekly-report')
        setReport(res.data)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [])

  const typeLabels = {
    assignment: '📝 Assignment',
    lab_report: '🔬 Lab Report',
    project_review: '💡 Project',
    library_request: '📚 Library',
    print_request: '🖨️ Print'
  }

  if (loading) return (
    <div style={{
      background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: '24px', textAlign: 'center', color: '#4b5563'
    }}>Loading report...</div>
  )

  return (
    <div style={{
      background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
          📊 Weekly Progress Report
        </h3>
        <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '2px' }}>
          Last 7 days summary
        </p>
      </div>

      {/* This week */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          This Week
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
          {[
            { label: 'Submitted', value: report?.thisWeek?.total, color: '#7c3aed' },
            { label: 'Completed', value: report?.thisWeek?.completed, color: '#10b981' },
            { label: 'Pending', value: report?.thisWeek?.pending, color: '#f59e0b' },
            { label: 'Failed', value: report?.thisWeek?.failed, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(0,0,0,0.2)', borderRadius: '10px',
              padding: '12px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value ?? 0}</div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* All time */}
      <div style={{
        background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
        borderRadius: '12px', padding: '16px', marginBottom: '16px'
      }}>
        <p style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
          All Time Performance
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>
              {report?.allTime?.total ?? 0}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Tasks</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
              {report?.allTime?.completionRate ?? 0}%
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Success Rate</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b' }}>
              {report?.allTime?.avgRating > 0 ? `${report.allTime.avgRating}⭐` : 'N/A'}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Avg Rating</div>
          </div>
        </div>
      </div>

      {/* By type */}
      {report?.byType?.length > 0 && (
        <div>
          <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            By Task Type
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.byType.map(t => (
              <div key={t._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 14px'
              }}>
                <span style={{ color: '#e5e7eb', fontSize: '13px' }}>
                  {typeLabels[t._id] || t._id}
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>{t.count} total</span>
                  <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>
                    {t.completed} done
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}