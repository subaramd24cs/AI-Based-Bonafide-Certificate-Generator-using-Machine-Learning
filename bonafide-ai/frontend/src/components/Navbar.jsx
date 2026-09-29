import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Menu, X, Award } from 'lucide-react'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/#features', label: 'Features' },
    { to: '/#how-it-works', label: 'How It Works' },
    { to: '/about', label: 'About' },
  ]

  const handleNav = (to) => {
    setMobileOpen(false)
    navigate(to)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-royal-500 to-sky-blue rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Bonafide AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.to}
              onClick={() => handleNav(link.to)}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => handleNav(isAdmin ? '/admin/dashboard' : '/student/dashboard')}
              className="btn-primary text-sm py-2 px-4"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => handleNav('/login')} className="btn-secondary text-sm py-2 px-4">
                Login
              </button>
              <button onClick={() => handleNav('/register')} className="btn-primary text-sm py-2 px-4">
                Register
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-navy-900/95 backdrop-blur-xl border-b border-white/10 animate-slide-down">
          <div className="px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => handleNav(link.to)}
                className="block w-full text-left py-2 text-white/60 hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={() => handleNav(isAdmin ? '/admin/dashboard' : '/student/dashboard')}
                  className="btn-primary w-full text-sm py-2"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => handleNav('/login')} className="btn-secondary w-full text-sm py-2">
                    Login
                  </button>
                  <button onClick={() => handleNav('/register')} className="btn-primary w-full text-sm py-2">
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
