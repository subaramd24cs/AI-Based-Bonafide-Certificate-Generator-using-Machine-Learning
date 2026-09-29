import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { applicationsAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Search, Filter, Eye } from 'lucide-react'

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await applicationsAPI.getMy({ sort: '-createdAt' })
      setApplications(res.data.applications || res.data || [])
    } catch (err) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const filtered = applications
    .filter(app => {
      const matchSearch = !search ||
        app.applicationId?.toLowerCase().includes(search.toLowerCase()) ||
        app.purpose?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || app.adminStatus === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (sortOrder === 'desc') return aVal > bVal ? -1 : 1
      return aVal < bVal ? -1 : 1
    })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  if (loading) return <StudentLayout><LoadingSpinner message="Loading applications..." /></StudentLayout>

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">My Applications</h1>
          <p className="text-white/50 mt-1">Track all your bonafide certificate applications.</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input pl-10"
                placeholder="Search by ID or purpose..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="glass-input"
              >
                <option value="all" className="bg-navy-800">All Status</option>
                <option value="pending" className="bg-navy-800">Pending</option>
                <option value="approved" className="bg-navy-800">Approved</option>
                <option value="rejected" className="bg-navy-800">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    onClick={() => handleSort('applicationId')}
                    className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-white/60"
                  >
                    Application ID
                  </th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Purpose</th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-white/60"
                  >
                    Applied Date {sortField === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr key={app._id} className="table-row">
                      <td className="px-6 py-4 font-mono text-sm text-royal-500">
                        {app.applicationId || app._id?.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">{app.purpose}</td>
                      <td className="px-6 py-4 text-sm text-white/50">{formatDate(app.createdAt)}</td>
                      <td className="px-6 py-4"><StatusBadge status={app.adminStatus} /></td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/student/applications/${app._id}`}
                          className="inline-flex items-center gap-1 text-sm text-royal-500 hover:underline"
                        >
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

        <div className="text-sm text-white/30 text-right">
          Showing {filtered.length} of {applications.length} applications
        </div>
      </div>
    </StudentLayout>
  )
}
