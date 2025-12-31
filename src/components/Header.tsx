import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LogOut, Settings } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SP</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Portal</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-600">{user.name}</span>}
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  )
}
