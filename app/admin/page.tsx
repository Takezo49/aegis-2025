'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/supabaseClient'

export default function AdminPage() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showGradient, setShowGradient] = useState(false)
  const [ip, setIp] = useState('')
  const [newIp, setNewIp] = useState('')
  const [message, setMessage] = useState('')
  const [currentSiteIp, setCurrentSiteIp] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated (client-side only)
        if (typeof window !== 'undefined') {
          const auth = localStorage.getItem('isAdmin')
          if (!auth) {
            router.push('/admin/login')
            return
          }
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

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

  // Fetch current IP from DB
  async function fetchIp() {
    const { data, error } = await supabase
      .from('site_ip')
      .select('ip_address')
      .limit(1)
      .single()

    if (error) {
      console.error(error)
      setMessage('Error fetching IP')
    } else {
      setIp(data.ip_address)
    }
  }

  // Update IP value in DB
  async function updateIp(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    const { error } = await supabase
      .from('site_ip')
      .update({ ip_address: newIp, updated_at: new Date() })
      .neq('ip_address', newIp) // prevent unnecessary update

    if (error) {
      console.error(error)
      setMessage('Failed to update IP')
    } else {
      setMessage('✅ IP updated successfully!')
      setIp(newIp)
      setNewIp('')
    }
  }

  // Fetch current site IP for demonstration
  async function fetchCurrentSiteIp() {
    const { data, error } = await supabase
      .from('site_ip')
      .select('ip_address')
      .single()

    if (error) {
      console.error('Error fetching site IP:', error)
    } else {
      setCurrentSiteIp(data.ip_address)
      console.log(data.ip_address) // Demonstrating the pattern as requested
    }
  }

  useEffect(() => {
    fetchIp()
    fetchCurrentSiteIp()
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin')
    }
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/60">Verifying admin access...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // This shouldn't be reached, but just in case
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      {/* Grid Background */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Main grid lines */}
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />

        {/* Detail dots */}
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
      <div className="floating-element" style={{ top: '25%', left: '35%', animationDelay: '3s' }}></div>
      <div className="floating-element" style={{ top: '60%', left: '85%', animationDelay: '3.5s' }}></div>
      <div className="floating-element" style={{ top: '40%', left: '30%', animationDelay: '4s' }}></div>
      <div className="floating-element" style={{ top: '75%', left: '90%', animationDelay: '4.5s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-sm font-normal text-white/60 uppercase tracking-[0.3em] mb-3">
                <span className="word" data-delay="0">IP Management</span>
              </h2>
              <div className="w-12 h-px bg-white/30"></div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-6">
                  <div className="mb-3">
                    <span className="word" data-delay="400">IP ADDRESS</span>
                  </div>
                  <div className="text-xl lg:text-2xl font-normal text-white/80">
                    <span className="word" data-delay="800">MANAGEMENT</span>
                  </div>
                </h1>

                <p className="text-lg leading-relaxed text-white/70 mb-8 max-w-2xl">
                  <span className="word" data-delay="1200">Manage</span>
                  <span className="word" data-delay="1350">and</span>
                  <span className="word" data-delay="1500">update</span>
                  <span className="word" data-delay="1650">your</span>
                  <span className="word" data-delay="1800">site's</span>
                  <span className="word" data-delay="1950">IP</span>
                  <span className="word" data-delay="2100">address</span>
                  <span className="word" data-delay="2250">configuration</span>
                  <span className="word" data-delay="2400">from</span>
                  <span className="word" data-delay="2550">this</span>
                  <span className="word" data-delay="2700">central</span>
                  <span className="word" data-delay="2850">control</span>
                  <span className="word" data-delay="3000">panel.</span>
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-white hover:bg-white/90 text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 opacity-0 animate-[word-appear_0.6s_ease-out_forwards]"
                style={{ animationDelay: '4s' }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* IP Management Section */}
          <div className="opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '4.5s' }}>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-lg mx-auto">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold mb-2">Site IP Configuration</h2>
                <div className="w-8 h-px bg-white/30"></div>
              </div>

              {/* Current IP Display */}
              <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                <h3 className="text-sm font-semibold mb-2 text-white/90">Current IP Address</h3>
                <div className="text-center">
                  <div className="inline-block px-2 py-1 bg-black/50 border border-white/20 rounded-lg">
                    <span className="font-mono text-sm text-white">{ip || 'Loading...'}</span>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={updateIp} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1 text-left">
                    New IP Address: *
                  </label>
                  <input
                    type="text"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    placeholder="Enter new IP address"
                    className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-xs font-mono"
                    required
                    suppressHydrationWarning={true}
                  />
                  <p className="text-white/50 text-xs mt-1">Enter a valid IP address (e.g., 192.168.1.1)</p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full px-3 py-1 bg-white text-black font-bold text-xs hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
                    suppressHydrationWarning={true}
                  >
                    Update IP Address
                  </button>
                </div>
              </form>

              {/* Status Messages */}
              {message && (
                <div className={`mt-3 p-2 rounded-lg text-center text-xs font-medium ${
                  message.includes('✅')
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                }`}>
                  {message}
                </div>
              )}

              {/* Info Section */}
              <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-xs font-semibold text-blue-300 mb-1">ℹ️ Information</h4>
                <p className="text-white/70 text-xs">
                  This IP address is used for site configuration and network management.
                  Changes will take effect immediately across the platform.
                </p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '5.5s' }}>
            <h3 className="text-lg font-bold mb-3">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Database: Connected</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>IP Service: Operational</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>Updates: Ready</span>
              </div>
            </div>
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
