'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/supabaseClient'

export default function CreatePlayerPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [playerExists, setPlayerExists] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showGradient, setShowGradient] = useState(false)

  // Mouse movement effects
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

  // Word animation effects
  useEffect(() => {
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
  }, [])

  // Get authenticated user and check for existing player
  useEffect(() => {
    const checkUserAndPlayer = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('Auth error:', userError)
          router.push('/register')
          return
        }

        setUser(user)

        // Check if player already exists
        const { data: player, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (playerError && playerError.code !== 'PGRST116') {
          console.error('Error checking player:', playerError)
          setError('Error checking player status')
        } else if (player) {
          // Player exists, redirect to dashboard
          console.log('Player already exists:', player)
          setPlayerExists(true)
          router.push('/dashboard')
        } else {
          // No player exists, show creation form
          console.log('No player found, showing creation form')
          setPlayerExists(false)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Something went wrong')
      }
    }

    checkUserAndPlayer()
  }, [router])

  const handleCreatePlayer = async () => {
    if (!username.trim()) {
      setError('Username cannot be empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: insertError } = await supabase
        .from('players')
        .insert([{
          user_id: user.id,
          username: username.trim()
        }])
        .select()

      if (insertError) {
        console.error('Error inserting player:', insertError)
        if (insertError.code === '23505') {
          setError('Username already taken or player already exists')
        } else {
          setError('Failed to create player')
        }
      } else {
        console.log('Player created:', data)
        setShowSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Show success state with animation
  if (showSuccess) {
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
          <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
          <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
          <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
          <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />
        </svg>

        {/* Floating Elements */}
        <div className="floating-element" style={{ top: '25%', left: '35%', animationDelay: '3s' }}></div>
        <div className="floating-element" style={{ top: '60%', left: '85%', animationDelay: '3.5s' }}></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto mb-8 flex items-center justify-center">
              <div className="w-12 h-12 bg-green-400/30 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-green-400 text-2xl font-bold">✓</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="word text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400" data-delay="0">PLAYER</span>
              <br />
              <span className="word" data-delay="200">CREATED</span>
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-md mx-auto">
              <span className="word" data-delay="400">Welcome</span>
              <span className="word" data-delay="550">to</span>
              <span className="word" data-delay="700">the</span>
              <span className="word" data-delay="850">CTF</span>
              <span className="word" data-delay="1000">challenge!</span>
            </p>
            <div className="text-white/50 text-sm">
              <span className="word" data-delay="1200">Redirecting</span>
              <span className="word" data-delay="1350">to</span>
              <span className="word" data-delay="1500">dashboard...</span>
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

  // Show loading while checking user/player status
  if (user === null && !error) {
    return (
      <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/60">Verifying player status...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show form if no player exists
  if (!playerExists && !error) {
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
          <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
          <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
          <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
          <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />
        </svg>

        {/* Floating Elements */}
        <div className="floating-element" style={{ top: '25%', left: '35%', animationDelay: '3s' }}></div>
        <div className="floating-element" style={{ top: '60%', left: '85%', animationDelay: '3.5s' }}></div>
        <div className="floating-element" style={{ top: '40%', left: '30%', animationDelay: '4s' }}></div>
        <div className="floating-element" style={{ top: '75%', left: '90%', animationDelay: '4.5s' }}></div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-6">
          <div className="text-center max-w-md mx-auto w-full">
            <div className="mb-4">
              <h2 className="text-xs font-normal text-white/70 uppercase tracking-[0.3em] mb-2">
                <span className="word" data-delay="0">Player Setup</span>
              </h2>
              <div className="w-8 h-px bg-white/40 mx-auto"></div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight mb-4 text-white">
              <span className="word" data-delay="400">Create Player</span>
            </h1>

            <div className="mb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-3">
                <span className="word" data-delay="600">Begin Your Cybersecurity Journey</span>
              </h2>
              <div className="w-12 h-px bg-white/40 mx-auto"></div>
            </div>

            <p className="text-sm text-white/80 mb-3">
              <span className="word" data-delay="800">Enter</span>
              <span className="word" data-delay="950">your</span>
              <span className="word" data-delay="1100">username</span>
              <span className="word" data-delay="1250">to</span>
              <span className="word" data-delay="1400">begin.</span>
            </p>

            <p className="text-sm text-white/50 mb-4 max-w-sm mx-auto leading-relaxed">
              <span className="word" data-delay="1600">Join</span>
              <span className="word" data-delay="1750">the</span>
              <span className="word" data-delay="1900">elite</span>
              <span className="word" data-delay="2050">ranks</span>
              <span className="word" data-delay="2200">of</span>
              <span className="word" data-delay="2350">cybersecurity</span>
              <span className="word" data-delay="2500">professionals</span>
              <span className="word" data-delay="2650">and</span>
              <span className="word" data-delay="2800">test</span>
              <span className="word" data-delay="2950">your</span>
              <span className="word" data-delay="3100">skills</span>
              <span className="word" data-delay="3250">against</span>
              <span className="word" data-delay="3400">challenging</span>
              <span className="word" data-delay="3550">scenarios.</span>
            </p>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 max-w-xl mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '3.8s' }}>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-400 rounded-sm"></div>
                </div>
                <h3 className="text-sm font-semibold text-white/90 mb-2">Security Challenges</h3>
                <p className="text-xs text-white/60">Test your knowledge across multiple cybersecurity domains</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '4s' }}>
                <div className="w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-green-400 rounded-full"></div>
                </div>
                <h3 className="text-sm font-semibold text-white/90 mb-2">Skill Development</h3>
                <p className="text-xs text-white/60">Enhance your expertise through practical, hands-on challenges</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '4.2s' }}>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-purple-400"></div>
                </div>
                <h3 className="text-sm font-semibold text-white/90 mb-2">Community</h3>
                <p className="text-xs text-white/60">Join a network of skilled cybersecurity enthusiasts</p>
              </div>
            </div>

            {/* Player Creation Form */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 max-w-xs mx-auto opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '2s' }}>
              {error && (
                <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-center text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleCreatePlayer(); }} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2 text-left">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter player name"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm font-mono"
                    required
                    disabled={loading}
                    suppressHydrationWarning={true}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-white text-black font-bold text-sm hover:bg-white/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  suppressHydrationWarning={true}
                >
                  {loading ? 'Creating...' : 'Create Player'}
                </button>
              </form>
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-red-400 text-3xl font-bold">✕</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
            <p className="text-white/70 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-3 border border-white/30 text-white hover:bg-white/10 transition-all duration-300 rounded-lg"
            >
              Back to Register
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default loading state
  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    </div>
  )
}
