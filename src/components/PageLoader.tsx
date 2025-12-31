import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600 font-medium">Loading page...</p>
      </div>
    </div>
  )
}
