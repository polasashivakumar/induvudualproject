import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import API from '../api/axios'

const typeLabels = {
  assignment: '📝 Assignment',
  lab_report: '🔬 Lab Report',
  project_review: '💡 Project',
  library_request: '📚 Library',
  print_request: '🖨️ Print'
}

const COLORS = ['#7c3aed', '#4f46e5', '#06b6d4', '#10b981', '#f59e0b']

export default function AnalyticsChart() {
  const [jobs, setJobs] = useState([])
  const [view, setView] = useState('type')

  useEffect(() => {
    const fetch = async () => {
      try {
        const endpoint = '/jobs/my'
        const res = await API.get(endpoint)
        setJobs(res.data)
      } catch {}
    }
    fetch()
  }, [])

  const getChartData = () => {
    if (view === 'type') {
      const counts = {}
      jobs.forEach(j => {
        counts[j.type] = (counts[j.type] || 0) + 1
      })
      return Object.entries(counts).map(([key, value]) => ({
        name: typeLabels[key] || key,
        count: value
      }))
    } else {
      const counts = { waiting: 0, active: 0, completed: 0, failed: 0 }
      jobs.forEach(j => { counts[j.state] = (counts[j.state] || 0) + 1 })
      return Object.entries(counts).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        count: value
      }))
    }
  }

  const data = getChartData()
  const completionRate = jobs.length
    ? Math.round((jobs.filter(j => j.state === 'completed').length / jobs.length) * 100)
    : 0

  return (
    <div style={{
      background: 'rgba(17,24,39,0.6)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: '24px',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
            📊 Task Analytics
          </h3>
          <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '2px' }}>
            Your task distribution
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['type', 'status'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '5px 12px', borderRadius: '6px', border: 'none',
              background: view === v ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
              color: view === v ? '#a78bfa' : '#6b7280',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              textTransform: 'capitalize', fontFamily: 'Inter, sans-serif'
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Completion rate */}
      <div style={{
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '12px', padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ color: '#10b981', fontWeight: '700', fontSize: '24px' }}>
            {completionRate}%
          </div>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>Completion Rate</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>
            {jobs.filter(j => j.state === 'completed').length}/{jobs.length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>Tasks Done</div>
        </div>
      </div>

      {/* Bar Chart */}
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>
          No data yet — submit some tasks!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: '#fff', fontSize: '12px'
              }}
              cursor={{ fill: 'rgba(124,58,237,0.1)' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}