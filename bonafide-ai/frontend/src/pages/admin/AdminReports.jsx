import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatsCard from '../../components/StatsCard'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts'
import { FileText, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'

const COLORS = ['#4169E1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#87CEEB', '#ec4899', '#14b8a6']

export default function AdminReports() {
  const [monthlyData, setMonthlyData] = useState([])
  const [deptData, setDeptData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const [monthlyRes, deptRes, dashRes] = await Promise.all([
        adminAPI.getReportsMonthly().catch(() => ({ data: { data: [] } })),
        adminAPI.getReportsDepartment().catch(() => ({ data: { data: [] } })),
        adminAPI.getDashboard().catch(() => ({ data: {} })),
      ])

      setMonthlyData(monthlyRes.data.data || monthlyRes.data || [])
      setDeptData(deptRes.data.data || deptRes.data || [])

      const dash = dashRes.data
      setStats({
        total: dash.total || 0,
        approved: dash.approved || 0,
        rejected: dash.rejected || 0,
        pending: dash.pending || 0,
      })

      setStatusData([
        { name: 'Approved', value: dash.approved || 0 },
        { name: 'Pending', value: dash.pending || 0 },
        { name: 'Rejected', value: dash.rejected || 0 },
      ])
    } catch (err) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <AdminLayout><LoadingSpinner message="Loading reports..." /></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
            <p className="text-white/50 mt-1">Comprehensive analytics of application data.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="glass-input text-sm py-2"
            />
            <span className="text-white/30">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="glass-input text-sm py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={FileText} title="Total Applications" value={stats.total} color="royal-500" />
          <StatsCard icon={CheckCircle2} title="Approved" value={stats.approved} color="emerald-500" />
          <StatsCard icon={XCircle} title="Rejected" value={stats.rejected} color="red-500" />
          <StatsCard icon={Clock} title="Pending" value={stats.pending} color="amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Applications Bar Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-royal-500" />
              <h2 className="text-lg font-semibold text-white">Applications by Month</h2>
            </div>
            <div className="h-72">
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
                  <Bar dataKey="count" fill="#4169E1" radius={[4, 4, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-royal-500" />
              <h2 className="text-lg font-semibold text-white">Approval Status</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}
                  />
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

        {/* Department-wise Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-royal-500" />
            <h2 className="text-lg font-semibold text-white">Department-wise Applications</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis dataKey="department" type="category" stroke="rgba(255,255,255,0.3)" fontSize={11} width={120} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#87CEEB" radius={[0, 4, 4, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Table */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Department Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-white/40 uppercase px-4 py-3">Department</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase px-4 py-3">Applications</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase px-4 py-3">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {deptData.map((dept, i) => (
                  <tr key={dept.department || i} className="table-row">
                    <td className="px-4 py-3 text-sm text-white/70">{dept.department}</td>
                    <td className="px-4 py-3 text-sm text-white/70">{dept.count}</td>
                    <td className="px-4 py-3 text-sm text-white/50">
                      {stats.total > 0 ? ((dept.count / stats.total) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
