import { useEffect, useState } from 'react'
import API from '../api/axios'
import { FILE_BASE_URL } from '../api/config'
import toast from 'react-hot-toast'

const stateConfig = {
  waiting:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: '⏳ Waiting'    },
  active:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  label: '⚙️ Processing'  },
  completed: { color: '#10b981', bg: 'rgba(16,185,129,0.15)',  label: '✅ Completed'   },
  failed:    { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   label: '❌ Failed'      },
}

const typeConfig = {
  assignment:      { icon: '📝', label: 'Assignment'     },
  lab_report:      { icon: '🔬', label: 'Lab Report'     },
  project_review:  { icon: '💡', label: 'Project Review' },
  library_request: { icon: '📚', label: 'Library'        },
  print_request:   { icon: '🖨️', label: 'Print'          },
}

const priorityConfig = {
  1: { label: '🔴 Urgent', color: '#ef4444' },
  2: { label: '🟡 Normal', color: '#f59e0b' },
  3: { label: '🟢 Low',    color: '#10b981' },
}

export default function AdminDashboardHome() {
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [viewFile, setViewFile] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900) // ✅ ADD

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchAll = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        API.get('/jobs/all'),
        API.get('/jobs/stats')
      ])
      setJobs(jobsRes.data)
      setStats(statsRes.data)
    } catch {}
    setLoading(false)
  }

  const updateStatus = async (id, state) => {
    setUpdating(true)
    try {
      const res = await API.put(`/jobs/${id}/status`, { state, adminNote })
      if (res.data.success) {
        toast.success(`✅ Task marked as ${state}!`)
        setSelectedJob(null)
        setAdminNote('')
        fetchAll()
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    }
    setUpdating(false)
  }

  const archiveCompleted = async () => {
    try {
      await API.put('/jobs/bulk-archive/completed')
      toast.success('All completed tasks archived!')
      fetchAll()
    } catch { toast.error('Failed') }
  }

  const exportCSV = () => {
    const headers = ['Title', 'Student', 'Department', 'Roll No', 'Type', 'Priority', 'Status', 'Due Date', 'Created']
    const rows = filtered.map(j => [
      `"${j.title}"`, j.userName, j.department, j.rollNumber,
      typeConfig[j.type]?.label || j.type,
      j.priority === 1 ? 'Urgent' : j.priority === 2 ? 'Normal' : 'Low',
      j.state,
      j.dueDate ? new Date(j.dueDate).toLocaleDateString() : '-',
      new Date(j.createdAt).toLocaleString()
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all-tasks-${new Date().toLocaleDateString()}.csv`
    a.click()
    toast.success('📤 Exported!')
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 5000)
    return () => clearInterval(interval)
  }, [])

  const filtered = jobs
    .filter(j => filter === 'all' || j.state === filter)
    .filter(j =>
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.userName?.toLowerCase().includes(search.toLowerCase()) ||
      j.department?.toLowerCase().includes(search.toLowerCase()) ||
      j.rollNumber?.toLowerCase().includes(search.toLowerCase())
    )

  const urgentCount = jobs.filter(j => j.priority === 1 && j.state === 'waiting').length
  const overdueCount = jobs.filter(j =>
    j.dueDate && new Date(j.dueDate) < new Date() && j.state !== 'completed'
  ).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', overflow: 'hidden' }}>

      {/* File viewer */}
      {viewFile && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '24px', width: '90%', maxWidth: '820px',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>
                📎 {viewFile.name}
              </h3>
              <button onClick={() => setViewFile(null)} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', width: '34px', height: '34px',
                color: '#9ca3af', cursor: 'pointer', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            </div>
            <div style={{
              flex: 1, overflow: 'auto', background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px', padding: '16px', minHeight: '300px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {viewFile.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={`${FILE_BASE_URL}${viewFile.url}`} alt={viewFile.name}
                  style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px', objectFit: 'contain' }} />
              ) : viewFile.name?.match(/\.pdf$/i) ? (
                <iframe src={`${FILE_BASE_URL}${viewFile.url}`}
                  style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }}
                  title={viewFile.name} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '56px', marginBottom: '16px' }}>📎</div>
                  <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Preview not available</p>
                  <a href={`${FILE_BASE_URL}${viewFile.url}`} download={viewFile.name} style={{
                    padding: '12px 24px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    borderRadius: '10px', color: '#fff', textDecoration: 'none',
                    fontWeight: '600', fontSize: '14px', display: 'inline-block'
                  }}>⬇️ Download File</a>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <a href={`${FILE_BASE_URL}${viewFile.url}`} download={viewFile.name} style={{
                flex: 1, padding: '11px', textAlign: 'center',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                borderRadius: '10px', color: '#fff',
                textDecoration: 'none', fontWeight: '600', fontSize: '13px', display: 'block'
              }}>⬇️ Download</a>
              <button onClick={() => setViewFile(null)} style={{
                padding: '11px 20px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                color: '#9ca3af', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '600'
              }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Update modal */}
      {selectedJob && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '480px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>
                ✏️ Update Task Status
              </h3>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>
                {typeConfig[selectedJob.type]?.icon} {selectedJob.title}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>👤 {selectedJob.userName}</span>
                {selectedJob.department && (
                  <span style={{ fontSize: '12px', color: '#a78bfa' }}>• {selectedJob.department}</span>
                )}
                <span style={{
                  fontSize: '11px', fontWeight: '700', padding: '1px 8px', borderRadius: '12px',
                  background: stateConfig[selectedJob.state]?.bg,
                  color: stateConfig[selectedJob.state]?.color
                }}>
                  Current: {stateConfig[selectedJob.state]?.label}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Feedback Note for Student
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="e.g. Good work! Minor corrections needed on page 3..."
                rows={3}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                  padding: '12px', color: '#fff', fontSize: '14px', outline: 'none',
                  fontFamily: 'Inter, sans-serif', resize: 'vertical', boxSizing: 'border-box'
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Change Status To:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { state: 'active', icon: '⚙️', label: 'Processing' },
                { state: 'completed', icon: '✅', label: 'Completed' },
                { state: 'failed', icon: '❌', label: 'Failed' },
              ].map(s => (
                <button key={s.state} onClick={() => updateStatus(selectedJob._id, s.state)}
                  disabled={updating} style={{
                    padding: '14px 8px', borderRadius: '12px', border: 'none',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    background: stateConfig[s.state]?.bg, color: stateConfig[s.state]?.color,
                    fontWeight: '700', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                    opacity: updating ? 0.6 : 1
                  }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                  {updating ? '...' : s.label}
                </button>
              ))}
            </div>
            <button onClick={() => { setSelectedJob(null); setAdminNote('') }} style={{
              width: '100%', padding: '11px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: '#9ca3af', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '600'
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ✅ FIX: Alert banners stack on mobile */}
      {(urgentCount > 0 || overdueCount > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: (!isMobile && urgentCount > 0 && overdueCount > 0) ? '1fr 1fr' : '1fr',
          gap: '12px'
        }}>
          {urgentCount > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>🚨</span>
              <div>
                <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '14px' }}>
                  {urgentCount} Urgent Task{urgentCount > 1 ? 's' : ''} Waiting
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Requires immediate attention</div>
              </div>
            </div>
          )}
          {overdueCount > 0 && (
            <div style={{
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '12px', padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <div style={{ color: '#f59e0b', fontWeight: '700', fontSize: '14px' }}>
                  {overdueCount} Overdue Task{overdueCount > 1 ? 's' : ''}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Past deadline, not completed</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ FIX: Stats grid - 3 cols on mobile, 5 on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : 'repeat(5,1fr)',
        gap: '12px'
      }}>
        {[
          { label: 'Total Tasks', value: stats.total, icon: '📋', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)' },
          { label: 'Waiting', value: stats.waiting, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Processing', value: stats.active, icon: '⚙️', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
          { label: 'Completed', value: stats.completed, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
          { label: 'Failed', value: stats.failed, icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
        ].map(c => (
          <div key={c.label} style={{
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: '16px', padding: isMobile ? '12px 8px' : '18px 16px',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <div style={{ fontSize: isMobile ? '18px' : '22px', marginBottom: '8px' }}>{c.icon}</div>
            <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: c.color, lineHeight: 1 }}>
              {c.value ?? 0}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', fontWeight: '500' }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>📋 All Student Tasks</h3>
              <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '2px' }}>
                {filtered.length} tasks • Auto-refreshes every 5s
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={fetchAll} style={{
                padding: '8px 14px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                color: '#9ca3af', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif'
              }}>🔄 Refresh</button>
              <button onClick={exportCSV} style={{
                padding: '8px 14px', background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px',
                color: '#10b981', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif'
              }}>📤 Export CSV</button>
              <button onClick={archiveCompleted} style={{
                padding: '8px 14px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
                color: '#f87171', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif'
              }}>🗂️ Archive Done</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search by title, student, department, roll no..."
              style={{
                flex: 1, minWidth: '200px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '9px 14px',
                color: '#fff', fontSize: '13px', outline: 'none',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', 'waiting', 'active', 'completed', 'failed'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '8px 14px', borderRadius: '8px', border: 'none',
                  background: filter === f ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                  color: filter === f ? '#a78bfa' : '#6b7280',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  textTransform: 'capitalize', fontFamily: 'Inter, sans-serif'
                }}>
                  {f} ({f === 'all' ? jobs.length : jobs.filter(j => j.state === f).length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: '#6b7280', fontWeight: '500' }}>No tasks found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Task', 'Student', 'Type', 'Priority', 'Status', 'Due', 'Files', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', color: '#4b5563',
                      fontWeight: '600', fontSize: '11px', textTransform: 'uppercase',
                      letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                      whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((job, i) => (
                  <tr key={job._id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}>
                    <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                      <div style={{ color: '#e5e7eb', fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>
                        {job.title}
                        {job.isResubmission && (
                          <span style={{ marginLeft: '6px', fontSize: '10px', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '1px 5px', borderRadius: '4px' }}>🔄</span>
                        )}
                      </div>
                      {job.description && (
                        <div style={{ color: '#4b5563', fontSize: '11px' }}>{job.description.substring(0, 40)}...</div>
                      )}
                      {job.adminNote && (
                        <div style={{ color: '#a78bfa', fontSize: '10px', marginTop: '3px', padding: '2px 6px', background: 'rgba(124,58,237,0.1)', borderRadius: '4px', display: 'inline-block' }}>
                          💬 {job.adminNote.substring(0, 30)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#e5e7eb', fontWeight: '500', fontSize: '13px' }}>{job.userName}</div>
                      <div style={{ color: '#4b5563', fontSize: '11px' }}>{job.rollNumber}</div>
                      {job.department && (
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
                          {job.department}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {typeConfig[job.type]?.icon} {typeConfig[job.type]?.label}
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ color: priorityConfig[job.priority]?.color, fontWeight: '600', fontSize: '12px' }}>
                        {priorityConfig[job.priority]?.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px',
                        background: stateConfig[job.state]?.bg,
                        color: stateConfig[job.state]?.color,
                        fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap'
                      }}>
                        {stateConfig[job.state]?.label}
                      </span>
                      {job.rating && <div style={{ color: '#f59e0b', fontSize: '10px', marginTop: '3px' }}>⭐ {job.rating}/5</div>}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {job.dueDate ? (
                        <span style={{ color: new Date(job.dueDate) < new Date() && job.state !== 'completed' ? '#ef4444' : '#6b7280' }}>
                          {new Date(job.dueDate) < new Date() && job.state !== 'completed' ? '⚠️ ' : ''}
                          {new Date(job.dueDate).toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {job.attachments?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {job.attachments.slice(0, 2).map((f, fi) => (
                            <button key={fi} onClick={() => setViewFile(f)} style={{
                              padding: '3px 8px', background: 'rgba(124,58,237,0.15)',
                              border: '1px solid rgba(124,58,237,0.3)', borderRadius: '5px',
                              color: '#a78bfa', fontSize: '10px', cursor: 'pointer',
                              fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap'
                            }}>
                              👁️ {f.name.substring(0, 12)}{f.name.length > 12 ? '...' : ''}
                            </button>
                          ))}
                          {job.attachments.length > 2 && (
                            <span style={{ color: '#4b5563', fontSize: '10px' }}>+{job.attachments.length - 2} more</span>
                          )}
                        </div>
                      ) : <span style={{ color: '#374151', fontSize: '12px' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => { setSelectedJob(job); setAdminNote(job.adminNote || '') }} style={{
                        padding: '7px 14px',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))',
                        border: '1px solid rgba(124,58,237,0.4)', borderRadius: '8px',
                        color: '#a78bfa', fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap'
                      }}>✏️ Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
           }
