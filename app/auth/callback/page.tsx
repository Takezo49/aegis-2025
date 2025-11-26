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
        router.push('/auth/error')
        return
      }

      const { user } = data.session

      // Additional onboarding logic can go here
      router.push('/dashboard')
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>Redirecting...</p>
    </div>
  )
}
