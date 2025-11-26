'use client'

import { useEffect } from 'react'
import { supabase } from '@/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)

        if (error) {
          console.error('Auth Error:', error)
          router.push('/auth/error')
          return
        }

        console.log('Logged in:', data.session.user?.email)

        router.push('/dashboard')
      } catch (err) {
        console.error(err)
        router.push('/auth/error')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-black">
      <p>Completing login...</p>
    </div>
  )
}
