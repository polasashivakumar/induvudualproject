import { useEffect, useState } from 'react'
import API from '../api/axios'
import { FILE_BASE_URL } from '../api/config'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['ALL', 'IT', 'CSE', 'ECE', 'EEE', 'AIML', 'DS']

const deptColors = {
  IT: {
    bg: 'rgba(59,130,246,0.15)',
    color: '#60a5fa',
    border: 'rgba(59,130,246,0.3)',
  },
  CSE: {
    bg: 'rgba(124,58,237,0.15)',
    color: '#a78bfa',
    border: 'rgba(124,58,237,0.3)',
  },
  ECE: {
    bg: 'rgba(16,185,129,0.15)',
    color: '#34d399',
    border: 'rgba(16,185,129,0.3)',
  },
  EEE: {
    bg: 'rgba(245,158,11,0.15)',
    color: '#fbbf24',
    border: 'rgba(245,158,11,0.3)',
  },
  AIML: {
    bg: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    border: 'rgba(239,68,68,0.3)',
  },
  DS: {
    bg: 'rgba(6,182,212,0.15)',
    color: '#22d3ee',
    border: 'rgba(6,182,212,0.3)',
  },
}

const typeConfig = {
  assignment: { icon: '📝', label: 'Assignment' },
  lab_report: { icon: '🔬', label: 'Lab Report' },
  project_review: { icon: '💡', label: 'Project Review' },
  library_request: { icon: '📚', label: 'Library' },
  print_request: { icon: '🖨️', label: 'Print' },
}

const stateConfig = {
  waiting: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    label: '⏳ Waiting',
  },
  active: {
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    label: '⚙️ Processing',
  },
  completed: {
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
    label: '✅ Completed',
  },
  failed: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    label: '❌ Failed',
  },
}

export default function StudentsList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState(null)
  const [studentJobs, setStudentJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(false)

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [jobFilter, setJobFilter] = useState('all')

  const [adminNote, setAdminNote] = useState('')
  const [updatingJob, setUpdatingJob] = useState(null)
  const [ratingJob, setRatingJob] = useState(null)
  const [viewFile, setViewFile] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await API.get('/jobs/students-list')
      setStudents(res.data)
    } catch (err) {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentJobs = async (studentData) => {
    setSelected(studentData)
    setLoadingJobs(true)
    setJobFilter('all')

    try {
      const res = await API.get(
        `/jobs/student/${studentData.student._id}`
      )

      setStudentJobs(res.data.jobs || [])
    } catch (err) {
      toast.error('Failed to load jobs')
    } finally {
      setLoadingJobs(false)
    }
  }

  const updateJobStatus = async (jobId, state) => {
    try {
      await API.put(`/jobs/${jobId}/status`, {
        state,
        adminNote,
      })

      toast.success(`Marked as ${state}`)

      setAdminNote('')
      setUpdatingJob(null)

      if (selected) {
        fetchStudentJobs(selected)
      }
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  const archiveJob = async (jobId) => {
    try {
      await API.put(`/jobs/${jobId}/archive`)

      toast.success('Job archived')

      if (selected) {
        fetchStudentJobs(selected)
      }
    } catch (err) {
      toast.error('Failed to archive')
    }
  }

  const rateJob = async (rating) => {
    try {
      await API.put(`/jobs/${ratingJob._id}/admin-rate`, {
        rating,
        ratingNote: adminNote,
      })

      toast.success(`Rated ${rating}/5`)

      setRatingJob(null)
      setAdminNote('')

      if (selected) {
        fetchStudentJobs(selected)
      }
    } catch (err) {
      toast.error('Failed to rate')
    }
  }

  const filteredStudents = students.filter((s) => {
    const keyword = search.toLowerCase()

    const matchSearch =
      s.student.name?.toLowerCase().includes(keyword) ||
      s.student.rollNumber?.toLowerCase().includes(keyword) ||
      s.student.email?.toLowerCase().includes(keyword)

    const matchDept =
      deptFilter === 'ALL' ||
      s.student.department === deptFilter

    return matchSearch && matchDept
  })

  const filteredJobs = studentJobs.filter((job) => {
    return jobFilter === 'all' || job.state === jobFilter
  })

  const deptStats = DEPARTMENTS.filter(
    (d) => d !== 'ALL'
  ).map((dept) => {
    const deptStudents = students.filter(
      (s) => s.student.department === dept
    )

    return {
      dept,
      count: deptStudents.length,
      completed: deptStudents.reduce(
        (acc, s) => acc + s.stats.completed,
        0
      ),
      total: deptStudents.reduce(
        (acc, s) => acc + s.stats.total,
        0
      ),
    }
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Rating Modal */}
      {ratingJob && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>⭐ Rate Student Task</h3>

            <p style={{ color: '#9ca3af' }}>
              {ratingJob.title}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                margin: '20px 0',
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => rateJob(star)}
                  style={{
                    fontSize: '32px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) =>
                setAdminNote(e.target.value)
              }
              placeholder="Feedback..."
              className="input"
            />

            <button
              onClick={() => {
                setRatingJob(null)
                setAdminNote('')
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* File Viewer */}
      {viewFile && (
        <div className="modal-overlay">
          <div
            className="modal-box"
            style={{ maxWidth: '800px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <h3>📎 {viewFile.name}</h3>

              <button
                onClick={() => setViewFile(null)}
                className="btn-secondary"
              >
                ✕
              </button>
            </div>

            <div
              style={{
                maxHeight: '70vh',
                overflow: 'auto',
              }}
            >
              {viewFile.name?.match(
                /\.(jpg|jpeg|png|gif)$/i
              ) ? (
                <img
                  src={`${FILE_BASE_URL}${viewFile.url}`}
                  alt={viewFile.name}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                  }}
                />
              ) : viewFile.name?.match(/\.pdf$/i) ? (
                <iframe
                  src={`${FILE_BASE_URL}${viewFile.url}`}
                  title={viewFile.name}
                  style={{
                    width: '100%',
                    height: '600px',
                    border: 'none',
                  }}
                />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                  }}
                >
                  <p>Preview not available</p>

                  <a
                    href={`${FILE_BASE_URL}${viewFile.url}`}
                    download={viewFile.name}
                    className="download-btn"
                  >
                    ⬇️ Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Department Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(140px,1fr))',
          gap: '12px',
        }}
      >
        {deptStats.map((d) => {
          const dc = deptColors[d.dept] || {}

          const rate = d.total
            ? Math.round(
                (d.completed / d.total) * 100
              )
            : 0

          return (
            <div
              key={d.dept}
              onClick={() =>
                setDeptFilter(
                  deptFilter === d.dept
                    ? 'ALL'
                    : d.dept
                )
              }
              style={{
                padding: '16px',
                borderRadius: '16px',
                cursor: 'pointer',
                background:
                  deptFilter === d.dept
                    ? dc.bg
                    : 'rgba(17,24,39,0.6)',
                border: `1px solid ${
                  deptFilter === d.dept
                    ? dc.border
                    : 'rgba(255,255,255,0.08)'
                }`,
              }}
            >
              <h3
                style={{
                  color: dc.color,
                  marginBottom: '8px',
                }}
              >
                {d.dept}
              </h3>

              <p style={{ color: '#9ca3af' }}>
                {d.count} students
              </p>

              <p
                style={{
                  color: '#10b981',
                  fontWeight: 'bold',
                }}
              >
                {rate}% completed
              </p>
            </div>
          )
        })}
      </div>

      {/* Main Layout */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          minHeight: '70vh',
        }}
      >
        {/* Students Panel */}
        <div
          style={{
            width: '320px',
            background: 'rgba(17,24,39,0.6)',
            borderRadius: '20px',
            overflow: 'hidden',
            border:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ padding: '16px' }}>
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="input"
            />
          </div>

          <div
            style={{
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
          >
            {loading ? (
              <p
                style={{
                  padding: '20px',
                  color: '#9ca3af',
                }}
              >
                Loading...
              </p>
            ) : (
              filteredStudents.map(
                ({ student, stats }) => (
                  <div
                    key={student._id}
                    onClick={() =>
                      fetchStudentJobs({
                        student,
                        stats,
                      })
                    }
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderBottom:
                        '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <h4 style={{ color: '#fff' }}>
                      {student.name}
                    </h4>

                    <p
                      style={{
                        color: '#6b7280',
                        fontSize: '12px',
                      }}
                    >
                      {student.rollNumber}
                    </p>

                    <p
                      style={{
                        color: '#10b981',
                        fontSize: '12px',
                      }}
                    >
                      {stats.completed}/
                      {stats.total} completed
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* Jobs Panel */}
        <div
          style={{
            flex: 1,
            background: 'rgba(17,24,39,0.6)',
            borderRadius: '20px',
            overflow: 'hidden',
            border:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {!selected ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
              }}
            >
              Select a student
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: '20px',
                  borderBottom:
                    '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <h2 style={{ color: '#fff' }}>
                  {selected.student.name}
                </h2>

                <p style={{ color: '#9ca3af' }}>
                  {selected.student.email}
                </p>
              </div>

              <div
                style={{
                  maxHeight: '75vh',
                  overflowY: 'auto',
                }}
              >
                {loadingJobs ? (
                  <p
                    style={{
                      padding: '20px',
                      color: '#9ca3af',
                    }}
                  >
                    Loading jobs...
                  </p>
                ) : filteredJobs.length === 0 ? (
                  <p
                    style={{
                      padding: '20px',
                      color: '#9ca3af',
                    }}
                  >
                    No jobs found
                  </p>
                ) : (
                  filteredJobs.map((job) => (
                    <div
                      key={job._id}
                      style={{
                        padding: '16px 20px',
                        borderBottom:
                          '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              color: '#fff',
                            }}
                          >
                            {
                              typeConfig[job.type]
                                ?.icon
                            }{' '}
                            {job.title}
                          </h4>

                          <p
                            style={{
                              color: '#9ca3af',
                              fontSize: '13px',
                            }}
                          >
                            {job.description}
                          </p>

                          <div
                            style={{
                              marginTop: '8px',
                            }}
                          >
                            <span
                              style={{
                                padding:
                                  '4px 10px',
                                borderRadius:
                                  '10px',
                                background:
                                  stateConfig[
                                    job.state
                                  ]?.bg,
                                color:
                                  stateConfig[
                                    job.state
                                  ]?.color,
                                fontSize: '11px',
                              }}
                            >
                              {
                                stateConfig[
                                  job.state
                                ]?.label
                              }
                            </span>
                          </div>

                          {job.attachments
                            ?.length > 0 && (
                            <div
                              style={{
                                marginTop: '10px',
                                display: 'flex',
                                gap: '6px',
                                flexWrap: 'wrap',
                              }}
                            >
                              {job.attachments.map(
                                (
                                  file,
                                  index
                                ) => (
                                  <button
                                    key={index}
                                    onClick={() =>
                                      setViewFile(
                                        file
                                      )
                                    }
                                    className="btn-secondary"
                                  >
                                    👁️{' '}
                                    {file.name}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexDirection:
                              'column',
                            gap: '8px',
                          }}
                        >
                          <button
                            onClick={() =>
                              setUpdatingJob(job)
                            }
                            className="btn-primary"
                          >
                            ✏️ Update
                          </button>

                          <button
                            onClick={() =>
                              setRatingJob(job)
                            }
                            className="btn-secondary"
                          >
                            ⭐ Rate
                          </button>

                          <button
                            onClick={() =>
                              archiveJob(job._id)
                            }
                            className="btn-danger"
                          >
                            🗂️ Archive
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
