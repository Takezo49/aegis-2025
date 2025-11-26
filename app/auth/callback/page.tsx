'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      })

      if (error) {
        console.error('Auth callback error:', error)
      }

      window.history.replaceState({}, document.title, '/auth/callback')

      if (!data.session) {
        console.error('No session found after callback')
      }

      router.push('/')
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>Signing you in...</p>
    </div>
  )
}
