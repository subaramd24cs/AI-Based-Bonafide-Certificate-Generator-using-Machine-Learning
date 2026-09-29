import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import { useAuth } from '../../hooks/useAuth'
import { applicationsAPI, mlAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Brain, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

const purposes = [
  'Scholarship',
  'Bank',
  'Education Loan',
  'Internship',
  'Passport',
  'Travel',
  'Government Application',
  'Other',
]

export default function ApplyBonafide() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [mlResult, setMlResult] = useState(null)
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    purpose: 'Scholarship',
    attendance: '85',
    cgpa: '7.8',
    feeStatus: 'Paid',
    previousBonafideCount: '0',
    academicStatus: 'Good',
    previousApplicationStatus: 'Approved',
    disciplinaryStatus: 'Clear',
    additionalNotes: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleMLPredict = async () => {
    try {
      const res = await mlAPI.predict({
        attendance: parseFloat(form.attendance) || 75.0,
        cgpa: parseFloat(form.cgpa) || 7.5,
        feeStatus: form.feeStatus,
        previousBonafideCount: parseInt(form.previousBonafideCount) || 0,
        academicStatus: form.academicStatus,
        previousApplicationStatus: form.previousApplicationStatus,
        disciplinaryStatus: form.disciplinaryStatus,
        purpose: form.purpose,
        semester: user?.semester || 1,
        course: user?.course || 'MCA',
        department: user?.department || 'Computer Science'
      })
      setMlResult(res.data)
      return res.data
    } catch (err) {
      console.warn('ML prediction warning:', err)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.purpose) {
      toast.error('Please select a purpose')
      return
    }

    const attVal = parseFloat(form.attendance)
    if (isNaN(attVal) || attVal < 0 || attVal > 100) {
      toast.error('Attendance percentage must be between 0 and 100')
      return
    }

    const cgpaVal = parseFloat(form.cgpa)
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      toast.error('CGPA must be between 0.0 and 10.0')
      return
    }

    setLoading(true)
    try {
      const prediction = await handleMLPredict()

      const submitData = {
        ...form,
        mlPrediction: prediction?.prediction,
        mlConfidence: prediction?.confidence
      }

      await applicationsAPI.create(submitData)
      toast.success('Application submitted successfully with Keras ML prediction!')
      setSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sky-400" />
            Apply for Bonafide Certificate
          </h1>
          <p className="text-white/60 mt-1">Submit your academic details for AI-powered verification & certificate approval.</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-4 mb-8">
          {['Student Profile', 'Academic & Bonafide Details', 'Keras ML Review & Submit'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white/10 text-white/30'
              }`}>
                {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden md:block ${step === i + 1 ? 'text-white font-medium' : 'text-white/40'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {!submitted ? (
          <>
            {step === 1 && (
              <div className="glass-card p-8 animate-slide-up">
                <h2 className="text-lg font-semibold text-white mb-6">Verify Student Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Full Name', value: user?.name || user?.fullName },
                    { label: 'Register Number', value: user?.registerNumber },
                    { label: 'Department', value: user?.department },
                    { label: 'Course', value: user?.course },
                    { label: 'Year of Study', value: `Year ${user?.year}` },
                    { label: 'Semester', value: `Semester ${user?.semester}` },
                    { label: 'Institutional Email', value: user?.email },
                    { label: 'Mobile Number', value: user?.mobile },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">{field.label}</label>
                      <p className="text-white font-medium bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                        {field.value || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={() => setStep(2)} className="btn-primary">
                    Next: Academic Details
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card p-8 animate-slide-up">
                <h2 className="text-lg font-semibold text-white mb-6">Academic & Bonafide Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/70 mb-2">Purpose of Bonafide Certificate *</label>
                    <select
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      className="glass-input"
                    >
                      {purposes.map(p => (
                        <option key={p} value={p} className="bg-slate-900 text-white">{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Attendance Percentage (%) *</label>
                    <input
                      type="number"
                      name="attendance"
                      value={form.attendance}
                      onChange={handleChange}
                      className="glass-input"
                      placeholder="e.g. 85"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">CGPA (out of 10.0) *</label>
                    <input
                      type="number"
                      name="cgpa"
                      value={form.cgpa}
                      onChange={handleChange}
                      className="glass-input"
                      placeholder="e.g. 7.8"
                      min="0"
                      max="10"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Fee Payment Status *</label>
                    <select name="feeStatus" value={form.feeStatus} onChange={handleChange} className="glass-input">
                      <option value="Paid" className="bg-slate-900 text-white">Paid</option>
                      <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Academic Standing</label>
                    <select name="academicStatus" value={form.academicStatus} onChange={handleChange} className="glass-input">
                      <option value="Good" className="bg-slate-900 text-white">Good Standing (CGPA ≥ 7.5)</option>
                      <option value="Average" className="bg-slate-900 text-white">Average (CGPA 5.5 - 7.4)</option>
                      <option value="Poor" className="bg-slate-900 text-white">Needs Improvement (&lt; 5.5)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Previous Bonafide Certificates Issued</label>
                    <input
                      type="number"
                      name="previousBonafideCount"
                      value={form.previousBonafideCount}
                      onChange={handleChange}
                      className="glass-input"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Previous Application Record</label>
                    <select name="previousApplicationStatus" value={form.previousApplicationStatus} onChange={handleChange} className="glass-input">
                      <option value="Approved" className="bg-slate-900 text-white">Approved</option>
                      <option value="Rejected" className="bg-slate-900 text-white">Rejected</option>
                      <option value="None" className="bg-slate-900 text-white">First Time Applicant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Disciplinary Record</label>
                    <select name="disciplinaryStatus" value={form.disciplinaryStatus} onChange={handleChange} className="glass-input">
                      <option value="Clear" className="bg-slate-900 text-white">Clear Record</option>
                      <option value="Warning" className="bg-slate-900 text-white">Warning On File</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/70 mb-2">Additional Remarks / Justification</label>
                    <textarea
                      name="additionalNotes"
                      value={form.additionalNotes}
                      onChange={handleChange}
                      className="glass-input min-h-[90px]"
                      placeholder="Specify institution or purpose details..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                  <button
                    onClick={async () => {
                      setStep(3);
                      await handleMLPredict();
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Next: Predict & Review
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass-card p-8 animate-slide-up space-y-6">
                <h2 className="text-lg font-semibold text-white">Review & AI Keras Verification</h2>

                {/* AI Recommendation Banner */}
                <div className={`rounded-xl p-5 border ${
                  mlResult?.prediction === 'Approved'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${mlResult?.prediction === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <Brain className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-white/60">TensorFlow / Keras AI Neural Network Recommendation</div>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                          Recommendation: <span className={mlResult?.prediction === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}>{mlResult?.prediction || 'Approved'}</span>
                        </div>
                      </div>
                    </div>
                    {mlResult?.confidence !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-sky-400">
                          {(mlResult.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-white/50">Model Confidence</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <h3 className="text-sm font-semibold text-white/70 mb-4">Application Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-white/40 block text-xs">Purpose</span> <span className="text-white font-medium">{form.purpose}</span></div>
                    <div><span className="text-white/40 block text-xs">Attendance</span> <span className="text-white font-medium">{form.attendance}%</span></div>
                    <div><span className="text-white/40 block text-xs">CGPA</span> <span className="text-white font-medium">{form.cgpa} / 10.0</span></div>
                    <div><span className="text-white/40 block text-xs">Fee Status</span> <span className="text-white font-medium">{form.feeStatus}</span></div>
                    <div><span className="text-white/40 block text-xs">Academic Status</span> <span className="text-white font-medium">{form.academicStatus}</span></div>
                    <div><span className="text-white/40 block text-xs">Disciplinary Status</span> <span className="text-white font-medium">{form.disciplinaryStatus}</span></div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(2)} className="btn-secondary">Back to Edit</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Submit Bonafide Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 glass-card animate-scale-up">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Application Submitted Successfully!</h2>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Your application has been logged into the system and is waiting for administrator approval. You can track the status in real-time.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => navigate('/student/applications')} className="btn-primary">
                View My Applications
              </button>
              <button onClick={() => navigate('/student/dashboard')} className="btn-secondary">
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
