import { Award, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy-900/90 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-royal-500 to-sky-blue rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Bonafide AI</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-md">
              An AI-powered bonafide certificate generation system that streamlines the
              application process using machine learning for verification and instant certificate generation.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Features', 'About', 'Contact'].map((link) => (
                <li key={link}>
                  <span className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/40">
                <Mail className="w-4 h-4" />
                support@bonafideai.com
              </li>
              <li className="flex items-center gap-2 text-sm text-white/40">
                <Phone className="w-4 h-4" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-sm text-white/40">
                <MapPin className="w-4 h-4" />
                College Campus, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            &copy; 2026 Bonafide AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
