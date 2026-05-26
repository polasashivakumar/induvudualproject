import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const stateColors = {
  waiting: 'bg-yellow-500',
  active: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500'
}

export default function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/jobs/all'),
        axios.get('http://localhost:5000/api/jobs/stats')
      ])
      setJobs(jobsRes.data)
      setStats(statsRes.data)
    } catch {
      console.error('Failed to fetch')
    }
    setLoading(false)
  }

  const clearCompleted = async () => {
    try {
      await axios.delete('http://localhost:5000/api/jobs/completed')
      toast.success('Completed jobs cleared!')
      fetchData()
    } catch {
      toast.error('Failed to clear jobs')
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-purple-600' },
          { label: 'Waiting', value: stats.waiting, color: 'bg-yellow-500' },
          { label: 'Active', value: stats.active, color: 'bg-blue-500' },
          { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
          { label: 'Failed', value: stats.failed, color: 'bg-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{value ?? 0}</div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block text-white ${color}`}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="font-bold text-purple-400">📋 Job History (MongoDB)</h2>
          <div className="flex gap-2">
            <button onClick={fetchData}
              className="text-sm bg-gray-800 px-3 py-1 rounded hover:bg-gray-700">
              🔄 Refresh
            </button>
            <button onClick={clearCompleted}
              className="text-sm bg-red-900 px-3 py-1 rounded hover:bg-red-800">
              🗑️ Clear Completed
            </button>
          </div>
        </div>

        {loading ? (
          <p className="p-4 text-gray-400">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="p-4 text-gray-400">No jobs yet. Submit one!</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-3 text-left">Job ID</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">State</th>
                <th className="p-3 text-left">Attempts</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job._id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-3 font-mono text-xs text-gray-400">{job.jobId}</td>
                  <td className="p-3 capitalize">{job.type}</td>
                  <td className="p-3">
                    {job.priority === 1 ? '🔴 High' : job.priority === 2 ? '🟡 Medium' : '🟢 Low'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-white text-xs ${stateColors[job.state]}`}>
                      {job.state}
                    </span>
                  </td>
                  <td className="p-3">{job.attempts}</td>
                  <td className="p-3 text-gray-400">
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}