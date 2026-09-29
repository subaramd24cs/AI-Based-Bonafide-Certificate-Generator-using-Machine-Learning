import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  FileText,
  Brain,
  ShieldCheck,
  FileDown,
  Lock,
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'

const features = [
  { icon: FileText, title: 'Online Application', desc: 'Apply for bonafide certificates online anytime, anywhere. No more standing in queues.' },
  { icon: Brain, title: 'ML Verification', desc: 'Advanced machine learning algorithms verify your application for authenticity instantly.' },
  { icon: ShieldCheck, title: 'Admin Approval', desc: 'Streamlined admin review process with automated notifications at every step.' },
  { icon: FileDown, title: 'Instant PDF', desc: 'Download your verified bonafide certificate as a PDF immediately after approval.' },
  { icon: Lock, title: 'Secure Portal', desc: 'Your data is encrypted and secure. Role-based access ensures privacy protection.' },
  { icon: Activity, title: 'Application Tracking', desc: 'Track your application status in real-time from submission to certificate generation.' },
]

const steps = [
  { num: '01', title: 'Register', desc: 'Create your student account with college credentials.' },
  { num: '02', title: 'Apply', desc: 'Fill out the bonafide application with required details.' },
  { num: '03', title: 'ML Verification', desc: 'Our AI model verifies your application automatically.' },
  { num: '04', title: 'Admin Review', desc: 'College admin reviews and approves your application.' },
  { num: '05', title: 'Download', desc: 'Download your verified bonafide certificate instantly.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin } = useAuth()

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-blue/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-royal-500/10 border border-royal-500/20 mb-6">
              <Brain className="w-4 h-4 text-royal-500" />
              <span className="text-sm font-medium text-royal-500">Powered by Machine Learning</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Smart{' '}
              <span className="gradient-text">Bonafide Certificate</span>
              <br />
              Generation with ML
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              An AI-powered system that automates bonafide certificate verification and generation
              using machine learning. Fast, secure, and reliable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard')}
                  className="btn-primary text-lg py-3 px-8 flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="btn-primary text-lg py-3 px-8 flex items-center gap-2"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-secondary text-lg py-3 px-8"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dashboard Preview Card */}
          <div className="mt-20 glass-card p-2 max-w-5xl mx-auto animate-fade-in">
            <div className="bg-navy-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-4 text-xs text-white/30">Bonafide AI Dashboard</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Applications', value: '1,234', color: 'from-royal-500/20 to-royal-500/5' },
                  { label: 'Approved', value: '987', color: 'from-emerald-500/20 to-emerald-500/5' },
                  { label: 'Pending', value: '198', color: 'from-amber-500/20 to-amber-500/5' },
                  { label: 'Rejected', value: '49', color: 'from-red-500/20 to-red-500/5' },
                ].map((card) => (
                  <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-lg p-4 border border-white/5`}>
                    <p className="text-xs text-white/40">{card.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Everything you need for a seamless bonafide certificate application and generation process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`glass-card glass-card-hover p-6 animate-fade-in animate-stagger-${i + 1}`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-royal-500/20 to-sky-blue/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-royal-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Five simple steps to get your verified bonafide certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="glass-card p-6 text-center h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-royal-500 to-sky-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-white">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-royal-500/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">About Bonafide AI</h2>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            Bonafide AI is an intelligent certificate verification and generation system built for
            educational institutions. Using machine learning algorithms, it automates the traditionally
            manual process of issuing bonafide certificates, reducing turnaround time from days to minutes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { num: '10x', label: 'Faster Processing' },
              { num: '99.2%', label: 'ML Accuracy' },
              { num: '24/7', label: 'Availability' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-6">
                <p className="text-4xl font-bold gradient-text">{stat.num}</p>
                <p className="text-sm text-white/50 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <button
              onClick={() => navigate('/about')}
              className="btn-secondary inline-flex items-center gap-2"
            >
              Learn More About Us
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
