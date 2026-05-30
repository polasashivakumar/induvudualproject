import { useState } from 'react'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
  { value: 'IT',   label: '💻 IT'   },
  { value: 'CSE',  label: '🖥️ CSE'  },
  { value: 'ECE',  label: '📡 ECE'  },
  { value: 'EEE',  label: '⚡ EEE'  },
  { value: 'AIML', label: '🤖 AIML' },
  { value: 'DS',   label: '📊 DS'   },
]

export default function ProfilePage() {
  const { user, login } = useAuth()
  const { colors } = useTheme()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    rollNumber: user?.rollNumber || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await API.put('/auth/profile', form)
      const token = localStorage.getItem('token')
      login(res.data.user, token)
      toast.success('✅ Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '10px', padding: '11px 14px',
    color: colors.text, fontSize: '14px', outline: 'none',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box'
  }

  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.cardBorder}`,
      borderRadius: '20px', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))',
        borderBottom: `1px solid ${colors.cardBorder}`,
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: '700', color: '#fff',
          boxShadow: '0 0 20px rgba(124,58,237,0.4)'
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: colors.text, fontWeight: '800', fontSize: '20px' }}>{user?.name}</h2>
          <p style={{ color: colors.textMuted, fontSize: '13px', marginTop: '2px' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            {user?.department && (
              <span style={{
                fontSize: '11px', fontWeight: '700', padding: '2px 10px',
                borderRadius: '20px', background: 'rgba(124,58,237,0.2)', color: '#a78bfa'
              }}>
                {user.department}
              </span>
            )}
            {user?.rollNumber && (
              <span style={{
                fontSize: '11px', padding: '2px 10px',
                borderRadius: '20px', background: colors.inputBg, color: colors.textMuted
              }}>
                {user.rollNumber}
              </span>
            )}
            <span style={{
              fontSize: '11px', padding: '2px 10px',
              borderRadius: '20px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: '700'
            }}>
              🎓 Student
            </span>
          </div>
        </div>
        <button onClick={() => setEditing(!editing)} style={{
          padding: '9px 18px', flexShrink: 0,
          background: editing ? colors.inputBg : 'rgba(124,58,237,0.2)',
          border: `1px solid ${editing ? colors.inputBorder : 'rgba(124,58,237,0.3)'}`,
          borderRadius: '10px',
          color: editing ? colors.textMuted : '#a78bfa',
          fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif'
        }}>
          {editing ? '✕ Cancel' : '✏️ Edit'}
        </button>
      </div>

      {/* Form */}
      <div style={{ padding: '24px' }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Full Name
              </label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = colors.inputBorder}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Department
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                {DEPARTMENTS.map(d => (
                  <button key={d.value} onClick={() => setForm({ ...form, department: d.value })} style={{
                    padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: form.department === d.value ? 'rgba(124,58,237,0.2)' : colors.inputBg,
                    borderWidth: '1px', borderStyle: 'solid',
                    borderColor: form.department === d.value ? 'rgba(124,58,237,0.4)' : colors.inputBorder,
                    color: form.department === d.value ? '#a78bfa' : colors.textMuted,
                    fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif'
                  }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Roll Number
              </label>
              <input
                value={form.rollNumber}
                onChange={e => setForm({ ...form, rollNumber: e.target.value })}
                placeholder="e.g. CSE2023001"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = colors.inputBorder}
              />
            </div>

            <button onClick={handleSave} disabled={saving} style={{
              padding: '13px',
              background: saving ? colors.inputBg : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 15px rgba(124,58,237,0.3)',
              fontFamily: 'Inter, sans-serif'
            }}>
              {saving ? 'Saving...' : '✅ Save Changes'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Full Name', value: user?.name, icon: '👤' },
              { label: 'Email', value: user?.email, icon: '📧' },
              { label: 'Department', value: user?.department || 'Not set', icon: '🏫' },
              { label: 'Roll Number', value: user?.rollNumber || 'Not set', icon: '🎫' },
              { label: 'Role', value: 'Student', icon: '🎓' },
              { label: 'Member Since', value: new Date().getFullYear().toString(), icon: '📅' },
            ].map(field => (
              <div key={field.label} style={{
                padding: '14px', background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`, borderRadius: '12px'
              }}>
                <div style={{ color: colors.textMuted, fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {field.icon} {field.label}
                </div>
                <div style={{ color: colors.text, fontWeight: '600', fontSize: '14px' }}>
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}