import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { API_ORIGIN } from '../config'

export default function FileUpload({ onUploaded, existingFiles = [] }) {
  const [files, setFiles] = useState(existingFiles)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    setUploading(true)
    try {
      // ✅ FIX: use API_ORIGIN instead of localhost:5000
      const res = await fetch(`${API_ORIGIN}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      const newFile = data.file
      const updated = [...files, newFile]
      setFiles(updated)
      onUploaded?.(updated)
      toast.success(`📎 ${file.name} uploaded!`)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    }
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const removeFile = (i) => {
    const updated = files.filter((_, idx) => idx !== i)
    setFiles(updated)
    onUploaded?.(updated)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const getIcon = (name) => {
    const ext = name?.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext)) return '📄'
    if (['doc', 'docx'].includes(ext)) return '📝'
    if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️'
    if (['zip'].includes(ext)) return '📦'
    return '📎'
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#7c3aed' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>
          {uploading ? '⏳' : '📎'}
        </div>
        <p style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>
          {uploading ? 'Uploading...' : 'Click or drag files here'}
        </p>
        <p style={{ color: '#4b5563', fontSize: '11px', marginTop: '4px' }}>
          PDF, DOC, DOCX, JPG, PNG, ZIP • Max 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip"
          onChange={e => e.target.files[0] && uploadFile(e.target.files[0])}
        />
      </div>

      {/* Uploaded files */}
      {files.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '10px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{getIcon(f.name)}</span>
                <div>
                  <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: '500' }}>{f.name}</div>
                  {f.size && <div style={{ color: '#4b5563', fontSize: '11px' }}>{formatSize(f.size)}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {f.url && (
                  // ✅ FIX: use API_ORIGIN instead of localhost:5000
                  <a href={`${API_ORIGIN}${f.url}`} target="_blank" rel="noreferrer" style={{
                    padding: '4px 10px', background: 'rgba(124,58,237,0.2)',
                    border: '1px solid rgba(124,58,237,0.3)', borderRadius: '6px',
                    color: '#a78bfa', fontSize: '11px', fontWeight: '600',
                    textDecoration: 'none'
                  }}>
                    👁️ View
                  </a>
                )}
                <button onClick={() => removeFile(i)} style={{
                  padding: '4px 10px', background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px',
                  color: '#f87171', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}