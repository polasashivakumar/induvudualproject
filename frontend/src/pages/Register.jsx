import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
  { value: 'IT', label: '💻 Information Technology' },
  { value: 'CSE', label: '🖥️ Computer Science Engineering' },
  { value: 'ECE', label: '📡 Electronics & Communication' },
  { value: 'EEE', label: '⚡ Electrical & Electronics' },
  { value: 'AIML', label: '🤖 AI & Machine Learning' },
  { value: 'DS', label: '📊 Data Science' },
]

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    department: '', rollNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password)
      return toast.error('Fill all required fields!')
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters!')
    if (!form.department)
      return toast.error('Please select your department!')

    setLoading(true)
    try {
      const res = await API.post('/auth/register', form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome, ${res.data.user.name}! 🎓`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(circle, rgba(109,40,217,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6d28d9, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
            boxShadow: '0 12px 30px rgba(109,40,217,0.18)'
          }}>🎓</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
            College Task Queue
          </h1>
          <p style={{ color: '#475569', marginTop: '6px', fontSize: '14px' }}>
            Student Task Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(148,163,184,0.22)',
          borderRadius: '20px', padding: '36px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(15,23,42,0.08)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#0f172a' }}>
            Create Student Account
          </h2>
          <p style={{ color: '#475569', fontSize: '13px', marginBottom: '24px' }}>
            Fill in your details to get started
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: '600' }}>
                Full Name *
              </label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: '600' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@college.edu"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: '600' }}>
                Password * (min 6 chars)
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Department */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '600' }}>
                Department *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {DEPARTMENTS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setForm({ ...form, department: d.value })}
                    style={{
                      padding: '10px 12px', borderRadius: '10px', border: 'none',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif',
                      background: form.department === d.value
                        ? 'rgba(109,40,217,0.12)'
                        : '#f8fafc',
                      borderWidth: '1px', borderStyle: 'solid',
                      borderColor: form.department === d.value
                        ? 'rgba(109,40,217,0.3)'
                        : 'rgba(148,163,184,0.25)',
                      color: form.department === d.value ? '#0f172a' : '#475569',
                      fontSize: '12px', fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Roll Number */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: '600' }}>
                Roll Number
              </label>
              <input
                value={form.rollNumber}
                onChange={e => setForm({ ...form, rollNumber: e.target.value })}
                placeholder="e.g. CSE2023001"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #6d28d9, #2563eb)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '15px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 10px 24px rgba(109,40,217,0.22)',
                marginTop: '6px', fontFamily: 'Inter, sans-serif'
              }}
            >
              {loading ? 'Creating account...' : '🎓 Register as Student'}
            </button>
          </div>

          <p style={{ textAlign: 'center', color: '#475569', marginTop: '20px', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6d28d9', textDecoration: 'none', fontWeight: '500' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}