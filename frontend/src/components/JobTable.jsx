import { useEffect, useState } from 'react'
import useSocket from '../hooks/useSocket'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

const stateConfig = {
  waiting: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    label: '⏳ Waiting'
  },
  active: {
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    label: '⚙️ Processing'
  },
  completed: {
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
    label: '✅ Completed'
  },
  failed: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    label: '❌ Failed'
  }
}

const typeConfig = {
  assignment: { icon: '📝', label: 'Assignment' },
  lab_report: { icon: '🔬', label: 'Lab Report' },
  project_review: { icon: '💡', label: 'Project Review' },
  library_request: { icon: '📚', label: 'Library' },
  print_request: { icon: '🖨️', label: 'Print' }
}

const priorityConfig = {
  1: { label: '🔴 Urgent', color: '#ef4444' },
  2: { label: '🟡 Normal', color: '#f59e0b' },
  3: { label: '🟢 Low', color: '#10b981' }
}

export default function JobTable({ onJobsUpdate }) {
  const { colors } = useTheme()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [completing, setCompleting] = useState(null)
  const [commentJob, setCommentJob] = useState(null)
  const [commentText, setCommentText] = useState('')

  const { user } = useAuth()

  const fetchJobs = async () => {
    try {
      const endpoint =
        user?.role === 'admin' ? '/jobs/all' : '/jobs/my'

      const res = await API.get(endpoint)

      setJobs(res.data)
      onJobsUpdate?.(res.data)
    } catch (err) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, state) => {
    try {
      await API.put(`/jobs/${id}/status`, {
        state,
        adminNote
      })

      toast.success(`Task marked as ${state}!`)
      setSelectedJob(null)
      setAdminNote('')
      fetchJobs()
    } catch {
      toast.error('Failed to update task')
    }
  }

  const markComplete = async (id) => {
    setCompleting(id)

    try {
      const res = await API.put(`/jobs/${id}/complete`)

      toast.success('🎉 Task completed!')

      if (res.data?.newBadges?.length > 0) {
        res.data.newBadges.forEach((b) => {
          toast.success(`🏅 Badge earned: ${b.icon} ${b.name}!`, {
            duration: 4000
          })
        })
      }

      fetchJobs()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setCompleting(null)
    }
  }

  const resubmitTask = async (job) => {
    try {
      await API.post(`/jobs/${job._id}/resubmit`, {
        description: job.description
      })

      toast.success('🔄 Task resubmitted!')
      fetchJobs()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resubmit')
    }
  }

  const addComment = async () => {
    if (!commentText.trim()) {
      return toast.error('Enter a comment!')
    }

    try {
      await API.post(`/jobs/${commentJob._id}/comment`, {
        text: commentText
      })

      toast.success('Comment added!')
      setCommentText('')
      setCommentJob(null)
      fetchJobs()
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const exportCSV = () => {
    const headers = [
      'Title',
      'Type',
      'Priority',
      'Status',
      'Due Date',
      'Rating',
      'Created At'
    ]

    const rows = filtered.map((j) => [
      j.title,
      typeConfig[j.type]?.label || j.type,
      j.priority === 1
        ? 'Urgent'
        : j.priority === 2
        ? 'Normal'
        : 'Low',
      j.state,
      j.dueDate
        ? new Date(j.dueDate).toLocaleDateString()
        : '-',
      j.rating ? `${j.rating}/5` : 'Not rated',
      new Date(j.createdAt).toLocaleString()
    ])

    const csv = [headers, ...rows]
      .map((r) => r.join(','))
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv'
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'tasks.csv'
    a.click()

    toast.success('📤 CSV exported!')
  }

  const clearCompleted = async () => {
    try {
      await API.delete('/jobs/completed')

      toast.success('Completed tasks cleared!')
      fetchJobs()
    } catch {
      toast.error('Failed')
    }
  }

  useEffect(() => { fetchJobs() }, [])

  useSocket({
    events: {
      'job:completed': fetchJobs,
      'job:failed': fetchJobs,
      'job:updated': fetchJobs
    }
  })

  const filtered = jobs
    .filter((j) => filter === 'all' || j.state === filter)
    .filter(
      (j) =>
        j.title?.toLowerCase().includes(search.toLowerCase()) ||
        j.description
          ?.toLowerCase()
          .includes(search.toLowerCase())
    )

  const btnStyle = (bg, border, color) => ({
    padding: '8px 14px',
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: '8px',
    color,
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif'
  })

  return (
    <div>
      {/* ===== ADMIN UPDATE MODAL ===== */}
      {selectedJob && user?.role === 'admin' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '32px',
              width: '100%',
              maxWidth: '440px'
            }}
          >
            <h3
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: '18px',
                marginBottom: '4px'
              }}
            >
              Update Task
            </h3>

            <p
              style={{
                color: '#6b7280',
                fontSize: '13px',
                marginBottom: '20px'
              }}
            >
              {typeConfig[selectedJob.type]?.icon}{' '}
              {selectedJob.title}
            </p>

            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add feedback..."
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                outline: 'none',
                resize: 'none',
                marginBottom: '16px',
                fontFamily: 'Inter, sans-serif'
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              {['active', 'completed', 'failed'].map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    updateStatus(selectedJob._id, s)
                  }
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: stateConfig[s]?.bg,
                    color: stateConfig[s]?.color,
                    fontWeight: '700',
                    fontSize: '12px'
                  }}
                >
                  {stateConfig[s]?.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedJob(null)
                setAdminNote('')
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#9ca3af',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== COMMENT MODAL ===== */}
      {commentJob && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '32px',
              width: '100%',
              maxWidth: '480px'
            }}
          >
            <h3
              style={{
                color: '#fff',
                fontWeight: '700',
                marginBottom: '16px'
              }}
            >
              💬 Comments
            </h3>

            <div
              style={{
                maxHeight: '220px',
                overflowY: 'auto',
                marginBottom: '16px'
              }}
            >
              {commentJob.comments?.length === 0 ? (
                <p
                  style={{
                    color: '#6b7280',
                    textAlign: 'center'
                  }}
                >
                  No comments yet
                </p>
              ) : (
                commentJob.comments?.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '10px',
                      padding: '10px',
                      marginBottom: '8px'
                    }}
                  >
                    <div
                      style={{
                        color: '#a78bfa',
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}
                    >
                      {c.userName}
                    </div>

                    <div
                      style={{
                        color: '#e5e7eb',
                        fontSize: '13px'
                      }}
                    >
                      {c.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <textarea
              value={commentText}
              onChange={(e) =>
                setCommentText(e.target.value)
              }
              placeholder="Write a comment..."
              rows={2}
                style={{
                  width: '100%',
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '10px',
                  padding: '12px',
                  color: colors.text,
                  resize: 'none',
                  marginBottom: '12px'
                }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={addComment}
                style={{
                  flex: 1,
                  padding: '10px',
                  background:
                    'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  border: 'none',
                  borderRadius: '8px',
                  color: colors.lightOnPrimary,
                  cursor: 'pointer'
                }}
              >
                Send 💬
              </button>

              <button
                onClick={() => {
                  setCommentJob(null)
                  setCommentText('')
                }}
                style={{
                  padding: '10px 16px',
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '8px',
                  color: colors.textSecondary,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN TABLE ===== */}
      <div
        style={{
          background: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        {/* ===== HEADER ===== */}
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${colors.inputBorder}`
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '14px'
            }}
          >
            <div>
              <h3
                style={{
                  color: colors.text,
                  fontWeight: '700',
                  fontSize: '16px'
                }}
              >
                {user?.role === 'admin'
                  ? '📋 All Student Tasks'
                  : '📋 My Tasks'}
              </h3>

              <p
                style={{
                  color: colors.muted,
                  fontSize: '12px'
                }}
              >
                {filtered.length} tasks
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={fetchJobs}
                style={btnStyle(
                  'rgba(255,255,255,0.05)',
                  'rgba(255,255,255,0.1)',
                  '#9ca3af'
                )}
              >
                🔄 Refresh
              </button>

              <button
                onClick={exportCSV}
                style={btnStyle(
                  'rgba(16,185,129,0.1)',
                  'rgba(16,185,129,0.2)',
                  '#10b981'
                )}
              >
                📤 Export
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={clearCompleted}
                  style={btnStyle(
                    'rgba(239,68,68,0.1)',
                    'rgba(239,68,68,0.2)',
                    '#f87171'
                  )}
                >
                  🗑️ Clear Done
                </button>
              )}
            </div>
          </div>

          {/* Search + Filter */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search tasks..."
              style={{
                flex: 1,
                minWidth: '220px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                outline: 'none'
              }}
            />

            {['all', 'waiting', 'active', 'completed', 'failed'].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    background:
                      filter === f
                        ? 'rgba(124,58,237,0.3)'
                        : 'rgba(255,255,255,0.05)',
                    color:
                      filter === f
                        ? '#a78bfa'
                        : '#6b7280'
                  }}
                >
                  {f}
                </button>
              )
            )}
          </div>
        </div>

        {/* ===== TABLE ===== */}
        {loading ? (
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
              color: '#6b7280'
            }}
          >
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
              color: '#6b7280'
            }}
          >
            No tasks found
          </div>
        ) : (
          // ✅ MOBILE SCROLL FIX
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                minWidth: '600px'
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(255,255,255,0.03)'
                  }}
                >
                  {[
                    'Task',
                    user?.role === 'admin' && 'Student',
                    'Type',
                    'Priority',
                    'Status',
                    'Due Date',
                    'Actions'
                  ]
                    .filter(Boolean)
                    .map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 20px',
                          textAlign: 'left',
                          color: '#6b7280',
                          fontSize: '11px'
                        }}
                      >
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((job, i) => (
                  <tr
                    key={job._id}
                    style={{
                      borderBottom:
                        '1px solid rgba(255,255,255,0.04)',
                      background:
                        i % 2 === 0
                          ? 'transparent'
                          : 'rgba(255,255,255,0.01)'
                    }}
                  >
                    {/* TASK */}
                    <td
                      style={{
                        padding: '14px 20px'
                      }}
                    >
                      <div
                        style={{
                          color: '#fff',
                          fontWeight: '600'
                        }}
                      >
                        {job.title}
                      </div>

                      {job.description && (
                        <div
                          style={{
                            color: '#6b7280',
                            fontSize: '11px',
                            marginTop: '4px'
                          }}
                        >
                          {job.description.substring(0, 60)}
                        </div>
                      )}

                      {job.adminNote && (
                        <div
                          style={{
                            marginTop: '6px',
                            color: '#a78bfa',
                            fontSize: '11px'
                          }}
                        >
                          💬 {job.adminNote}
                        </div>
                      )}
                    </td>

                    {/* STUDENT */}
                    {user?.role === 'admin' && (
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ color: '#fff' }}>
                          {job.userName}
                        </div>

                        <div
                          style={{
                            color: '#6b7280',
                            fontSize: '11px'
                          }}
                        >
                          {job.department}
                        </div>
                      </td>
                    )}

                    {/* TYPE */}
                    <td
                      style={{
                        padding: '14px 20px',
                        color: '#9ca3af'
                      }}
                    >
                      {typeConfig[job.type]?.icon}{' '}
                      {typeConfig[job.type]?.label}
                    </td>

                    {/* PRIORITY */}
                    <td
                      style={{
                        padding: '14px 20px'
                      }}
                    >
                      <span
                        style={{
                          color:
                            priorityConfig[job.priority]?.color,
                          fontWeight: '600'
                        }}
                      >
                        {priorityConfig[job.priority]?.label}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td
                      style={{
                        padding: '14px 20px'
                      }}
                    >
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background:
                            stateConfig[job.state]?.bg,
                          color:
                            stateConfig[job.state]?.color,
                          fontSize: '11px',
                          fontWeight: '700'
                        }}
                      >
                        {stateConfig[job.state]?.label}
                      </span>
                    </td>

                    {/* DUE DATE */}
                    <td
                      style={{
                        padding: '14px 20px',
                        color: '#6b7280'
                      }}
                    >
                      {job.dueDate
                        ? new Date(
                            job.dueDate
                          ).toLocaleDateString()
                        : '—'}
                    </td>

                    {/* ACTIONS */}
                    <td
                      style={{
                        padding: '14px 20px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap'
                        }}
                      >
                        {/* Comments */}
                        <button
                          onClick={() => setCommentJob(job)}
                          style={{
                            padding: '5px 10px',
                            background:
                              'rgba(124,58,237,0.15)',
                            border:
                              '1px solid rgba(124,58,237,0.3)',
                            borderRadius: '6px',
                            color: '#a78bfa',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          💬 {job.comments?.length || 0}
                        </button>

                        {/* ADMIN */}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedJob(job)
                              setAdminNote(
                                job.adminNote || ''
                              )
                            }}
                            style={{
                              padding: '5px 10px',
                              background:
                                'rgba(59,130,246,0.15)',
                              border:
                                '1px solid rgba(59,130,246,0.3)',
                              borderRadius: '6px',
                              color: '#60a5fa',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ Update
                          </button>
                        )}

                        {/* STUDENT actions */}
                        {user?.role !== 'admin' && (
                          <>
                            {/* Mark complete */}
                            {job.state !== 'completed' &&
                              job.state !== 'failed' && (
                                <button
                                  onClick={() =>
                                    markComplete(job._id)
                                  }
                                  disabled={
                                    completing === job._id
                                  }
                                  style={{
                                    padding: '5px 10px',
                                    background:
                                      completing === job._id
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'rgba(16,185,129,0.15)',
                                    border: `1px solid ${
                                      completing === job._id
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'rgba(16,185,129,0.3)'
                                    }`,
                                    borderRadius: '6px',
                                    color:
                                      completing === job._id
                                        ? '#6b7280'
                                        : '#10b981',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor:
                                      completing === job._id
                                        ? 'not-allowed'
                                        : 'pointer'
                                  }}
                                >
                                  {completing === job._id
                                    ? '⏳'
                                    : '✅ Done'}
                                </button>
                              )}

                            {/* Show rating if admin rated */}
                            {job.rating && (
                              <span
                                style={{
                                  padding: '5px 10px',
                                  background:
                                    'rgba(245,158,11,0.15)',
                                  border:
                                    '1px solid rgba(245,158,11,0.3)',
                                  borderRadius: '6px',
                                  color: '#f59e0b',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                              >
                                ⭐ {job.rating}/5
                              </span>
                            )}

                            {/* Retry */}
                            {job.state === 'failed' && (
                              <button
                                onClick={() =>
                                  resubmitTask(job)
                                }
                                style={{
                                  padding: '5px 10px',
                                  background:
                                    'rgba(59,130,246,0.15)',
                                  border:
                                    '1px solid rgba(59,130,246,0.3)',
                                  borderRadius: '6px',
                                  color: '#60a5fa',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                🔄 Retry
                              </button>
                            )}
                          </>
                        )}
                      </div>
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