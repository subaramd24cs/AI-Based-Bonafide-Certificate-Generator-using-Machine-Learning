import { useState, useEffect } from 'react'
import StudentLayout from '../../layouts/StudentLayout'
import { useAuth } from '../../hooks/useAuth'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { User, Save } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    department: '',
    course: '',
    year: '',
    semester: '',
    registerNumber: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await authAPI.getProfile()
      const profile = res.data.user || res.data
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        mobile: profile.mobile || '',
        department: profile.department || '',
        course: profile.course || '',
        year: profile.year || '',
        semester: profile.semester || '',
        registerNumber: profile.registerNumber || '',
      })
    } catch (err) {
      if (user) {
        setForm({
          name: user.name || '',
          email: user.email || '',
          mobile: user.mobile || '',
          department: user.department || '',
          course: user.course || '',
          year: user.year || '',
          semester: user.semester || '',
          registerNumber: user.registerNumber || '',
        })
      }
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.updateProfile({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
      })
      updateUser(res.data.user || { ...user, ...form })
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/30 border-t-royal-500 rounded-full animate-spin" />
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-white/50 mt-1">View and update your profile information.</p>
        </div>

        <div className="glass-card p-8">
            <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-500 to-sky-blue flex items-center justify-center text-white text-2xl font-bold">
              {form.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{form.name}</h2>
              <p className="text-white/50 text-sm">{form.registerNumber}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Register Number</label>
                <input
                  type="text"
                  name="registerNumber"
                  value={form.registerNumber}
                  disabled
                  className="glass-input opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  disabled
                  className="glass-input opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Course</label>
                <input
                  type="text"
                  name="course"
                  value={form.course}
                  disabled
                  className="glass-input opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Year</label>
                <input
                  type="text"
                  name="year"
                  value={form.year}
                  disabled
                  className="glass-input opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Semester</label>
                <input
                  type="text"
                  name="semester"
                  value={form.semester}
                  disabled
                  className="glass-input opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StudentLayout>
  )
}
