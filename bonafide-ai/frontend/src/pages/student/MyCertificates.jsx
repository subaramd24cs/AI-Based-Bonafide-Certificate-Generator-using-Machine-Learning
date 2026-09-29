import { useState, useEffect } from 'react'
import StudentLayout from '../../layouts/StudentLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { certificatesAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Award, Download, ExternalLink, Copy } from 'lucide-react'

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const res = await certificatesAPI.getAll ? await certificatesAPI.getAll() : { data: { certificates: [] } }
      setCertificates(res.data.certificates || res.data || [])
    } catch (err) {
      try {
        const appRes = await import('../../services/api').then(m => m.applicationsAPI.getMy())
        const apps = appRes.data.applications || appRes.data || []
        const certs = apps.filter(a => a.certificateId || a.status === 'certificate_generated')
        setCertificates(certs)
      } catch {
        setCertificates([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (cert) => {
    const certId = cert.certificateId || cert._id
    setDownloading(certId)
    try {
      const res = await certificatesAPI.download(certId)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bonafide_${certId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Certificate downloaded!')
    } catch (err) {
      toast.error('Failed to download certificate')
    } finally {
      setDownloading(null)
    }
  }

  const copyVerifyLink = (cert) => {
    const certId = cert.certificateId || cert._id
    const link = `${window.location.origin}/certificates/verify/${certId}`
    navigator.clipboard.writeText(link)
    toast.success('Verification link copied!')
  }

  if (loading) return <StudentLayout><LoadingSpinner message="Loading certificates..." /></StudentLayout>

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">My Certificates</h1>
          <p className="text-white/50 mt-1">Download and manage your bonafide certificates.</p>
        </div>

        {certificates.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Certificates Yet</h2>
            <p className="text-white/40">Your certificates will appear here once your application is approved.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert._id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{cert.purpose || 'Bonafide Certificate'}</p>
                      <p className="text-xs text-white/40 font-mono">{cert.certificateId || cert._id}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-medium">Active</span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/40">Issued Date</span>
                    <span className="text-white/70">{formatDate(cert.issuedDate || cert.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Application ID</span>
                    <span className="text-white/70 font-mono">{cert.applicationId?.slice(-8) || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(cert)}
                    disabled={downloading === (cert.certificateId || cert._id)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2"
                  >
                    {downloading === (cert.certificateId || cert._id) ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => copyVerifyLink(cert)}
                    className="btn-secondary flex items-center justify-center gap-2 text-sm py-2 px-3"
                    title="Copy verification link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
