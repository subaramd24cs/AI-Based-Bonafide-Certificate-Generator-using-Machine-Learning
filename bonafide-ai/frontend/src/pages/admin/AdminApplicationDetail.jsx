import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import StatusBadge from '../../components/StatusBadge'
import ApplicationTimeline from '../../components/ApplicationTimeline'
import LoadingSpinner from '../../components/LoadingSpinner'
import { adminAPI, certificatesAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2, XCircle, Brain, User, FileText, Award, ShieldAlert, Sparkles } from 'lucide-react'

export default function AdminApplicationDetail() {
  const { id } = useParams()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchApplication()
  }, [id])

  const fetchApplication = async () => {
    try {
      const res = await adminAPI.getApplicationDetail(id)
      setApplication(res.data.application || res.data)
    } catch (err) {
      toast.error('Failed to load application details')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await adminAPI.approve(id, { remarks: remarks || 'Approved by administrator based on ML recommendation and academic criteria.' })
      toast.success('Application approved successfully!')
      fetchApplication()
      setRemarks('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!remarks) {
      toast.error('Please enter rejection remarks')
      return
    }
    setActionLoading(true)
    try {
      await adminAPI.reject(id, { remarks })
      toast.success('Application rejected with provided remarks')
      fetchApplication()
      setRemarks('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleGenerateCertificate = async () => {
    setGenerating(true)
    try {
      await certificatesAPI.generate(id)
      toast.success('Official PDF Certificate generated with QR Verification Code!')
      fetchApplication()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate certificate')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <AdminLayout><LoadingSpinner message="Fetching application data..." /></AdminLayout>
  if (!application) return <AdminLayout><div className="text-center text-white/40 py-12">Application record not found</div></AdminLayout>

  const isPending = application.adminStatus === 'pending'
  const isApproved = application.adminStatus === 'approved'

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link to="/admin/applications" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Application Review & Decision
            </h1>
            <p className="text-white/50 mt-1 font-mono text-sm">Application ID: {application.applicationId || application._id?.slice(-8)}</p>
          </div>
          <StatusBadge status={application.adminStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-semibold text-white">Student Academic Profile</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {[
                  { label: 'Full Name', value: application.studentName },
                  { label: 'Register Number', value: application.registerNumber },
                  { label: 'Department', value: application.department },
                  { label: 'Course', value: application.course },
                  { label: 'Year of Study', value: `Year ${application.year}` },
                  { label: 'Semester', value: `Semester ${application.semester}` },
                  { label: 'Attendance', value: `${application.attendance}%` },
                  { label: 'CGPA', value: `${application.cgpa || 7.5} / 10.0` },
                  { label: 'Fee Status', value: application.feeStatus },
                  { label: 'Academic Standing', value: application.academicStatus },
                  { label: 'Disciplinary Status', value: application.disciplinaryStatus || 'Clear' },
                  { label: 'Prev. Certificates', value: application.previousBonafideCount || 0 },
                ].map((field) => (
                  <div key={field.label} className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-xs font-medium text-white/40 uppercase">{field.label}</p>
                    <p className="text-white font-medium mt-0.5">{field.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Info */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-semibold text-white">Application Purpose & Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40 text-xs">Certificate Purpose</p>
                  <p className="text-white font-semibold text-base mt-1">{application.purpose}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Application Date</p>
                  <p className="text-white font-medium mt-1">{formatDate(application.createdAt)}</p>
                </div>
                {application.adminRemarks && (
                  <div className="col-span-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg mt-2">
                    <p className="text-xs font-semibold text-amber-400">Admin Remarks</p>
                    <p className="text-white text-sm mt-1">{application.adminRemarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Keras Model Recommendation Card */}
            <div className="glass-card p-6 border-sky-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-sky-400" />
                  <h2 className="text-lg font-bold text-white">AI Recommendation</h2>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">Keras Deep NN</span>
              </div>

              {application.mlPrediction && application.mlPrediction !== 'pending' ? (
                <div className="space-y-4">
                  <div className={`text-center p-4 rounded-xl border ${
                    application.mlPrediction === 'Approved'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Model Output</p>
                    <p className="text-3xl font-black tracking-tight">{application.mlPrediction.toUpperCase()}</p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-white/60 font-medium">Confidence Score</span>
                      <span className="text-sm font-bold text-sky-400">
                        {((application.mlConfidence || 0.90) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          (application.mlConfidence || 0.90) >= 0.75
                            ? 'bg-gradient-to-r from-blue-500 to-sky-400'
                            : 'bg-gradient-to-r from-amber-500 to-amber-400'
                        }`}
                        style={{ width: `${(application.mlConfidence || 0.90) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-xs text-white/50 leading-relaxed border border-white/5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400 inline mr-1" />
                    Recommendation generated by Keras Neural Network trained on 20,000 synthetic academic application records.
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/40">ML recommendation pending.</p>
              )}
            </div>

            {/* Timeline */}
            <ApplicationTimeline currentStatus={application.adminStatus} createdAt={application.createdAt} />

            {/* Decision Actions */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Administrator Decision</h2>

              <div>
                <label className="block text-xs font-medium text-white/60 uppercase mb-2">Admin Remarks / Rejection Reason</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="glass-input min-h-[80px]"
                  placeholder="Enter decision notes or mandatory rejection reason..."
                />
              </div>

              {isPending && (
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="btn-success w-full flex items-center justify-center gap-2 text-base py-3"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Approve Application
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="btn-danger w-full flex items-center justify-center gap-2 text-base py-3"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Application
                  </button>
                </div>
              )}

              {isApproved && !application.certificateId && (
                <button
                  onClick={handleGenerateCertificate}
                  disabled={generating}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {generating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      Generate PDF Certificate
                    </>
                  )}
                </button>
              )}

              {application.certificateId && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-300">Official Certificate Ready</p>
                  <p className="text-xs text-white/60 font-mono mt-1">{application.certificateId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
