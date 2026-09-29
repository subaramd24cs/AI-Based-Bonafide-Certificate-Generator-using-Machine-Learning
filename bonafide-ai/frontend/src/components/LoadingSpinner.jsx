export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-white/10 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-royal-500 rounded-full animate-spin"></div>
      </div>
      {message && <p className="mt-4 text-sm text-white/50">{message}</p>}
    </div>
  )
}
