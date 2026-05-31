import { useState, useEffect } from 'react'
import SubmitJob from '../components/SubmitJob'
import JobTable from '../components/JobTable'
import StatsCards from '../components/StatsCards'
import AnalyticsChart from '../components/AnalyticsChart'
import ProgressCard from '../components/ProgressCard'
import NotificationPanel from '../components/NotificationPanel'
import BadgesCard from '../components/BadgesCard'
import WeeklyReport from '../components/WeeklyReport'
import CountdownTimer from '../components/CountdownTimer'
import StudentsList from '../components/StudentsList'
import AdminAnalytics from '../components/AdminAnalytics'
import AdminDashboardHome from '../components/AdminDashboardHome'
import CalendarView from '../components/CalendarView'
import ActivityHeatmap from '../components/ActivityHeatmap'
import TaskTimeTracker from '../components/TaskTimeTracker'
import AITaskSuggestions from '../components/AITaskSuggestions'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'
import useSocket from '../hooks/useSocket'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showNotif, setShowNotif] = useState(false)
  const [stats, setStats] = useState({})
  const [jobs, setJobs] = useState([])
  const { user } = useAuth()
  const { colors } = useTheme()
  const { t } = useTranslation()
const [aiSuggestion, setAiSuggestion] = useState(null)
  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs/my')
      setJobs(res.data)
    } catch {}
  }

  useEffect(() => { if (user?.role !== 'admin') fetchJobs() }, [user])

  useSocket(user?.role !== 'admin' ? {
    events: {
      'job:completed': (p) => { fetchJobs(); toast.success(`✅ Task completed: ${p?.title || 'Task'}`) },
      'job:failed': (p) => { fetchJobs(); toast.error(`❌ Task failed: ${p?.title || 'Task'}`) },
      'job:updated': fetchJobs,
      'badges:awarded': (p) => {
        // if badges awarded for current user, show toast(s) and notify badges card to refresh
        const uid = user?.id || user?._id
        if (!p || !p.userId || (uid && p.userId !== uid)) return
        const newBadges = p.newBadges || []
        newBadges.forEach(b => toast.success(`🏅 Badge earned: ${b.icon} ${b.name}!`))
        try { window.dispatchEvent(new CustomEvent('badges:updated', { detail: newBadges })) } catch (e) {}
      }
    }
  } : {})

  const adminTabs = [
    { id: 'dashboard', label: '📊 Overview' },
    { id: 'students', label: '👥 Students' },
    { id: 'analytics', label: '📈 Analytics' },
  ]

  const studentTabs = [
    { id: 'dashboard', label: `📊 ${t('dashboard')}` },
    { id: 'submit', label: `➕ ${t('submitTask')}` },
    { id: 'calendar', label: `📅 ${t('calendar')}` },
    { id: 'progress', label: `🏆 ${t('myProgress')}` },
    { id: 'ai', label: '🤖 AI Assist' },
  ]

  const tabs = user?.role === 'admin' ? adminTabs : studentTabs

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg2} 100%)`,
      transition: 'all 0.3s'
    }}>
      <Navbar onNotifClick={() => setShowNotif(true)} />

      {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}

      <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '16px', padding: '20px 24px', marginBottom: '24px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, marginBottom: '4px' }}>
              {user?.role === 'admin' ? '👑 Admin Dashboard' : `${t('welcome')}, ${user?.name}! 👋`}
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: '13px' }}>
              {user?.role === 'admin'
                ? 'Manage all student tasks and view analytics'
                : `🎓 ${user?.department || 'Student'} ${user?.rollNumber ? `• ${user.rollNumber}` : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: '10px 18px', borderRadius: '10px', border: 'none',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                  : colors.inputBg,
                color: activeTab === tab.id ? '#fff' : colors.textMuted,
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(124,58,237,0.3)' : 'none',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                border: activeTab === tab.id ? 'none' : `1px solid ${colors.cardBorder}`
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== ADMIN TABS ===== */}
        {user?.role === 'admin' && activeTab === 'dashboard' && <AdminDashboardHome />}
        {user?.role === 'admin' && activeTab === 'students' && <StudentsList />}
        {user?.role === 'admin' && activeTab === 'analytics' && <AdminAnalytics />}

        {/* ===== STUDENT TABS ===== */}
        {user?.role !== 'admin' && activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <StatsCards onStatsLoad={setStats} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <ProgressCard stats={stats} />
              <CountdownTimer jobs={jobs} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <AnalyticsChart />
              <BadgesCard />
            </div>
            <ActivityHeatmap />
            <JobTable onJobsUpdate={setJobs} />
          </div>
        )}

       {user?.role !== 'admin' && activeTab === 'submit' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <SubmitJob
      onSubmitted={() => { setActiveTab('dashboard'); setAiSuggestion(null) }}
      prefill={aiSuggestion}
    />
  </div>
)}

        {user?.role !== 'admin' && activeTab === 'calendar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <CalendarView />
            <TaskTimeTracker jobs={jobs} onUpdate={() => {}} />
          </div>
        )}

        {user?.role !== 'admin' && activeTab === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <WeeklyReport />
            <BadgesCard />
            <ActivityHeatmap />
          </div>
        )}

        {user?.role !== 'admin' && activeTab === 'ai' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <AITaskSuggestions onApply={(suggestion) => {
      setAiSuggestion(suggestion)
      setActiveTab('submit')
    }} />
  </div>
)}
      </div>
    </div>
  )
}