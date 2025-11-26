'use client'

import { useEffect } from 'react'
import { supabase } from '@/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true
      })

      if (error) {
        console.error('Auth callback error:', error)
        router.replace('/auth/error')
        return
      }

      if (data?.session?.user) {
        router.replace('/dashboard')
      } else {
        router.replace('/register')
      }
    }

    handleAuth()
  }, [router])

  return <p>Loading...</p>
}
