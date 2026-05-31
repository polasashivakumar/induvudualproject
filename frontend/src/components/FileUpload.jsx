import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { API_ORIGIN } from '../api/config'

const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

export default function FileUpload({ onUploaded, existingFiles = [] }) {
  const [files, setFiles] = useState(existingFiles)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const inputRef = useRef()

  const getFileIcon = (name) => {
    const ext = name?.split('.').pop()?.toLowerCase()

    if (videoExts.includes(`.${ext}`)) return '🎬'
    if (imageExts.includes(`.${ext}`)) return '🖼️'
    if (ext === 'pdf') return '📄'
    if (['doc', 'docx'].includes(ext)) return '📝'
    if (ext === 'zip') return '📦'

    return '📎'
  }

  const formatSize = (bytes) => {
    if (!bytes) return ''

    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`

    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const uploadFile = async (file) => {
    const maxSize = 100 * 1024 * 1024 // 100MB

    if (file.size > maxSize) {
      toast.error('File too large! Max 100MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')

    setUploading(true)
    setUploadProgress(0)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(
            Math.round((e.loaded / e.total) * 100)
          )
        }
      }

      const result = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText)

            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(data)
            } else {
              reject(
                new Error(data?.error || 'Upload failed')
              )
            }
          } catch {
            reject(new Error('Invalid server response'))
          }
        }

        xhr.onerror = () =>
          reject(new Error('Upload failed'))

        xhr.open('POST', `${API_ORIGIN}/api/upload`)
        xhr.setRequestHeader(
          'Authorization',
          `Bearer ${token}`
        )

        xhr.send(formData)
      })

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      const updated = [...files, result.file]

      setFiles(updated)
      onUploaded?.(updated)

      toast.success(`✅ ${file.name} uploaded!`)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    }

    setUploading(false)
    setUploadProgress(0)
  }

  const removeFile = (index) => {
    const updated = files.filter(
      (_, i) => i !== index
    )

    setFiles(updated)
    onUploaded?.(updated)
  }

  return (
    <div>
      <div
        onClick={() =>
          !uploading && inputRef.current?.click()
        }
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)

          const file = e.dataTransfer.files?.[0]

          if (file) uploadFile(file)
        }}
        style={{
          border: `2px dashed ${
            dragOver
              ? '#7c3aed'
              : 'rgba(255,255,255,0.15)'
          }`,
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragOver
            ? 'rgba(124,58,237,0.08)'
            : 'rgba(255,255,255,0.03)',
          transition: 'all 0.2s'
        }}
      >
        <div
          style={{
            fontSize: '28px',
            marginBottom: '8px'
          }}
        >
          {uploading ? '⏳' : '📎'}
        </div>

        <p
          style={{
            color: '#9ca3af',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          {uploading
            ? `Uploading... ${uploadProgress}%`
            : 'Click or drag files here'}
        </p>

        <p
          style={{
            color: '#4b5563',
            fontSize: '11px',
            marginTop: '4px'
          }}
        >
          PDF, DOC, Images, ZIP, Videos • Max 100MB
        </p>

        {uploading && (
          <div
            style={{
              marginTop: '12px',
              height: '6px',
              background:
                'rgba(255,255,255,0.1)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${uploadProgress}%`,
                background:
                  'linear-gradient(90deg,#7c3aed,#4f46e5)',
                transition: 'width 0.2s'
              }}
            />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip,.mp4,.mov,.avi,.mkv,.webm"
          onChange={(e) => {
            const file = e.target.files?.[0]

            if (file) uploadFile(file)
          }}
        />
      </div>

      {files.length > 0 && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {files.map((f, i) => {
            const isVideo = videoExts.some((ext) =>
              f.name?.toLowerCase().endsWith(ext)
            )

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background:
                    'rgba(255,255,255,0.04)',
                  border:
                    '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '10px 14px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span
                    style={{ fontSize: '20px' }}
                  >
                    {getFileIcon(f.name)}
                  </span>

                  <div>
                    <div
                      style={{
                        color: '#e5e7eb',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      {f.name}
                    </div>

                    <div
                      style={{
                        color: '#4b5563',
                        fontSize: '11px'
                      }}
                    >
                      {isVideo
                        ? '🎬 Video'
                        : '📎 File'}
                      {f.size
                        ? ` • ${formatSize(
                            f.size
                          )}`
                        : ''}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '6px'
                  }}
                >
                  {f.url && (
                    <a
                      href={`${API_ORIGIN}${f.url}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '4px 10px',
                        background:
                          'rgba(124,58,237,0.2)',
                        border:
                          '1px solid rgba(124,58,237,0.3)',
                        borderRadius: '6px',
                        color: '#a78bfa',
                        fontSize: '11px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      {isVideo
                        ? '▶️ Play'
                        : '👁️ View'}
                    </a>
                  )}

                  <button
                    onClick={() => removeFile(i)}
                    style={{
                      padding: '4px 10px',
                      background:
                        'rgba(239,68,68,0.15)',
                      border:
                        '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '6px',
                      color: '#f87171',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily:
                        'Inter, sans-serif'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}