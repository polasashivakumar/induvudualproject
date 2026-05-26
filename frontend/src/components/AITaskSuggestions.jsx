import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function AITaskSuggestions({ onApply }) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [taskType, setTaskType] = useState('assignment')
  const [subject, setSubject] = useState('')
  const { colors } = useTheme()

  const getSuggestions = async () => {
    if (!subject.trim()) return toast.error('Enter a subject first!')
    setLoading(true)
    setSuggestions([])
    try {
      const res = await API.post('/ai/suggest', { taskType, subject })
      setSuggestions(res.data.suggestions)
      toast.success('✨ Suggestions ready!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI suggestion failed')
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: '20px', padding: '28px',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '28px' }}>🤖</span>
          <h3 style={{ color: colors.text, fontWeight: '700', fontSize: '18px' }}>
            AI Task Suggestions
          </h3>
        </div>
        <p style={{ color: colors.textMuted, fontSize: '13px' }}>
          Tell AI your subject and it will suggest task titles and descriptions for you
        </p>
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          value={taskType}
          onChange={e => setTaskType(e.target.value)}
          style={{
            background: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: '10px', padding: '11px 14px',
            color: colors.text, fontSize: '13px',
            outline: 'none', fontFamily: 'Inter, sans-serif',
            cursor: 'pointer'
          }}
        >
          <option value="assignment">📝 Assignment</option>
          <option value="lab_report">🔬 Lab Report</option>
          <option value="project_review">💡 Project Review</option>
          <option value="library_request">📚 Library Request</option>
          <option value="print_request">🖨️ Print Request</option>
        </select>

        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Enter subject (e.g. Data Structures, DBMS, OS...)"
          onKeyDown={e => e.key === 'Enter' && getSuggestions()}
          style={{
            flex: 1, minWidth: '200px',
            background: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: '10px', padding: '11px 14px',
            color: colors.text, fontSize: '13px',
            outline: 'none', fontFamily: 'Inter, sans-serif'
          }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = colors.inputBorder}
        />

        <button
          onClick={getSuggestions}
          disabled={loading}
          style={{
            padding: '11px 22px',
            background: loading
              ? colors.inputBg
              : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: loading ? `1px solid ${colors.inputBorder}` : 'none',
            borderRadius: '10px', color: loading ? colors.textMuted : '#fff',
            fontWeight: '700', fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(124,58,237,0.3)',
            transition: 'all 0.2s'
          }}
        >
          {loading ? '✨ Thinking...' : '✨ Get Suggestions'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '40px',
          background: colors.inputBg,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: '14px'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>✨</div>
         <p style={{ color: colors.textSecondary, fontWeight: '500' }}>
  AI is thinking...
</p>
<p style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px' }}>
  Generating 3 suggestions for your {taskType.replace('_', ' ')}
</p>
        </div>
      )}

      {/* Suggestions */}
      {!loading && suggestions.length > 0 && (
        <div>
          <p style={{ color: colors.textMuted, fontSize: '12px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ✨ AI suggests:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{
                padding: '16px', background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '14px', transition: 'all 0.2s'
              }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.background = 'rgba(124,58,237,0.08)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = colors.inputBorder
                  e.currentTarget.style.background = colors.inputBg
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{
                        background: 'rgba(124,58,237,0.2)', color: '#a78bfa',
                        fontSize: '10px', fontWeight: '700', padding: '2px 8px',
                        borderRadius: '20px'
                      }}>
                        Option {i + 1}
                      </span>
                    </div>
                    <div style={{ color: colors.text, fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
                      {s.title}
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: 1.6 }}>
                      {s.description}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onApply?.(s)
                      toast.success('✅ Applied to form!')
                    }}
                    style={{
                      padding: '8px 16px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      border: 'none', borderRadius: '8px', color: '#fff',
                      fontSize: '12px', fontWeight: '700',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      boxShadow: '0 2px 8px rgba(124,58,237,0.3)'
                    }}
                  >
                    Use This →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p style={{ color: colors.textMuted, fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
            Click "Use This" to auto-fill the submit form
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && suggestions.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '40px',
          background: colors.inputBg,
          border: `1px dashed ${colors.inputBorder}`,
          borderRadius: '14px'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
          <p style={{ color: colors.textSecondary, fontWeight: '500', marginBottom: '6px' }}>
            AI-Powered Task Suggestions
          </p>
          <p style={{ color: colors.textMuted, fontSize: '13px' }}>
            Select a task type, enter your subject, and Claude will suggest 3 professional task titles and descriptions
          </p>
        </div>
      )}
    </div>
  )
}