import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { adminAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    fetchApplications()
  }, [page, statusFilter])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = { page, limit, sort: '-createdAt' }
      if (statusFilter !== 'all') params.status = statusFilter
      if (search) params.search = search

      const res = await adminAPI.getAllApplications(params)
      setApplications(res.data.applications || res.data || [])
      setTotalPages(res.data.pages || 1)
      setTotal(res.data.total || 0)
    } catch (err) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchApplications()
  }

  const filtered = applications.filter(app => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      app.applicationId?.toLowerCase().includes(q) ||
      app.studentName?.toLowerCase().includes(q) ||
      app.purpose?.toLowerCase().includes(q)
    )
  })

  if (loading && applications.length === 0) return <AdminLayout><LoadingSpinner message="Loading applications..." /></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">All Applications</h1>
          <p className="text-white/50 mt-1">Manage and review all student applications.</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input pl-10"
                  placeholder="Search by ID, student name, or purpose..."
                />
              </div>
              <button type="submit" className="btn-primary text-sm py-2 px-4">Search</button>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/40" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="glass-input"
              >
                <option value="all" className="bg-navy-800">All Status</option>
                <option value="pending" className="bg-navy-800">Pending</option>
                <option value="approved" className="bg-navy-800">Approved</option>
                <option value="rejected" className="bg-navy-800">Rejected</option>
                <option value="certificate_generated" className="bg-navy-800">Certificate Generated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">ID</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Department</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Purpose</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">ML Score</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-white/40">No applications found</td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr key={app._id} className="table-row">
                      <td className="px-6 py-4 font-mono text-sm text-royal-500">{app.applicationId || app._id?.slice(-8)}</td>
                      <td className="px-6 py-4 text-sm text-white/70">{app.studentName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-white/50">{app.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-white/50 max-w-[200px] truncate">{app.purpose}</td>
                      <td className="px-6 py-4 text-sm text-white/50">{formatDate(app.createdAt)}</td>
                      <td className="px-6 py-4 text-sm">
                        {app.mlConfidence ? (
                          <span className={`font-medium ${app.mlConfidence >= 0.7 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {(app.mlConfidence * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-white/30">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={app.adminStatus} /></td>
                      <td className="px-6 py-4">
                        <Link to={`/admin/applications/${app._id}`} className="text-royal-500 hover:underline text-sm flex items-center gap-1">
                          <Eye className="w-4 h-4" /> Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/30">Showing {applications.length} of {total} applications</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-white/50">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
