'use client'

import { useEffect } from 'react'
import { supabase } from '@/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSessionFromUrl({
          storeSession: true
        })

        if (error) {
          console.error('Auth callback error:', error)
          router.replace('/auth/error')
          return
        }

        router.replace('/dashboard')
      } catch (err) {
        console.error(err)
        router.replace('/auth/error')
      }
    }

    handleAuth()
  }, [router])

  return <div>Loading...</div>
}
