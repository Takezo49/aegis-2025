'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/supabaseClient'

interface Player {
  id: number
  user_id: string
  rank: number
  username: string | null
  player_name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  score: number
  solved?: number | null
  lastSolved: string
}

interface Team {
  rank: number
  name: string
  score: number
  members: string[]
  solved?: number
}

export default function LeaderboardPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showGradient, setShowGradient] = useState(false)
  const [activeTab, setActiveTab] = useState<'individual' | 'team'>('individual')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [players, setPlayers] = useState<Player[]>([])

  const teams: Team[] = [
    { rank: 1, name: "RedFox", score: 200, members: ["Alice", "Bob"], solved: 5 },
    { rank: 2, name: "BlueWolf", score: 150, members: ["Charlie"], solved: 1 },
    { rank: 3, name: "GreenEagle", score: 120, members: ["Diana", "Eve"], solved: 1 },
    { rank: 4, name: "PurplePhoenix", score: 80, members: ["Frank"], solved: 0 },
  ]

  useEffect(() => {
    // Set current time only on client side to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleTimeString())
  }, [])

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('score', { ascending: false })

      if (error) {
        console.error('Error fetching players:', error)
        return
      }

      if (data) {
        const formattedPlayers: Player[] = data.map((player, index) => ({
          id: player.id,
          user_id: player.user_id,
          rank: index + 1,
          username: player.username ?? null,
          player_name: player.player_name ?? null,
          email: player.email ?? null,
          avatar_url: player.avatar_url ?? null,
          bio: player.bio ?? null,
          score: player.score ?? 0,
          solved: player.solved ?? null,
          lastSolved: player.updated_at ? new Date(player.updated_at).toLocaleString() : 'Never'
        }))

        setPlayers(formattedPlayers)
      }
    }

    fetchPlayers()
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

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/40 text-yellow-400'
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40 text-gray-300'
      case 3:
        return 'bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-orange-500/40 text-orange-400'
      default:
        return 'bg-white/5 border-white/10 hover:bg-white/10'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return rank.toString()
    }
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
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />
        <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3s' }} />
        <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3.2s' }} />
        <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.4s' }} />
        <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.6s' }} />
      </svg>

      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-black/90 backdrop-blur-sm border-r border-white/10 z-20 p-8">
        <div className="nav-item mb-8" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold">AIGIESCTF_2025</h2>
          <div className="w-6 h-px bg-white/30 mt-2"></div>
        </div>
        <ul className="space-y-6">
          <li className="nav-item" style={{ animationDelay: '0.4s' }}>
            <a href="/" className="block text-lg hover:text-white/80 transition-colors">HOME</a>
          </li>
          <li className="nav-item" style={{ animationDelay: '0.6s' }}>
            <a href="/dashboard" className="block text-lg hover:text-white/80 transition-colors">DASHBOARD</a>
          </li>
          <li className="nav-item" style={{ animationDelay: '0.8s' }}>
            <a href="/team" className="block text-lg hover:text-white/80 transition-colors">TEAM</a>
          </li>
          <li className="nav-item" style={{ animationDelay: '1s' }}>
            <a href="/leaderboard" className="block text-lg text-white/90">LEADERBOARD</a>
          </li>
        </ul>
        <div className="absolute bottom-8 left-8 nav-item" style={{ animationDelay: '1.6s' }}>
          <div className="text-sm opacity-60">
            <p>v2.1.0</p>
            <p>ONLINE</p>
          </div>
        </div>
      </nav>

      {/* Floating Elements */}
      <div className="floating-element" style={{ top: '25%', left: '35%', animationDelay: '3s' }}></div>
      <div className="floating-element" style={{ top: '60%', left: '85%', animationDelay: '3.5s' }}></div>
      <div className="floating-element" style={{ top: '40%', left: '30%', animationDelay: '4s' }}></div>
      <div className="floating-element" style={{ top: '75%', left: '90%', animationDelay: '4.5s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen ml-64">
        {/* Header Section */}
        <div className="p-8 border-b border-white/10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-sm font-normal text-white/60 uppercase tracking-[0.3em] mb-3">
                <span className="word" data-delay="0">CTF Leaderboard</span>
              </h2>
              <div className="w-12 h-px bg-white/30 mx-auto"></div>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              <div className="mb-3">
                <span className="word" data-delay="800">HALL OF</span>
              </div>
              <div className="text-2xl lg:text-3xl font-normal text-white/80">
                <span className="word" data-delay="1200">FAME</span>
              </div>
            </h1>

            <p className="text-base leading-relaxed text-white/70 mb-0 max-w-lg mx-auto">
              <span className="word" data-delay="1600">Track</span>
              <span className="word" data-delay="1750">the</span>
              <span className="word" data-delay="1900">elite</span>
              <span className="word" data-delay="2050">cybersecurity</span>
              <span className="word" data-delay="2200">warriors</span>
              <span className="word" data-delay="2350">and</span>
              <span className="word" data-delay="2500">legendary</span>
              <span className="word" data-delay="2650">teams</span>
              <span className="word" data-delay="2800">in</span>
              <span className="word" data-delay="2950">real-time.</span>
            </p>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="mb-8 flex justify-center">
              <div className="bg-white/5 rounded-lg p-1 border border-white/10">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('individual')}
                    className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'individual'
                        ? 'bg-white text-black'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Individual Rankings
                  </button>
                  <button
                    onClick={() => setActiveTab('team')}
                    className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'team'
                        ? 'bg-white text-black'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Team Rankings
                  </button>
                </div>
              </div>
            </div>

            {/* Individual Leaderboard */}
            {activeTab === 'individual' && (
              <div className="mb-8">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-white/90 mb-2">Top Players</h2>
                  <p className="text-white/60 text-sm">Individual player rankings and achievements</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-white/80 text-sm font-medium">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-4">Player</div>
                    <div className="col-span-2 text-center">Score</div>
                    <div className="col-span-2 text-center">Solved</div>
                    <div className="col-span-2 text-center">Last Activity</div>
                  </div>

                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${getRankStyle(player.rank)}`}
                      style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                    >
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getRankIcon(player.rank)}</span>
                          <span className={`font-bold ${player.rank <= 3 ? 'text-white' : 'text-white/60'}`}>
                            #{player.rank}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-4 flex items-center">
                        <span className={`font-medium ${player.rank <= 3 ? 'text-white' : 'text-white/90'}`}>
                          {player.username || player.player_name || 'Unknown Player'}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`font-bold ${player.rank <= 3 ? 'text-white' : 'text-white/90'}`}>
                          {player.score}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`font-medium ${player.rank <= 3 ? 'text-white' : 'text-white/60'}`}>
                          {player.solved ?? '—'}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`text-xs ${player.rank <= 3 ? 'text-white/80' : 'text-white/50'}`}>
                          {player.lastSolved}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Leaderboard */}
            {activeTab === 'team' && (
              <div className="mb-8">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-white/90 mb-2">Top Teams</h2>
                  <p className="text-white/60 text-sm">Team rankings and collaborative achievements</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-white/80 text-sm font-medium">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-4">Team</div>
                    <div className="col-span-2 text-center">Score</div>
                    <div className="col-span-2 text-center">Solved</div>
                    <div className="col-span-2 text-center">Members</div>
                  </div>

                  {teams.map((team, index) => (
                    <div
                      key={team.rank}
                      className={`grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${getRankStyle(team.rank)}`}
                      style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                    >
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getRankIcon(team.rank)}</span>
                          <span className={`font-bold ${team.rank <= 3 ? 'text-white' : 'text-white/60'}`}>
                            #{team.rank}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-4 flex items-center">
                        <span className={`font-medium ${team.rank <= 3 ? 'text-white' : 'text-white/90'}`}>
                          {team.name}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`font-bold ${team.rank <= 3 ? 'text-white' : 'text-white/90'}`}>
                          {team.score}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`font-medium ${team.rank <= 3 ? 'text-white' : 'text-white/60'}`}>
                          {team.solved || 0}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex flex-wrap gap-1">
                          {team.members.slice(0, 2).map((member, idx) => (
                            <span key={idx} className={`text-xs px-2 py-1 rounded ${team.rank <= 3 ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'}`}>
                              {member}
                            </span>
                          ))}
                          {team.members.length > 2 && (
                            <span className={`text-xs px-2 py-1 rounded ${team.rank <= 3 ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'}`}>
                              +{team.members.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">👑</div>
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {activeTab === 'individual' ? players[0]?.score || 0 : teams[0]?.score || 0}
                </div>
                <div className="text-sm text-yellow-300">
                  {activeTab === 'individual' ? 'Top Player Score' : 'Top Team Score'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {activeTab === 'individual'
                    ? players.reduce((sum, p) => sum + (p.solved ?? 0), 0)
                    : teams.reduce((sum, t) => sum + (t.solved || 0), 0)
                  }
                </div>
                <div className="text-sm text-blue-300">
                  Total Challenges Solved
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {activeTab === 'individual' ? players.length : teams.length}
                </div>
                <div className="text-sm text-purple-300">
                  {activeTab === 'individual' ? 'Active Players' : 'Active Teams'}
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-8 text-center">
              <p className="text-white/50 text-sm">
                Last updated: {currentTime}
              </p>
              <div className="w-px h-4 bg-white/30 mx-auto mt-2"></div>
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
