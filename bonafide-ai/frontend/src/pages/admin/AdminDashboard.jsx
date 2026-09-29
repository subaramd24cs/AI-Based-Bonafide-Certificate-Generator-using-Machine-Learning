import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { adminAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FileText, Clock, CheckCircle2, XCircle, Users, Eye } from 'lucide-react'

const COLORS = ['#4169E1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#87CEEB']

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, totalStudents: 0 })
  const [recentApps, setRecentApps] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [deptData, setDeptData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const [dashRes, monthlyRes, deptRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getReportsMonthly().catch(() => ({ data: { data: [] } })),
        adminAPI.getReportsDepartment().catch(() => ({ data: { data: [] } })),
      ])

      const dash = dashRes.data
      setStats({
        total: dash.total || 0,
        pending: dash.pending || 0,
        approved: dash.approved || 0,
        rejected: dash.rejected || 0,
        totalStudents: dash.totalStudents || 0,
      })
      setRecentApps(dash.recentApplications || [])
      setMonthlyData(monthlyRes.data.data || monthlyRes.data || [])
      setDeptData(deptRes.data.data || deptRes.data || [])
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <AdminLayout><LoadingSpinner message="Loading dashboard..." /></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/50 mt-1">Overview of all applications and system metrics.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard icon={FileText} title="Total Applications" value={stats.total} color="royal-500" />
          <StatsCard icon={Clock} title="Pending" value={stats.pending} color="amber-500" />
          <StatsCard icon={CheckCircle2} title="Approved" value={stats.approved} color="emerald-500" />
          <StatsCard icon={XCircle} title="Rejected" value={stats.rejected} color="red-500" />
          <StatsCard icon={Users} title="Total Students" value={stats.totalStudents} color="purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Chart */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Applications by Month</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#4169E1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Chart */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Department-wise Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="department"
                    label={({ department, percent }) => `${department?.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                  >
                    {deptData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="glass-card">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
            <Link to="/admin/applications" className="text-sm text-royal-500 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">ID</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Purpose</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-white/40">No applications yet</td>
                  </tr>
                ) : (
                  recentApps.slice(0, 5).map((app) => (
                    <tr key={app._id} className="table-row">
                      <td className="px-6 py-4 font-mono text-sm text-royal-500">{app.applicationId || app._id?.slice(-8)}</td>
                      <td className="px-6 py-4 text-sm text-white/70">{app.studentName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-white/50">{app.purpose}</td>
                      <td className="px-6 py-4 text-sm text-white/50">{formatDate(app.createdAt)}</td>
                      <td className="px-6 py-4"><StatusBadge status={app.adminStatus} /></td>
                      <td className="px-6 py-4">
                        <Link to={`/admin/applications/${app._id}`} className="text-royal-500 hover:underline text-sm flex items-center gap-1">
                          <Eye className="w-4 h-4" /> View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
