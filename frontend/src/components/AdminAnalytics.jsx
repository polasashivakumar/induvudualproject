import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import API from '../api/axios'

const COLORS = ['#7c3aed', '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const typeLabels = {
  assignment: '📝 Assignment',
  lab_report: '🔬 Lab Report',
  project_review: '💡 Project',
  library_request: '📚 Library',
  print_request: '🖨️ Print'
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/jobs/admin-analytics')
        setData(res.data)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return (
    <div style={{
      background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: '40px', textAlign: 'center', color: '#4b5563'
    }}>Loading analytics...</div>
  )

  const stateData = data?.byState?.map(s => ({
    name: s._id?.charAt(0).toUpperCase() + s._id?.slice(1),
    value: s.count
  })) || []

  const typeData = data?.byType?.map(t => ({
    name: typeLabels[t._id] || t._id,
    count: t.count
  })) || []

  const deptData = data?.byDept?.map(d => ({
    name: d._id || 'Unknown',
    total: d.count,
    completed: d.completed
  })) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
        {[
          { label: 'Total Tasks', value: data?.total || 0, icon: '📋', color: '#7c3aed' },
          { label: 'Completed', value: data?.byState?.find(s => s._id === 'completed')?.count || 0, icon: '✅', color: '#10b981' },
          { label: 'Pending', value: data?.byState?.find(s => s._id === 'waiting')?.count || 0, icon: '⏳', color: '#f59e0b' },
          { label: 'Failed', value: data?.byState?.find(s => s._id === 'failed')?.count || 0, icon: '❌', color: '#ef4444' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '20px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: card.color }}>{card.value}</div>
            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Task by type */}
        <div style={{
          background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '24px'
        }}>
          <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px', marginBottom: '20px' }}>
            📊 Tasks by Type
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }} cursor={{ fill: 'rgba(124,58,237,0.1)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task by state pie */}
        <div style={{
          background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '24px'
        }}>
          <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px', marginBottom: '20px' }}>
            🥧 Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {stateData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department stats */}
      {deptData.length > 0 && (
        <div style={{
          background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '24px'
        }}>
          <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>
            🏫 Department Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {deptData.map(d => {
              const rate = d.total ? Math.round((d.completed / d.total) * 100) : 0
              return (
                <div key={d.name} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 16px'
                }}>
                  <div style={{ width: '140px', color: '#e5e7eb', fontSize: '13px', fontWeight: '500', flexShrink: 0 }}>
                    {d.name || 'Unknown'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${rate}%`,
                        background: 'linear-gradient(90deg, #7c3aed, #10b981)',
                        borderRadius: '4px', transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                  <div style={{ width: '80px', textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '13px' }}>{rate}%</span>
                    <span style={{ color: '#4b5563', fontSize: '11px', marginLeft: '4px' }}>({d.total})</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}