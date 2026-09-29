import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import StatusBadge from '../../components/StatusBadge'
import ApplicationTimeline from '../../components/ApplicationTimeline'
import LoadingSpinner from '../../components/LoadingSpinner'
import { applicationsAPI, certificatesAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, Brain, User, BookOpen, FileText } from 'lucide-react'

export default function ApplicationDetails() {
  const { id } = useParams()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchApplication()
  }, [id])

  const fetchApplication = async () => {
    try {
      const res = await applicationsAPI.getById(id)
      setApplication(res.data.application || res.data)
    } catch (err) {
      toast.error('Failed to load application details')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!application?.certificateId) return
    setDownloading(true)
    try {
      const res = await certificatesAPI.download(application.certificateId)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bonafide_${application.applicationId || id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Certificate downloaded!')
    } catch (err) {
      toast.error('Failed to download certificate')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <StudentLayout><LoadingSpinner message="Loading application..." /></StudentLayout>
  if (!application) return <StudentLayout><div className="text-center text-white/40 py-12">Application not found</div></StudentLayout>

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link to="/student/applications" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Application Details</h1>
            <p className="text-white/50 mt-1">Application ID: {application.applicationId || application._id?.slice(-8)}</p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={application.adminStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-royal-500" />
                <h2 className="text-lg font-semibold text-white">Student Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Name', value: application.studentName },
                  { label: 'Register Number', value: application.registerNumber },
                  { label: 'Department', value: application.department },
                  { label: 'Course', value: application.course },
                  { label: 'Year', value: application.year },
                  { label: 'Semester', value: application.semester },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-white/40">{field.label}</p>
                    <p className="text-white font-medium">{field.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Info */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-royal-500" />
                <h2 className="text-lg font-semibold text-white">Application Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40">Purpose</p>
                  <p className="text-white font-medium">{application.purpose}</p>
                </div>
                <div>
                  <p className="text-white/40">Required Date</p>
                  <p className="text-white font-medium">{formatDate(application.requiredDate)}</p>
                </div>
                <div>
                  <p className="text-white/40">Applied On</p>
                  <p className="text-white font-medium">{formatDate(application.createdAt)}</p>
                </div>
                <div>
                  <p className="text-white/40">Status</p>
                  <StatusBadge status={application.adminStatus} />
                </div>
                {application.adminRemarks && (
                  <div className="col-span-2">
                    <p className="text-white/40">Admin Remarks</p>
                    <p className="text-white font-medium">{application.adminRemarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ML Prediction */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-royal-500" />
                <h2 className="text-lg font-semibold text-white">ML Prediction</h2>
              </div>
              {application.mlPrediction && application.mlPrediction !== 'pending' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Prediction</span>
                    <span className={`font-semibold ${application.mlPrediction === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {application.mlPrediction === 'Approved' ? 'Likely Approved' : 'Needs Review'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white/50">Confidence</span>
                      <span className="text-sm text-white/70">
                        {((application.mlConfidence || 0.85) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-royal-500 to-sky-blue rounded-full transition-all duration-500"
                        style={{ width: `${(application.mlConfidence || 0.85) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/40">ML prediction not available yet.</p>
              )}
            </div>

            {/* Timeline */}
            <ApplicationTimeline currentStatus={application.adminStatus} createdAt={application.createdAt} />

            {/* Download Certificate */}
            {application.adminStatus === 'approved' && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-success w-full flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Certificate
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
