import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Award, Brain, Shield, Users, Code, Heart } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <Navbar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Bonafide AI</h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Revolutionizing certificate management in educational institutions with artificial intelligence.
            </p>
          </div>

          <div className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-white/60 leading-relaxed">
              Bonafide AI was developed to address the challenges faced by educational institutions in
              managing bonafide certificate requests. The traditional manual process was time-consuming,
              prone to errors, and lacked transparency. Our AI-powered system automates verification
              using machine learning, making the entire process fast, accurate, and accessible online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Technology Stack</h2>
              <ul className="space-y-3">
                {[
                  { icon: Code, text: 'React + Vite + Tailwind CSS for the frontend' },
                  { icon: Brain, text: 'Python ML model for application verification' },
                  { icon: Shield, text: 'Node.js/Flask backend with JWT authentication' },
                  { icon: Award, text: 'PDF generation for certificate output' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-royal-500 mt-0.5 flex-shrink-0" />
                    <span className="text-white/60">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Key Highlights</h2>
              <ul className="space-y-3">
                {[
                  'Real-time application tracking with status updates',
                  'ML-powered fraud detection and verification',
                  'Secure role-based access control',
                  'Instant PDF certificate generation',
                  'Analytics dashboard for administrators',
                  'Public certificate verification portal',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-royal-500 mt-2 flex-shrink-0" />
                    <span className="text-white/60">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-royal-500" />
              <h2 className="text-2xl font-bold text-white">Our Team</h2>
            </div>
            <p className="text-white/60 leading-relaxed mb-6">
              Bonafide AI was built as a team project for the 5th semester, combining expertise in
              machine learning, web development, and system design.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'ML Engineer', role: 'Model Development & Training' },
                { name: 'Frontend Developer', role: 'React UI/UX Implementation' },
                { name: 'Backend Developer', role: 'API & Database Management' },
              ].map((member, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-royal-500 to-sky-blue rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold">{member.name.charAt(0)}</span>
                  </div>
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-white/40 mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-white/30 text-sm flex items-center justify-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-400" /> for educational institutions
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
