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

      const { data, error } = await supabase
        .rpc('check_scan_allowance', { p_user_id: user.id })

      if (error) {
        console.error('Error fetching scan allowance:', error)
        setAllowance(prev => ({ ...prev, loading: false }))
        return
      }

      if (data) {
        setAllowance({
          scansUsed: data.scans_used || 0,
          scansRemaining: data.scans_remaining || 5,
          isPremium: data.is_premium || false,
          canScan: data.can_scan !== false,
          limit: data.limit || 5,
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
  }, [])

  const refresh = async () => {
    await fetchAllowance()
  }

  return { ...allowance, refresh }
}
