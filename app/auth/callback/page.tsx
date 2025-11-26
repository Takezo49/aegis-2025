'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)

        if (error) {
          console.error('Auth error:', error)
          router.push('/auth/error')
          return
        }

        router.push('/dashboard')
      } catch (err) {
        console.error('Unexpected auth error:', err)
        router.push('/auth/error')
      }
    }

    handleAuth()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>Redirecting...</p>
    </div>
  )
}
