import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedToaster />
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#ffffff', color: '#0f172a',
              border: '1px solid rgba(15,23,42,0.08)',
              borderRadius: '12px', fontSize: '13px'
            }
          }} />
          <div style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

function ThemedToaster() {
  // This component will be rendered inside ThemeProvider
  try {
    const { colors } = useTheme()
    return (<Toaster position="top-right" toastOptions={{
      style: {
        background: colors.card, color: colors.text,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px', fontSize: '13px'
      }
    }} />)
  } catch (e) {
    return <Toaster position="top-right" />
  }
}
