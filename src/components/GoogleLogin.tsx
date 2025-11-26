'use client'

import { supabase } from '@/supabaseClient'

export default function GoogleLogin() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://aegis-2025.vercel.app/auth/callback'
      }
    })
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Sign in with Google
    </button>
  )
}
