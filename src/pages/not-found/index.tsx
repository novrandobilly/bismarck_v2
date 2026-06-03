import { Link } from 'react-router-dom'
import mascot from '@/assets/envien-bagel-mascot-black.svg'
import logo from '@/assets/envien-bagel-logo-black.svg'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-warm-cream flex flex-col items-center justify-center px-4 text-center">
      <img src={mascot} alt="" className="w-28 h-28 mb-6 opacity-20" />
      <img src={logo} alt="Envien Bagel" className="h-7 mb-8 opacity-50" />
      <h1 className="font-serif text-6xl font-bold text-ink-dark mb-2">404</h1>
      <p className="font-serif text-xl font-semibold text-ink-dark mb-2">Page not found</p>
      <p className="font-sans text-ink-medium text-sm max-w-xs mb-8 leading-relaxed">
        Oops! The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="bg-ink-dark hover:bg-ink-medium text-surface-white font-sans font-semibold text-sm px-6 py-3 rounded-[14px] transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  )
}
