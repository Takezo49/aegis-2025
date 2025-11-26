'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(window.location.href)

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Authentication failed')
          setLoading(false)
          return
        }

        window.history.replaceState({}, document.title, '/auth/callback')

        const session = data.session

        if (!session) {
          setError('No session found')
          setLoading(false)
          return
        }

        if (session?.user) {
          const user = session.user
          console.log('User authenticated:', user.id)

          try {
            // Check if player record already exists
            const { data: existingPlayer, error: checkError } = await supabase
              .from('players')
              .select('*')
              .eq('user_id', user.id)
              .single()

            if (checkError && checkError.code !== 'PGRST116') {
              // Handle database errors (permissions, etc.)
              console.error('Database error checking player:', checkError)
              setError('Database setup incomplete. Please contact support.')
              setLoading(false)
              return
            }

            if (!existingPlayer) {
              // Create new player record automatically
              console.log('Creating new player record for:', user.id)

              const playerName = user.user_metadata?.full_name ||
                               user.user_metadata?.name ||
                               user.email?.split('@')[0] ||
                               'Anonymous'

              const { error: insertError } = await supabase
                .from('players')
                .insert({
                  user_id: user.id,
                  player_name: playerName,
                })

              if (insertError) {
                console.error('Error creating player record:', insertError)
                setError('Failed to create player profile. Please try again.')
                setLoading(false)
                return
              }

              console.log('Player record created successfully:', { userId: user.id, playerName })

              // Also create profile record if profiles table exists
              try {
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .single()

                if (!existingProfile) {
                  const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                      id: user.id,
                      email: user.email,
                      username: playerName
                    })

                  if (profileError) {
                    console.error('Error creating profile record:', profileError)
                    // Don't fail the whole process for profile creation
                  } else {
                    console.log('Profile record created successfully')
                  }
                }
              } catch (profileError) {
                console.error('Profile table error (might not exist):', profileError)
                // Continue with player creation even if profiles table fails
              }
            } else {
              console.log('Player record already exists:', existingPlayer.id)
            }

            // Show success animation before redirecting
            setShowSuccess(true)
            setTimeout(() => {
              window.location.href = '/create-player'
            }, 2000)

          } catch (error) {
            console.error('Error during player setup:', error)
            setError('Authentication error. Please try again.')
            setLoading(false)
          }
        } else {
          // No session, redirect to register
          window.location.href = '/register'
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setError('An error occurred during authentication')
        setLoading(false)
      }
    }

    handleAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Setting up your account...</p>
          </div>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
              <span className="text-green-400 text-3xl font-bold">✓</span>
            </div>
            <h1 className="text-3xl font-bold mb-3 animate-fadeIn">Authentication Successful!</h1>
            <p className="text-white/60 text-lg animate-fadeIn" style={{ animationDelay: '0.3s' }}>Welcome to AEGIS CTF!</p>
            <div className="mt-6 text-sm text-white/40 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              Setting up your profile...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-red-400 text-xl">✕</span>
            </div>
            <p className="text-red-400">{error}</p>
            <a href="/register" className="text-white/60 hover:text-white mt-4 inline-block">
              Back to Register
            </a>
          </div>
        </div>
      </div>
    )
  }

  return null
}
