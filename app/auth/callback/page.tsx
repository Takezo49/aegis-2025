'use client'

import { useEffect } from 'react'
import { supabase } from '@/supabaseClient'
import { useRouter } from 'next/navigation'

async function syncUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Check if player exists
  const { data: existing } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    await supabase.from("players").insert([
      {
        user_id: user.id,
        username: user.user_metadata.full_name || user.email?.split("@")[0]
      }
    ]);
  }
}

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthStateChange = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Sync user to players table
        await syncUser()
        router.replace('/create-player')
      }
    })

    return () => {
      handleAuthStateChange.data.subscription.unsubscribe()
    }
  }, [router])

  return <p>Loading...</p>
}
