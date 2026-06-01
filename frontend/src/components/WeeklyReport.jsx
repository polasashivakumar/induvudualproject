import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useTheme } from '../context/ThemeContext'

export default function WeeklyReport() {
  const { colors } = useTheme()
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
      background: colors.card, border: `1px solid ${colors.cardBorder}`,
      borderRadius: '20px', padding: '24px', textAlign: 'center', color: colors.textSecondary
    }}>Loading report...</div>
  )

  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.cardBorder}`,
      borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: colors.text, fontWeight: '700', fontSize: '16px' }}>
          📊 Weekly Progress Report
        </h3>
        <p style={{ color: colors.textSecondary, fontSize: '12px', marginTop: '2px' }}>
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
            { label: 'Submitted', value: report?.thisWeek?.total, color: colors.primary },
            { label: 'Completed', value: report?.thisWeek?.completed, color: colors.success },
            { label: 'Pending', value: report?.thisWeek?.pending, color: colors.warning },
            { label: 'Failed', value: report?.thisWeek?.failed, color: colors.danger },
          ].map(s => (
            <div key={s.label} style={{
              background: colors.inputBg, borderRadius: '10px',
              padding: '12px', textAlign: 'center', border: `1px solid ${colors.inputBorder}`
            }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value ?? 0}</div>
              <div style={{ fontSize: '10px', color: colors.muted, marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* All time */}
      <div style={{
        background: colors.primarySoftBg, border: `1px solid ${colors.primarySoftBorder}`,
        borderRadius: '12px', padding: '16px', marginBottom: '16px'
      }}>
        <p style={{ color: colors.softPurple, fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
          All Time Performance
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.text }}>
              {report?.allTime?.total ?? 0}
            </div>
            <div style={{ fontSize: '11px', color: colors.muted }}>Total Tasks</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.success }}>
              {report?.allTime?.completionRate ?? 0}%
            </div>
            <div style={{ fontSize: '11px', color: colors.muted }}>Success Rate</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: colors.warning }}>
              {report?.allTime?.avgRating > 0 ? `${report.allTime.avgRating}⭐` : 'N/A'}
            </div>
            <div style={{ fontSize: '11px', color: colors.muted }}>Avg Rating</div>
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
                background: colors.rowAlt, borderRadius: '8px', padding: '10px 14px', border: `1px solid ${colors.inputBorder}`
              }}>
                <span style={{ color: colors.text, fontSize: '13px' }}>
                  {typeLabels[t._id] || t._id}
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: colors.muted, fontSize: '12px' }}>{t.count} total</span>
                  <span style={{ color: colors.success, fontSize: '12px', fontWeight: '600' }}>
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