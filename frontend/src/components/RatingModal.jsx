import { useState } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function RatingModal({ job, onClose, onRated }) {
  const [rating, setRating] = useState(job.rating || 0)
  const [hover, setHover] = useState(0)
  const [note, setNote] = useState(job.ratingNote || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a rating!')
    setLoading(true)
    try {
      await API.put(`/jobs/${job._id}/rate`, { rating, ratingNote: note })
      toast.success('⭐ Rating submitted!')
      onRated?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to rate')
    }
    setLoading(false)
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px'
      }}>
        <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '18px', marginBottom: '6px' }}>
          ⭐ Rate This Task
        </h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
          {job.title}
        </p>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseOver={() => setHover(star)}
              onMouseOut={() => setHover(0)}
              style={{
                fontSize: '36px', background: 'none', border: 'none',
                cursor: 'pointer', transition: 'transform 0.1s',
                transform: (hover || rating) >= star ? 'scale(1.2)' : 'scale(1)',
                filter: (hover || rating) >= star ? 'none' : 'grayscale(1) opacity(0.3)'
              }}
            >⭐</button>
          ))}
        </div>

        {/* Label */}
        <p style={{ textAlign: 'center', color: '#f59e0b', fontWeight: '700', fontSize: '14px', marginBottom: '20px', minHeight: '20px' }}>
          {labels[hover || rating]}
        </p>

        {/* Note */}
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Any feedback or comments? (optional)"
          rows={3}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            padding: '12px', color: '#fff', fontSize: '14px', outline: 'none',
            fontFamily: 'Inter, sans-serif', resize: 'none', marginBottom: '16px'
          }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1, padding: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none', borderRadius: '10px', color: '#fff',
            fontWeight: '700', fontSize: '14px', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif'
          }}>
            {loading ? 'Submitting...' : '⭐ Submit Rating'}
          </button>
          <button onClick={onClose} style={{
            padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            color: '#9ca3af', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '600'
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}