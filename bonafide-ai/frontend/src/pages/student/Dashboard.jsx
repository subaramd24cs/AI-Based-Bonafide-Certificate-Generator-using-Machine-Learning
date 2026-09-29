import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { applicationsAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { FileText, Clock, CheckCircle2, XCircle, Plus, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await applicationsAPI.getMy({ limit: 5, sort: '-createdAt' })
      const apps = res.data.applications || res.data || []
      setRecentApps(Array.isArray(apps) ? apps.slice(0, 5) : [])

      const all = res.data.total || apps.length || 0
      const pending = (Array.isArray(apps) ? apps : []).filter(a => a.adminStatus === 'pending').length
      const approved = (Array.isArray(apps) ? apps : []).filter(a => a.adminStatus === 'approved').length
      const rejected = (Array.isArray(apps) ? apps : []).filter(a => a.adminStatus === 'rejected').length

      setStats({ total: all, pending, approved, rejected })
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <StudentLayout><LoadingSpinner message="Loading dashboard..." /></StudentLayout>

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
            <p className="text-white/50 mt-1">Here&apos;s an overview of your applications.</p>
          </div>
          <Link to="/student/apply" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Application
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={FileText} title="Total Applications" value={stats.total} color="royal-500" />
          <StatsCard icon={Clock} title="Pending" value={stats.pending} color="amber-500" />
          <StatsCard icon={CheckCircle2} title="Approved" value={stats.approved} color="emerald-500" />
          <StatsCard icon={XCircle} title="Rejected" value={stats.rejected} color="red-500" />
        </div>

        <div className="glass-card">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
            <Link to="/student/applications" className="text-sm text-royal-500 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Application ID</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Purpose</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-white/40">
                      No applications yet. <Link to="/student/apply" className="text-royal-500 hover:underline">Apply now</Link>
                    </td>
                  </tr>
                ) : (
                  recentApps.map((app) => (
                    <tr key={app._id} className="table-row">
                      <td className="px-6 py-4">
                        <Link to={`/student/applications/${app._id}`} className="text-royal-500 hover:underline font-mono text-sm">
                          {app.applicationId || app._id?.slice(-8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">{app.purpose || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-white/50">{formatDate(app.createdAt)}</td>
                      <td className="px-6 py-4"><StatusBadge status={app.adminStatus} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/student/apply" className="glass-card glass-card-hover p-6 text-center group">
            <Plus className="w-8 h-8 text-royal-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-white">Apply for Bonafide</p>
            <p className="text-sm text-white/40 mt-1">Submit a new application</p>
          </Link>
          <Link to="/student/applications" className="glass-card glass-card-hover p-6 text-center group">
            <FileText className="w-8 h-8 text-sky-blue mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-white">Track Applications</p>
            <p className="text-sm text-white/40 mt-1">View application status</p>
          </Link>
          <Link to="/student/certificates" className="glass-card glass-card-hover p-6 text-center group">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-white">My Certificates</p>
            <p className="text-sm text-white/40 mt-1">Download certificates</p>
          </Link>
        </div>
      </div>
    </StudentLayout>
  )
}
