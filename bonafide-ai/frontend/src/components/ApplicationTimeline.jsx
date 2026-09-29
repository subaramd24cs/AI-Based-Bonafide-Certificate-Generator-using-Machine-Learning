import { CheckCircle2, Clock, Brain, ShieldCheck, Award } from 'lucide-react'

const steps = [
  { label: 'Application Submitted', icon: CheckCircle2, key: 'submitted' },
  { label: 'ML Verification', icon: Brain, key: 'ml_verified' },
  { label: 'Admin Review', icon: ShieldCheck, key: 'admin_review' },
  { label: 'Approved/Rejected', icon: Clock, key: 'reviewed' },
  { label: 'Certificate Generated', icon: Award, key: 'certificate_generated' },
]

const statusToStep = {
  pending: 2,
  approved: 4,
  rejected: 3,
}

export default function ApplicationTimeline({ currentStatus, createdAt }) {
  let currentStep = statusToStep[currentStatus?.toLowerCase()] ?? -1
  if (currentStep >= 0 && currentStep < 2) currentStep = 2

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Application Timeline</h3>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

        {steps.map((step, index) => {
          const isCompleted = index <= currentStep
          const isCurrent = index === currentStep

          return (
            <div key={step.key} className="relative flex items-start gap-4 mb-8 last:mb-0">
              <div
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-royal-500 to-sky-blue shadow-lg shadow-royal-500/30'
                    : 'bg-navy-800 border-2 border-white/10'
                }`}
              >
                <step.icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-white/30'}`} />
              </div>

              <div className="flex-1 pt-2">
                <p className={`font-medium ${isCompleted ? 'text-white' : 'text-white/30'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-royal-500 mt-1 font-medium">Current Status</p>
                )}
              </div>

              {isCompleted && (
                <div className="pt-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
