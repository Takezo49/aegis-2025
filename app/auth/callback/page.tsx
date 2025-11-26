'use client'

import { useEffect } from 'react'
import { supabase } from '@/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthStateChange = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.replace('/create-player')
      }
    })

    return () => {
      handleAuthStateChange.data.subscription.unsubscribe()
    }
  }, [router])

  return <p>Loading...</p>
}
