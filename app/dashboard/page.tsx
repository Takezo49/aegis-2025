'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'

type TabType = 'overview' | 'profile' | 'leaderboards' | 'progress'

interface Player {
  rank: number
  name: string
  score: number
  solved: number
  lastSolved?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface Activity {
  id: string
  type: 'challenge_completed' | 'streak_achieved' | 'rank_up' | 'badge_earned'
  title: string
  description: string
  timestamp: string
  icon: string
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showGradient, setShowGradient] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [player, setPlayer] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentIP, setCurrentIP] = useState<string>('')
  const [submitMessage, setSubmitMessage] = useState<string>('')
  const [flagInput, setFlagInput] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [machineFlags, setMachineFlags] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<Player[]>([])

  useEffect(() => {
    if (!player?.id) return

    const fetchSubmittedFlags = async () => {
      const { data, error } = await supabase
        .from('user_flags')
        .select('*')
        .eq('player_id', player.id)

      if (error) {
        console.error('Error fetching submitted flags:', error)
        return
      }

      // Merge with existing machineFlags
      setMachineFlags(prev =>
        prev.map(machine => {
          const userFlag = data?.find(f => f.machine_id === machine.id && f.flag_type === 'user')
          const rootFlag = data?.find(f => f.machine_id === machine.id && f.flag_type === 'root')

          return {
            ...machine,
            userPlaceholder: userFlag?.flag_value || '',
            rootPlaceholder: rootFlag?.flag_value || '',
            userFlag: '',
            rootFlag: '',
            userMsg: userFlag ? '✅ Already submitted' : '',
            rootMsg: rootFlag ? '✅ Already submitted' : ''
          }
        })
      )
    }

    fetchSubmittedFlags()
  }, [player])

  // Load machines from database and initialize machineFlags with UUIDs
  useEffect(() => {
    const loadMachines = async () => {
      const { data: machines } = await supabase.from('machines').select('id, name')
      if (!machines) return

      setMachineFlags(machines.map(m => ({
        id: m.id, // UUID
        name: m.name, // Display name
        userFlag: '',
        rootFlag: '',
        userMsg: '',
        rootMsg: '',
        userSubmitting: false,
        rootSubmitting: false,
        userPlaceholder: '',
        rootPlaceholder: ''
      })))
    }

    loadMachines()
  }, [])

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from('players')
      .select(`
        id,
        username,
        score,
        created_at,
        user_flags!inner(id)
      `)
      .order('score', { ascending: false }) // optional: order by score

    if (error || !data) return

    const leaderboardData = data.map((p, i) => ({
      rank: i + 1,
      name: p.username,
      score: p.score || 0,
      solved: p.user_flags?.length || 0,
      lastSolved: new Date(p.created_at).toLocaleString(),
    }))

    setLeaderboard(leaderboardData)
  }

  useEffect(() => {
    fetchLeaderboard()

    // 🔥 Listen for real-time updates
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        (payload) => {
          console.log('Leaderboard updated:', payload)
          fetchLeaderboard() // refetch or handle incremental update
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const achievements: Achievement[] = [
    { id: '1', title: 'First Blood', description: 'Complete your first challenge', icon: '🩸', unlocked: true, rarity: 'common' },
    { id: '2', title: 'Speed Demon', description: 'Complete a challenge in under 5 minutes', icon: '⚡', unlocked: false, rarity: 'rare' },
    { id: '3', title: 'Perfectionist', description: 'Achieve 100% accuracy on a challenge', icon: '💎', unlocked: false, rarity: 'epic' },
    { id: '4', title: 'Legend', description: 'Reach top 10 on the leaderboard', icon: '👑', unlocked: false, rarity: 'legendary' },
  ]

  const recentActivity: Activity[] = [
    { id: '1', type: 'challenge_completed', title: 'Challenge Completed', description: 'SQL Injection Master - Advanced Level', timestamp: '2 hours ago', icon: '✅' },
    { id: '2', type: 'streak_achieved', title: 'Streak Achieved', description: '3-day solving streak!', timestamp: '1 day ago', icon: '🔥' },
    { id: '3', type: 'rank_up', title: 'Rank Improved', description: 'Moved up to #42 on the leaderboard', timestamp: '3 days ago', icon: '📈' },
    { id: '4', type: 'badge_earned', title: 'Badge Earned', description: 'Unlocked "First Blood" achievement', timestamp: '1 week ago', icon: '🏆' },
  ]

  useEffect(() => {
    const animateWords = () => {
      const words = document.querySelectorAll('.word')
      words.forEach((word: Element) => {
        const delay = parseInt((word as HTMLElement).dataset.delay || '0')
        setTimeout(() => {
          ;(word as HTMLElement).style.animation = 'word-appear 0.6s ease-out forwards'
        }, delay)
      })
    }

    const timer = setTimeout(animateWords, 500)
    return () => clearTimeout(timer)
  }, [])

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

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchCurrentIP = async () => {
      try {
        const { data } = await supabase.from('site_ip').select('ip_address').single()
        if (data?.ip_address) {
          setCurrentIP(data.ip_address)
          console.log(data.ip_address)
        }
      } catch (error) {
        console.error('Error fetching current IP:', error)
      }
    }

    fetchCurrentIP()
  }, [])

  useEffect(() => {
    const setupPlayer = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('No user found or auth error:', userError)
          window.location.href = '/register'
          return
        }

        console.log('Authenticated user:', user)
        setUser(user)

        // Check if player exists and fetch profile data
        const { data: existingPlayer, error: checkError } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing player:', checkError)
        }

        // Fetch profile data if profiles table exists
        let profileData = null
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (!profileError && profile) {
            profileData = profile
          }
        } catch (err) {
          // Profiles table might not exist, continue without it
          console.log('Profiles table not available, continuing without profile data')
        }

        if (existingPlayer) {
          console.log('Player already exists:', existingPlayer)
          setPlayer({ ...existingPlayer, profile: profileData || {} })
        } else {
          console.log('No player found - user needs to create profile')
          // Don't redirect automatically, let them go back to create profile if needed
        }
      } catch (error) {
        console.error('Error in setupPlayer:', error)
      } finally {
        setLoading(false)
      }
    }

    setupPlayer()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/60">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-400/10'
      case 'rare': return 'border-blue-400 bg-blue-400/10'
      case 'epic': return 'border-purple-400 bg-purple-400/10'
      case 'legendary': return 'border-yellow-400 bg-yellow-400/10'
      default: return 'border-gray-400 bg-gray-400/10'
    }
  }

  const submitFlag = async (playerId: string, machineId: string, flag: string) => {
    const { data, error } = await supabase.rpc("submit_flag_v2", {
      p_player_id: playerId,
      p_machine_id: machineId,
      p_flag: flag.trim()
    });

    if (error) {
      console.error(error);
      return "⚠️ Error submitting flag!";
    }

    return data; // Returns the text message from SQL function
  };

  async function submitMachineFlag(machineId: string, flagType: 'user' | 'root') {
    if (!player?.id) return

    const machineIndex = machineFlags.findIndex(m => m.id === machineId)
    if (machineIndex === -1) return

    const flagValue = flagType === 'user' ? machineFlags[machineIndex].userFlag : machineFlags[machineIndex].rootFlag
    if (!flagValue.trim()) return

    const updatedFlags = [...machineFlags]
    const currentMachine = updatedFlags[machineIndex] as any

    currentMachine[flagType + 'Submitting'] = true
    currentMachine[flagType + 'Msg'] = ''
    setMachineFlags(updatedFlags)

    try {
      // Use the RPC function for flag submission
      const result = await submitFlag(player.id, machineId, flagValue)
      currentMachine[flagType + 'Msg'] = result

      // If successful, update the UI state
      if (result.includes('✅') || result.includes('Already submitted')) {
        currentMachine[flagType + 'Placeholder'] = flagValue.trim()
        currentMachine[flagType + 'Flag'] = ''
        
        // Refresh player data to get updated score
        const { data: updatedPlayer } = await supabase
          .from('players')
          .select('*')
          .eq('id', player.id)
          .single()
        
        if (updatedPlayer) {
          setPlayer(updatedPlayer)
        }
      }
    } catch (err) {
      console.error(err)
      currentMachine[flagType + 'Msg'] = '❌ Error!'
    }

    currentMachine[flagType + 'Submitting'] = false
    setMachineFlags(updatedFlags)
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

      {/* Header with Live Stats */}
      <div className="relative z-10 p-4 lg:p-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="text-left">
              <div className="mb-2">
                <h2 className="text-xs font-normal text-white/60 uppercase tracking-[0.3em] mb-1">
                  <span className="word" data-delay="0">Mission Control</span>
                </h2>
                <div className="w-8 h-px bg-white/30"></div>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight mb-2">
                <div className="mb-1">
                  <span className="word text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" data-delay="200">CYBERSECURITY</span>
                </div>
                <div className="text-lg lg:text-xl font-normal text-white/80">
                  <span className="word" data-delay="400">COMMAND CENTER</span>
                </div>
              </h1>

              <p className="text-sm leading-relaxed text-white/70 max-w-xl">
                <span className="word" data-delay="600">Greetings, </span>
                <span className="word text-white font-semibold" data-delay="800">{player?.player_name || player?.username || player?.profile?.username || user?.email?.split('@')[0]}</span>
                <span className="word" data-delay="1000">! Your digital fortress awaits.</span>
              </p>
            </div>

            {/* Live Stats Cards */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3 min-w-[100px] text-center">
                <div className="text-lg font-bold text-purple-400 mb-1">{currentTime}</div>
                <div className="text-xs text-purple-300 uppercase tracking-wide">Server Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="relative z-10 px-4 lg:px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-white/5 rounded-xl p-1.5 border border-white/10 backdrop-blur-sm">
              <div className="flex space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: '🏠' },
                  { id: 'profile', label: 'Profile', icon: '👤' },
                  { id: 'leaderboards', label: 'Leaderboard', icon: '🏆' },
                  { id: 'progress', label: 'Progress', icon: '📈' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-white/20 to-white/10 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'overview' && (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6 text-center">
                    <h3 className="text-2xl font-bold mb-3">System Overview</h3>
                    <p className="text-white/60 text-sm">Monitor your cybersecurity platform status and configuration</p>
                  </div>

                  {/* Network Configuration - Full Width */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
                    <h4 className="text-lg font-bold mb-4 flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      Network Configuration
                    </h4>

                    <div className="space-y-4">
                      {/* Site IP Display */}
                      <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-base font-semibold text-white/90">Primary IP Address</h5>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-xs text-green-400 uppercase tracking-wide">Active</span>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="font-mono text-base text-white">{currentIP || 'Loading...'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-center">
                          <p className="text-xs text-white/60">
                            Current site IP address • Last updated: {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Network Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 rounded-lg text-center">
                          <div className="text-lg font-bold text-blue-400 mb-1">IPv4</div>
                          <div className="text-xs text-white/60">Protocol</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg text-center">
                          <div className="text-lg font-bold text-green-400 mb-1">99.9%</div>
                          <div className="text-xs text-white/60">Uptime</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Information - Full Width */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <h4 className="text-base font-bold mb-3 flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      Platform Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-purple-400 mb-1">v2.1.0</div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">Platform Version</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-blue-400 mb-1">{new Date().toLocaleDateString()}</div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">Current Date</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-green-400 mb-1">UTC+5:30</div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">Server Timezone</div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4">User Profile</h3>
                  <p className="text-white/60">Manage your cybersecurity persona</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Profile Card */}
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 p-8">
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold shadow-lg">
                        {(player?.player_name || player?.username || player?.profile?.username || user?.email?.[0] || 'P').toUpperCase()}
                      </div>
                      <h4 className="text-2xl font-bold">
                        {player?.player_name || player?.username || player?.profile?.username || 'Player'}
                      </h4>
                      <p className="text-white/60">{player?.email || player?.profile?.email || user?.email}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400 border border-green-500/30">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          Online
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/60">Member Since</span>
                        <span className="font-medium">
                          {new Date(player?.created_at || player?.profile?.created_at || user?.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/60">Last Active</span>
                        <span className="font-medium">Just now</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/60">Timezone</span>
                        <span className="font-medium">UTC+5:30</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h4 className="text-lg font-bold mb-4">Performance Stats</h4>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-400 mb-2">{player?.score || 0}</div>
                      <div className="text-sm text-white/60 uppercase tracking-wide">Total Score</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leaderboards' && (
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-3xl font-bold text-white/90">Global Leaderboard</h3>
                  <button
                    onClick={fetchLeaderboard}
                    className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition"
                  >
                    Refresh
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10 text-white/80 text-sm font-medium">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-4">Player</div>
                    <div className="col-span-2 text-center">Score</div>
                    <div className="col-span-2 text-center">Solved</div>
                    <div className="col-span-2 text-center">Last Activity</div>
                  </div>

                  {leaderboard.map((player, index) => (
                    <div
                      key={player.rank}
                      className={`grid grid-cols-12 gap-4 p-6 border-b border-white/5 hover:bg-white/5 transition-all duration-200`}
                    >
                      <div className="col-span-2 flex items-center justify-center">{player.rank}</div>
                      <div className="col-span-4">{player.name}</div>
                      <div className="col-span-2 flex items-center justify-center">{player.score}</div>
                      <div className="col-span-2 flex items-center justify-center">{player.solved}</div>
                      <div className="col-span-2 flex items-center justify-center">{player.lastSolved}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="max-w-3xl mx-auto space-y-4">
                {machineFlags.map((machine) => (
                  <div key={machine.id} className="bg-white/5 rounded-lg border border-white/10 p-4">
                    <h4 className="text-lg font-bold mb-3 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      {machine.name?.toUpperCase() || machine.id.toUpperCase()}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* User Flag */}
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={machine.userPlaceholder || "Enter USER flag..."}
                          value={machine.userFlag}
                          onChange={(e) => setMachineFlags(prev =>
                            prev.map(m => m.id === machine.id ? { ...m, userFlag: e.target.value } : m)
                          )}
                          className={`w-full px-3 py-2 bg-white/10 border rounded text-sm text-white placeholder-white/50 focus:outline-none transition-all duration-200 ${
                            machine.userPlaceholder
                              ? 'border-green-400 bg-green-500/10 text-green-300 placeholder-green-300 cursor-not-allowed'
                              : 'border-white/20 focus:ring-1 focus:ring-green-400'
                          }`}
                          disabled={machine.userSubmitting || !!machine.userPlaceholder}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') submitMachineFlag(machine.id, 'user')
                          }}
                        />
                        {machine.userMsg && (
                          <p className={`text-xs font-medium ${machine.userMsg.includes('✅') ? 'text-green-400' : machine.userMsg.includes('⚠️') ? 'text-yellow-400' : 'text-red-400'}`}>
                            {machine.userMsg}
                          </p>
                        )}
                        <button
                          onClick={() => submitMachineFlag(machine.id, 'user')}
                          disabled={machine.userSubmitting}
                          className="w-full py-2 px-3 rounded bg-white hover:bg-gray-200 text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {machine.userSubmitting ? 'Submitting...' : 'USER'}
                        </button>
                      </div>

                      {/* Root Flag */}
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={machine.rootPlaceholder || "ROOT flag..."}
                          value={machine.rootFlag}
                          onChange={(e) => setMachineFlags(prev =>
                            prev.map(m => m.id === machine.id ? { ...m, rootFlag: e.target.value } : m)
                          )}
                          className={`w-full px-3 py-2 bg-white/10 border rounded text-sm text-white placeholder-white/50 focus:outline-none transition-all duration-200 ${
                            machine.rootPlaceholder
                              ? 'border-green-400 bg-green-500/10 text-green-300 placeholder-green-300 cursor-not-allowed'
                              : 'border-white/20 focus:ring-1 focus:ring-red-400'
                          }`}
                          disabled={machine.rootSubmitting || !!machine.rootPlaceholder}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') submitMachineFlag(machine.id, 'root')
                          }}
                        />
                        {machine.rootMsg && (
                          <p className={`text-xs font-medium ${machine.rootMsg.includes('✅') ? 'text-green-400' : machine.rootMsg.includes('⚠️') ? 'text-yellow-400' : 'text-red-400'}`}>
                            {machine.rootMsg}
                          </p>
                        )}
                        <button
                          onClick={() => submitMachineFlag(machine.id, 'root')}
                          disabled={machine.rootSubmitting}
                          className="w-full py-2 px-3 rounded bg-white hover:bg-gray-200 text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {machine.rootSubmitting ? 'Submitting...' : 'ROOT'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Elements for Visual Appeal */}
      <div className="floating-element" style={{ top: '15%', left: '10%', animationDelay: '2s' }}></div>
      <div className="floating-element" style={{ top: '35%', left: '90%', animationDelay: '2.5s' }}></div>
      <div className="floating-element" style={{ top: '65%', left: '15%', animationDelay: '3s' }}></div>
      <div className="floating-element" style={{ top: '85%', left: '85%', animationDelay: '3.5s' }}></div>

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

  function getRankIcon(rank: number) {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return ''
  }
}
