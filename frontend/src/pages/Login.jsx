import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!form.email || !form.password) return toast.error('Fill all fields!')
    setLoading(true)
    try {
      const res = await API.post('/auth/login', form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #030712 0%, #0f0a1e 50%, #030712 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(139,92,246,0.3)'
          }}>⚡</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
            Task Queue
          </h1>
          <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '14px' }}>
            Distributed Job Processing System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '36px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#fff' }}>
            Sign In
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px', fontWeight: '500' }}>
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                  padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px', fontWeight: '500' }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                  padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#4b5563' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
                transition: 'all 0.2s', marginTop: '4px'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>

          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '500' }}>
              Register
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px', marginTop: '24px' }}>
          College Project — Distributed Task Queue System
        </p>
      </div>
    </div>
  )
}