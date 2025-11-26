'use client'

import { supabase } from '@/supabaseClient'

interface GoogleLoginProps {
  className?: string
  children?: React.ReactNode
  redirectTo?: string
}

export default function GoogleLogin({
  className = "px-4 py-2 bg-blue-600 text-white rounded",
  children = "Sign in with Google",
  redirectTo
}: GoogleLoginProps) {
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://aegis-2025.vercel.app/auth/callback'
        }
      })

      if (error) {
        console.error('Google OAuth error:', error)
      } else {
        console.log('Redirecting to Google login...', data)
      }
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className={className}
    >
      {children}
    </button>
  )
}
