'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/supabaseClient'

export default function AdminLogin() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showGradient, setShowGradient] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if already logged in
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (isAdmin) {
      router.push('/admin')
    }

    const animateWords = () => {
      const words = document.querySelectorAll('.word')
      words.forEach((word: Element) => {
        const delay = parseInt((word as HTMLElement).dataset.delay || '0')
        setTimeout(() => {
          ;(word as HTMLElement).style.animation = 'word-appear 0.8s ease-out forwards'
        }, delay)
      })
    }

    const timer = setTimeout(animateWords, 500)
    return () => clearTimeout(timer)
  }, [router])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setShowGradient(true)
    }

    const handleMouseLeave = () => {
      setShowGradient(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: supabaseError } = await supabase
      .from('admins')
      .select('*')
      .ilike('email', email.trim())
      .eq('password_hash', password.trim())
      .maybeSingle()

    if (supabaseError) {
      console.error('Supabase error:', supabaseError)
      setError('Server error, please try again.')
      setLoading(false)
      return
    }

    if (!data) {
      setError('❌ Invalid credentials!')
      setLoading(false)
      return
    }

    // ✅ Successful login
    localStorage.setItem('isAdmin', 'true')
    router.push('/admin')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      {/* Animated Grid Background */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />
        <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3s' }} />
        <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3.2s' }} />
        <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.4s' }} />
        <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.6s' }} />
      </svg>

      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img
          src="/home-background.png"
          alt="Background"
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/3 object-cover opacity-30"
        />
      </div>

      {/* Floating Elements */}
      <div className="floating-element" style={{ top: '35%', left: '90%', animationDelay: '2.5s' }}></div>
      <div className="floating-element" style={{ top: '65%', left: '15%', animationDelay: '3s' }}></div>
      <div className="floating-element" style={{ top: '85%', left: '85%', animationDelay: '3.5s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-4">
        <div className="max-w-sm w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mb-3">
              <h2 className="text-xs font-normal text-white/60 uppercase tracking-[0.3em] mb-2">
                <span className="word" data-delay="0">Admin Access</span>
              </h2>
              <div className="w-10 h-px bg-white/30 mx-auto"></div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight mb-3">
              <div className="mb-1">
                <span className="word text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" data-delay="400">ADMIN</span>
              </div>
              <div className="text-base lg:text-lg font-normal text-white/80">
                <span className="word" data-delay="800">CONTROL PANEL</span>
              </div>
            </h1>

            <p className="text-sm leading-relaxed text-white/70 max-w-sm mx-auto mb-4">
              <span className="word" data-delay="1200">Access</span>
              <span className="word" data-delay="1350">the</span>
              <span className="word" data-delay="1500">administrative</span>
              <span className="word" data-delay="1650">interface</span>
              <span className="word" data-delay="1800">with</span>
              <span className="word" data-delay="1950">authorized</span>
              <span className="word" data-delay="2100">credentials.</span>
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-xs mx-auto backdrop-blur-sm">
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2 text-left">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all text-sm font-mono"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2 text-left">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all text-sm font-mono"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-center text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white text-black font-bold text-sm hover:bg-white/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Authenticating...' : 'Access Admin Panel'}
                </button>
              </div>
            </form>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <a
              href="/"
              className="inline-flex items-center text-white/60 hover:text-white transition-colors duration-300"
            >
              <span className="mr-2">←</span>
              Return to Home
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Gradient */}
      {showGradient && (
        <div
          className="fixed pointer-events-none w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl transition-all duration-500 ease-out opacity-100"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192
          }}
        />
      )}
    </div>
  )
}
