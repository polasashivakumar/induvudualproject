import { useState, useEffect } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import FileUpload from './FileUpload'

const taskTypes = [
  { value: 'assignment', icon: '📝', label: 'Assignment', desc: 'Submit assignment' },
  { value: 'lab_report', icon: '🔬', label: 'Lab Report', desc: 'Submit lab report' },
  { value: 'project_review', icon: '💡', label: 'Project', desc: 'Request review' },
  { value: 'library_request', icon: '📚', label: 'Library', desc: 'Book request' },
  { value: 'print_request', icon: '🖨️', label: 'Print', desc: 'Print request' },
]

const priorities = [
  { value: 1, icon: '🔴', label: 'Urgent', color: '#ef4444' },
  { value: 2, icon: '🟡', label: 'Normal', color: '#f59e0b' },
  { value: 3, icon: '🟢', label: 'Low', color: '#10b981' },
]

const templates = [
  { id: 'lab_os', icon: '🖥️', label: 'OS Lab', type: 'lab_report', title: '', description: 'Operating Systems lab experiment report submission.' },
  { id: 'lab_ds', icon: '🔢', label: 'DS Lab', type: 'lab_report', title: '', description: 'Data Structures lab program and output submission.' },
  { id: 'lab_dbms', icon: '🗄️', label: 'DBMS Lab', type: 'lab_report', title: '', description: 'Database Management Systems lab SQL queries and results.' },
  { id: 'lab_cn', icon: '🌐', label: 'CN Lab', type: 'lab_report', title: '', description: 'Computer Networks lab practical submission.' },
  { id: 'lab_java', icon: '☕', label: 'Java Lab', type: 'lab_report', title: '', description: 'Java programming lab exercise submission.' },
  { id: 'lab_python', icon: '🐍', label: 'Python Lab', type: 'lab_report', title: '', description: 'Python programming lab exercise submission.' },
  { id: 'notes_print', icon: '📄', label: 'Print Notes', type: 'print_request', title: '', description: 'Requesting printout of study notes/material.' },
  { id: 'notes_syllabus', icon: '📋', label: 'Syllabus Copy', type: 'print_request', title: '', description: 'Requesting printed copy of syllabus.' },
  { id: 'assign_theory', icon: '✏️', label: 'Theory Assignment', type: 'assignment', title: '', description: 'Theory subject assignment submission.' },
  { id: 'assign_mini', icon: '💻', label: 'Mini Project', type: 'project_review', title: '', description: 'Mini project submission for review.' },
  { id: 'lib_ref', icon: '📚', label: 'Reference Book', type: 'library_request', title: '', description: 'Requesting reference book from college library.' },
  { id: 'lib_renew', icon: '🔄', label: 'Book Renewal', type: 'library_request', title: '', description: 'Requesting renewal of currently borrowed book.' },
]

export default function SubmitJob({ onSubmitted, prefill }) {
  const [form, setForm] = useState({
    type: prefill?.type || 'assignment',
    title: prefill?.title || '',
    description: prefill?.description || '',
    priority: prefill?.priority || 2,
    dueDate: prefill?.dueDate || ''
  })
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [usedTemplate, setUsedTemplate] = useState('')
  const [templateSearch, setTemplateSearch] = useState('')

  // ✅ MOBILE FIX
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (prefill) {
      setForm(f => ({
        ...f,
        type: prefill.type || f.type,
        title: prefill.title || f.title,
        description: prefill.description || f.description,
        priority: prefill.priority || f.priority,
        dueDate: prefill.dueDate || f.dueDate,
      }))
    }
  }, [prefill])

  const applyTemplate = (t) => {
    setForm(f => ({
      ...f, type: t.type,
      description: t.description,
    }))
    setUsedTemplate(t.id)
    setShowTemplates(false)
    toast.success(`✅ Template applied! Add your title below.`)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Please enter a task title!')
    setLoading(true)
    try {
      await API.post('/jobs/submit', {
        type: form.type,
        title: form.title,
        description: form.description,
        priority: Number(form.priority),
        dueDate: form.dueDate || null,
        templateUsed: usedTemplate,
        attachments
      })
      toast.success('✅ Task submitted successfully!')
      setForm({ type: 'assignment', title: '', description: '', priority: 2, dueDate: '' })
      setAttachments([])
      setUsedTemplate('')
      onSubmitted?.()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  }

  const filteredTemplates = templates.filter(t =>
    t.label.toLowerCase().includes(templateSearch.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{
        background: 'rgba(17,24,39,0.8)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', padding: isMobile ? '20px 16px' : '32px',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
              📋 Submit New Task
            </h2>
            <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
              Fill in the details or use a template to get started quickly
            </p>
          </div>
          <button onClick={() => setShowTemplates(!showTemplates)} style={{
            padding: '9px 16px',
            background: showTemplates ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px',
            color: '#a78bfa', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            ⚡ Templates
          </button>
        </div>

        {showTemplates && (
          <div style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '14px', padding: '16px', marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '600' }}>
                ⚡ Quick Templates
              </p>
              <input
                value={templateSearch}
                onChange={e => setTemplateSearch(e.target.value)}
                placeholder="Search templates..."
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '6px 12px',
                  color: '#fff', fontSize: '12px', outline: 'none',
                  fontFamily: 'Inter, sans-serif', width: '160px'
                }}
              />
            </div>
            {[
              { group: '🔬 Lab Reports', items: filteredTemplates.filter(t => t.type === 'lab_report') },
              { group: '📝 Assignments', items: filteredTemplates.filter(t => t.type === 'assignment') },
              { group: '🖨️ Print Requests', items: filteredTemplates.filter(t => t.type === 'print_request') },
              { group: '💡 Project Reviews', items: filteredTemplates.filter(t => t.type === 'project_review') },
              { group: '📚 Library', items: filteredTemplates.filter(t => t.type === 'library_request') },
            ].filter(g => g.items.length > 0).map(group => (
              <div key={group.group} style={{ marginBottom: '12px' }}>
                <p style={{ color: '#4b5563', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {group.group}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {group.items.map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t)} style={{
                      padding: '7px 12px',
                      background: usedTemplate === t.id ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${usedTemplate === t.id ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '8px', color: usedTemplate === t.id ? '#a78bfa' : '#9ca3af',
                      fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '5px'
                    }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {usedTemplate && (
          <div style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '8px', padding: '8px 14px',
            marginBottom: '20px', fontSize: '12px',
            color: '#10b981', fontWeight: '500',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>✅ Template applied — enter your task title below</span>
            <button onClick={() => setUsedTemplate('')} style={{
              background: 'none', border: 'none', color: '#6b7280',
              cursor: 'pointer', fontSize: '14px'
            }}>✕</button>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Task Type
          </label>
          {/* ✅ MOBILE FIX: 3 cols on mobile, 5 on desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : 'repeat(5,1fr)', gap: '8px' }}>
            {taskTypes.map(t => (
              <button key={t.value} onClick={() => setForm({ ...form, type: t.value })} style={{
                padding: '12px 6px', borderRadius: '12px', border: 'none',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
                background: form.type === t.value ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                borderWidth: '1px', borderStyle: 'solid',
                borderColor: form.type === t.value ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)',
                color: form.type === t.value ? '#fff' : '#6b7280',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: '600' }}>{t.label}</div>
                <div style={{ fontSize: '10px', color: form.type === t.value ? '#a78bfa' : '#4b5563', marginTop: '2px' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Task Title * <span style={{ color: '#4b5563', textTransform: 'none', fontWeight: '400' }}>(type your own title)</span>
          </label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. OS Lab Experiment 5 — CPU Scheduling"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#7c3aed'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Add details, requirements or notes..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = '#7c3aed'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📎 Attachments
          </label>
          <FileUpload onUploaded={setAttachments} existingFiles={attachments} />
        </div>

        {/* ✅ MOBILE FIX: stack priority + due date on mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Priority
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {priorities.map(p => (
                <button key={p.value} onClick={() => setForm({ ...form, priority: p.value })} style={{
                  flex: 1, padding: '10px 4px', borderRadius: '8px',
                  border: 'none', cursor: 'pointer',
                  background: form.priority === p.value ? `${p.color}22` : 'rgba(255,255,255,0.04)',
                  borderWidth: '1px', borderStyle: 'solid',
                  borderColor: form.priority === p.value ? `${p.color}55` : 'rgba(255,255,255,0.08)',
                  color: form.priority === p.value ? p.color : '#6b7280',
                  fontSize: '11px', fontWeight: '600', fontFamily: 'Inter, sans-serif'
                }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '14px',
          background: loading ? '#374151' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: 'none', borderRadius: '12px', color: '#fff',
          fontSize: '15px', fontWeight: '700',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
          fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
        }}>
          {loading ? '⏳ Submitting...' : '📋 Submit Task'}
        </button>
      </div>
    </div>
  )
}