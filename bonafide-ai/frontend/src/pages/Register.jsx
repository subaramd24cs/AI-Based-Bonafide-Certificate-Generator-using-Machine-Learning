import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Award, User, Hash, BookOpen, Calendar, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'

const departments = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
]

const courses = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'B.E', 'M.E']

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    registerNumber: '',
    department: '',
    course: '',
    year: '',
    semester: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    if (!form.registerNumber.trim()) errs.registerNumber = 'Register number is required'
    if (!form.department) errs.department = 'Department is required'
    if (!form.course) errs.course = 'Course is required'
    if (!form.year) errs.year = 'Year is required'
    if (!form.semester) errs.semester = 'Semester is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.mobile) errs.mobile = 'Mobile number is required'
    else if (!/^\d{10}$/.test(form.mobile)) errs.mobile = 'Invalid mobile number'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { confirmPassword, ...submitData } = form
      await authAPI.register(submitData)
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const InputField = ({ icon: Icon, name, label, type = 'text', placeholder, options }) => (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        {options ? (
          <select
            name={name}
            value={form[name]}
            onChange={handleChange}
            className="glass-input pl-10 appearance-none"
          >
            <option value="" className="bg-navy-800">{placeholder}</option>
            {options.map(opt => (
              <option key={opt} value={opt} className="bg-navy-800">{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={form[name]}
            onChange={handleChange}
            className="glass-input pl-10"
            placeholder={placeholder}
          />
        )}
      </div>
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-royal-500 to-sky-blue rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Bonafide AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-white/50 mt-2">Register as a student</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField icon={User} name="name" label="Full Name" placeholder="Enter full name" />
              <InputField icon={Hash} name="registerNumber" label="Register Number" placeholder="Enter register number" />
              <InputField icon={BookOpen} name="department" label="Department" placeholder="Select department" options={departments} />
              <InputField icon={BookOpen} name="course" label="Course" placeholder="Select course" options={courses} />
              <InputField icon={Calendar} name="year" label="Year" type="number" placeholder="1-4" />
              <InputField icon={Calendar} name="semester" label="Semester" type="number" placeholder="1-8" />
              <InputField icon={Mail} name="email" label="Email" type="email" placeholder="you@college.edu" />
              <InputField icon={Phone} name="mobile" label="Mobile" type="tel" placeholder="10 digit number" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="glass-input pl-10 pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="glass-input pl-10"
                    placeholder="Confirm password"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-royal-500 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
