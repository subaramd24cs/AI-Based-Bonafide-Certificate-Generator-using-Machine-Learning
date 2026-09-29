import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatsCard({ icon: Icon, title, value, trend, trendValue, color = 'royal-500' }) {
  const colorMap = {
    'royal-500': 'from-royal-500/20 to-royal-500/5 border-royal-500/20',
    'sky-blue': 'from-sky-blue/20 to-sky-blue/5 border-sky-blue/20',
    'emerald-500': 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    'amber-500': 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
    'red-500': 'from-red-500/20 to-red-500/5 border-red-500/20',
    'purple-500': 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
  }

  const iconColorMap = {
    'royal-500': 'text-royal-500',
    'sky-blue': 'text-sky-blue',
    'emerald-500': 'text-emerald-400',
    'amber-500': 'text-amber-400',
    'red-500': 'text-red-400',
    'purple-500': 'text-purple-400',
  }

  return (
    <div className={`glass-card p-6 bg-gradient-to-br ${colorMap[color]} border animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/50">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${iconColorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-4">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
          {trend === 'neutral' && <Minus className="w-4 h-4 text-white/40" />}
          {trendValue && (
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'}`}>
              {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
