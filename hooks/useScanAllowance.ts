'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface ScanAllowance {
  scansUsed: number
  scansRemaining: number
  isPremium: boolean
  canScan: boolean
  limit: number
  loading: boolean
}

export function useScanAllowance() {
  const [allowance, setAllowance] = useState<ScanAllowance>({
    scansUsed: 0,
    scansRemaining: 5,
    isPremium: false,
    canScan: true,
    limit: 5,
    loading: true,
  })

  const fetchAllowance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAllowance(prev => ({ ...prev, loading: false }))
        return
      }

      // First try the RPC function
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('check_scan_allowance', { user_id: user.id })

      if (rpcError) {
        console.warn('RPC check_scan_allowance error, falling back to direct query:', rpcError)

        // Fallback: query profiles directly
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('monthly_scans_used, is_premium')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          setAllowance(prev => ({ ...prev, loading: false }))
          return
        }

        const scansUsed = profileData.monthly_scans_used || 0
        const isPremium = profileData.is_premium || false
        const limit = 5
        const scansRemaining = isPremium ? 999 : Math.max(0, limit - scansUsed)

        console.log(`📊 Scan allowance (direct): ${scansUsed} used, ${scansRemaining} remaining`)

        setAllowance({
          scansUsed,
          scansRemaining,
          isPremium,
          canScan: isPremium || scansRemaining > 0,
          limit,
          loading: false,
        })
        return
      }

      if (rpcData) {
        console.log(`📊 Scan allowance (RPC): ${rpcData.scans_used} used, ${rpcData.scans_remaining} remaining`)

        setAllowance({
          scansUsed: rpcData.scans_used || 0,
          scansRemaining: rpcData.scans_remaining || 5,
          isPremium: rpcData.is_premium || false,
          canScan: rpcData.can_scan !== false,
          limit: rpcData.limit || 5,
          loading: false,
        })
      }
    } catch (error) {
      console.error('Error in fetchAllowance:', error)
      setAllowance(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    fetchAllowance()

    // Set up real-time subscription for profile updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel(`scan-allowance-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔄 Profile updated via realtime, refreshing scan allowance:', payload.new)
            const newProfile = payload.new as any

            const scansUsed = newProfile.monthly_scans_used || 0
            const isPremium = newProfile.is_premium || false
            const limit = 5
            const scansRemaining = isPremium ? 999 : Math.max(0, limit - scansUsed)

            console.log(`📊 Updated scan allowance: ${scansUsed} used, ${scansRemaining} remaining`)

            setAllowance({
              scansUsed,
              scansRemaining,
              isPremium,
              canScan: isPremium || scansRemaining > 0,
              limit,
              loading: false,
            })
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupRealtimeSubscription()
  }, [])

  const refresh = async () => {
    await fetchAllowance()
  }

  return { ...allowance, refresh }
}
