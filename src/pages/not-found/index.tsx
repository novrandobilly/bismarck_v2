import { Link } from 'react-router-dom'
import mascot from '@/assets/envien-bagel-mascot-black.svg'
import logo from '@/assets/envien-bagel-logo-black.svg'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 text-center">
      <img src={mascot} alt="" className="w-28 h-28 mb-6 opacity-20" />
      <img src={logo} alt="Envien Bagel" className="h-7 mb-8 opacity-60" />
      <h1 className="text-6xl font-black text-stone-800 mb-2">404</h1>
      <p className="text-xl font-semibold text-stone-600 mb-2">Page not found</p>
      <p className="text-stone-400 text-sm max-w-xs mb-8">
        Oops! The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  )
}
