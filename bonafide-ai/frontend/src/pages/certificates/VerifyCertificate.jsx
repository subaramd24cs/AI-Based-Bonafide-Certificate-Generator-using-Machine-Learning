import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import LoadingSpinner from '../../components/LoadingSpinner'
import { certificatesAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import { CheckCircle, XCircle, Award } from 'lucide-react'

export default function VerifyCertificate() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await certificatesAPI.verify(id)
        setResult(res.data)
      } catch (err) {
        setResult({ valid: false, message: err.response?.data?.message || 'Certificate could not be verified' })
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [id])

  const details = result && [
    ['Certificate ID', result.certificateId],
    ['Student Name', result.studentName],
    ['Register Number', result.registerNumber],
    ['Department', result.department],
    ['Course', result.course],
    ['Issue Date', formatDate(result.issueDate)],
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <Navbar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Award className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Certificate Verification</h1>
            <p className="text-white/50">Checking the authenticity of certificate <span className="text-white/80">{id}</span></p>
          </div>

          <div className="glass-card p-8">
            {loading ? (
              <LoadingSpinner message="Verifying certificate..." />
            ) : result?.valid ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-emerald-300">Valid Certificate</h2>
                </div>
                <dl className="divide-y divide-white/10">
                  {details.map(([label, value]) => (
                    <div key={label} className="flex justify-between py-3">
                      <dt className="text-white/50">{label}</dt>
                      <dd className="text-white font-medium text-right">{value || 'N/A'}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <div className="text-center py-6">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-300 mb-2">Invalid Certificate</h2>
                <p className="text-white/50">
                  {result?.message || `This certificate is ${result?.status || 'not valid'}.`}
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link to="/" className="text-white/50 hover:text-white text-sm">Back to home</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
