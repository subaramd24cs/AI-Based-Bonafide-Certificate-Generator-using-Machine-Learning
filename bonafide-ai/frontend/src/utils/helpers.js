export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-IN', options)
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('en-IN', options)
}

export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'text-emerald-400'
    case 'pending':
    case 'under_review':
      return 'text-amber-400'
    case 'rejected':
      return 'text-red-400'
    case 'submitted':
      return 'text-sky-blue'
    case 'certificate_generated':
      return 'text-green-400'
    default:
      return 'text-slate-400'
  }
}

export function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    case 'pending':
    case 'under_review':
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    case 'rejected':
      return 'bg-red-500/20 text-red-300 border border-red-500/30'
    case 'submitted':
      return 'bg-sky-blue/20 text-sky-blue border border-sky-blue/30'
    case 'certificate_generated':
      return 'bg-green-500/20 text-green-300 border border-green-500/30'
    default:
      return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
  }
}

export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
