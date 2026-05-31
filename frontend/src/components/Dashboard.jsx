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
import Leaderboard from '../components/Leaderboard'
import Announcements from '../components/Announcements'
import ProfilePage from '../components/ProfilePage'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showNotif, setShowNotif] = useState(false)
  const [stats, setStats] = useState({})
  const [jobs, setJobs] = useState([])
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const { user } = useAuth()
  const { colors } = useTheme()
  const { t } = useTranslation()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (user?.role !== 'admin') {
      const fetchJobs = async () => {
        try {
          const res = await API.get('/jobs/my')
          setJobs(res.data)
        } catch {}
      }
      fetchJobs()
      const interval = setInterval(fetchJobs, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  const adminTabs = [
    { id: 'dashboard', label: '📊 Overview', mobileLabel: '📊', mobileText: 'Overview' },
    { id: 'students', label: '👥 Students', mobileLabel: '👥', mobileText: 'Students' },
    { id: 'analytics', label: '📈 Analytics', mobileLabel: '📈', mobileText: 'Analytics' },
    { id: 'announcements', label: '📢 Announce', mobileLabel: '📢', mobileText: 'Announce' },
  ]

  const studentTabs = [
    { id: 'dashboard', label: '📊 Dashboard', mobileLabel: '📊', mobileText: 'Home' },
    { id: 'submit', label: '➕ Submit', mobileLabel: '➕', mobileText: 'Submit' },
    { id: 'calendar', label: '📅 Calendar', mobileLabel: '📅', mobileText: 'Calendar' },
    { id: 'progress', label: '🏆 Progress', mobileLabel: '🏆', mobileText: 'Progress' },
    { id: 'more', label: '⋯ More', mobileLabel: '⋯', mobileText: 'More' },
  ]

  const tabs = user?.role === 'admin' ? adminTabs : studentTabs

  const renderContent = () => {
    if (user?.role === 'admin') {
      if (activeTab === 'dashboard') return <AdminDashboardHome />
      if (activeTab === 'students') return <StudentsList />
      if (activeTab === 'analytics') return <AdminAnalytics />
      if (activeTab === 'announcements') return <Announcements isAdmin={true} />
    } else {
      if (activeTab === 'dashboard') return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', overflow: 'hidden' }}>
          <StatsCards onStatsLoad={setStats} />

          {/* ✅ FIX: stack on mobile, side by side on desktop */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <ProgressCard stats={stats} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <CountdownTimer jobs={jobs} />
            </div>
          </div>

          {!isMobile && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              width: '100%',
              overflow: 'hidden'
            }}>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <AnalyticsChart />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <BadgesCard />
              </div>
            </div>
          )}
          {isMobile && <BadgesCard />}
          <ActivityHeatmap />
          <JobTable onJobsUpdate={setJobs} />
        </div>
      )
      if (activeTab === 'submit') return (
        <SubmitJob
          onSubmitted={() => { setActiveTab('dashboard'); setAiSuggestion(null) }}
          prefill={aiSuggestion}
        />
      )
      if (activeTab === 'calendar') return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CalendarView />
          <TaskTimeTracker jobs={jobs} onUpdate={() => {}} />
        </div>
      )
      if (activeTab === 'progress') return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WeeklyReport />
          <BadgesCard />
          <Leaderboard />
        </div>
      )
      if (activeTab === 'more') return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ProfilePage />
          <AITaskSuggestions onApply={(s) => {
            setAiSuggestion(s)
            setActiveTab('submit')
            toast.success('AI suggestion applied!')
          }} />
          <Announcements isAdmin={false} />
        </div>
      )
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg2} 100%)`,
      paddingBottom: isMobile ? '70px' : '0',
      overflowX: 'hidden', // ✅ FIX
      width: '100%'        // ✅ FIX
    }}>
      <Navbar onNotifClick={() => setShowNotif(true)} />

      {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}

      {/* Desktop tab bar */}
      {!isMobile && (
        <div style={{
          background: colors.navBg, borderBottom: `1px solid ${colors.navBorder}`,
          padding: '0 32px', display: 'flex', gap: '4px', alignItems: 'center'
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '14px 20px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: activeTab === tab.id ? '#a78bfa' : colors.textMuted,
              fontSize: '13px', fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              borderBottom: activeTab === tab.id ? '2px solid #7c3aed' : '2px solid transparent',
              transition: 'all 0.2s'
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{
        padding: isMobile ? '16px' : '24px 32px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',       // ✅ FIX
        overflowX: 'hidden'  // ✅ FIX
      }}>
        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '14px',
          padding: isMobile ? '14px 16px' : '18px 24px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: isMobile ? '18px' : '22px',
            fontWeight: '800', color: colors.text, marginBottom: '4px'
          }}>
            {user?.role === 'admin' ? '👑 Admin Dashboard' : `${t('welcome')}, ${user?.name}! 👋`}
          </h2>
          <p style={{ color: colors.textSecondary, fontSize: isMobile ? '12px' : '13px' }}>
            {user?.role === 'admin'
              ? 'Manage all student tasks'
              : `🎓 ${user?.department || 'Student'} ${user?.rollNumber ? `• ${user.rollNumber}` : ''}`}
          </p>
        </div>

        {renderContent()}
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: colors.navBg,
          borderTop: `1px solid ${colors.navBorder}`,
          display: 'flex', zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px 4px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: '3px',
              color: activeTab === tab.id ? '#a78bfa' : colors.textMuted,
              fontFamily: 'Inter, sans-serif', transition: 'all 0.15s'
            }}>
              <div style={{
                fontSize: '20px',
                background: activeTab === tab.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                borderRadius: '8px', padding: '4px 12px',
                transition: 'all 0.15s'
              }}>
                {tab.mobileLabel}
              </div>
              <span style={{ fontSize: '10px', fontWeight: '600' }}>
                {tab.mobileText}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
