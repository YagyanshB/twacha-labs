'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ScanData {
  id: string;
  overall_score: number;
  hydration_score: number;
  oil_control_score: number;
  pore_health_score: number;
  texture_score: number;
  clarity_score: number;
  created_at: string;
  status: string;
  image_url?: string;
  skin_type?: string;
  summary?: string;
}

interface Issue {
  issue_type: string;
  severity: 'mild' | 'moderate' | 'severe';
  location: string;
  count: number | null;
}

interface Stats {
  totalScans: number;
  currentStreak: number;
  issuesDetected: number;
  memberSince: string;
}

interface MetricScore {
  score: number;
  change: number;
}

export interface RealtimeScoresData {
  latestScan: ScanData | null;
  previousScan: ScanData | null;
  stats: Stats;
  isLoading: boolean;
  overallScore: number;
  overallChange: number;
  metrics: {
    hydration: MetricScore;
    oilControl: MetricScore;
    poreHealth: MetricScore;
    texture: MetricScore;
    clarity: MetricScore;
  };
  detectedIssues: Issue[];
  refresh: () => Promise<void>;
}

export function useRealtimeScores(userId: string | undefined): RealtimeScoresData {
  const [latestScan, setLatestScan] = useState<ScanData | null>(null);
  const [previousScan, setPreviousScan] = useState<ScanData | null>(null);
  const [detectedIssues, setDetectedIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalScans: 0,
    currentStreak: 0,
    issuesDetected: 0,
    memberSince: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Calculate score changes
  const getChange = (metric: keyof Pick<ScanData, 'overall_score' | 'hydration_score' | 'oil_control_score' | 'pore_health_score' | 'texture_score' | 'clarity_score'>): number => {
    if (!latestScan || !previousScan) return 0;
    const current = latestScan[metric] as number;
    const previous = previousScan[metric] as number;
    return current - previous;
  };

  // Fetch all data
  const fetchData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Get latest 2 scans (exclude deleted scans)
      const { data: scans, error: scansError } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(2);

      if (scansError) {
        console.error('Error fetching scans:', scansError);
      }

      if (scans && scans.length > 0) {
        setLatestScan(scans[0]);
        if (scans.length > 1) {
          setPreviousScan(scans[1]);
        }

        // Get issues from latest scan
        const { data: issues, error: issuesError } = await supabase
          .from('scan_issues')
          .select('*')
          .eq('scan_id', scans[0].id);

        if (issuesError) {
          console.error('Error fetching issues:', issuesError);
        } else if (issues) {
          setDetectedIssues(issues);
        }
      }

      // Get profile stats
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_scans, current_streak, created_at')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      if (profile) {
        setStats({
          totalScans: profile.total_scans || 0,
          currentStreak: profile.current_streak || 0,
          issuesDetected: detectedIssues.length,
          memberSince: profile.created_at
            ? new Date(profile.created_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })
            : '',
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchData:', error);
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [userId]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('Realtime update received:', payload);

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newScan = payload.new as ScanData;

            // Only update if scan is completed
            if (newScan.status === 'completed') {
              // Move current to previous
              setPreviousScan(latestScan);
              setLatestScan(newScan);

              // Update stats
              setStats(prev => ({
                ...prev,
                totalScans: prev.totalScans + (payload.eventType === 'INSERT' ? 1 : 0),
              }));

              // Fetch updated issues
              const { data: issues } = await supabase
                .from('scan_issues')
                .select('*')
                .eq('scan_id', newScan.id);

              if (issues) {
                setDetectedIssues(issues);
                setStats(prev => ({
                  ...prev,
                  issuesDetected: issues.length,
                }));
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, latestScan]);

  return {
    latestScan,
    previousScan,
    stats,
    isLoading,
    overallScore: latestScan?.overall_score ?? 0,
    overallChange: getChange('overall_score'),
    metrics: {
      hydration: {
        score: latestScan?.hydration_score ?? 0,
        change: getChange('hydration_score'),
      },
      oilControl: {
        score: latestScan?.oil_control_score ?? 0,
        change: getChange('oil_control_score'),
      },
      poreHealth: {
        score: latestScan?.pore_health_score ?? 0,
        change: getChange('pore_health_score'),
      },
      texture: {
        score: latestScan?.texture_score ?? 0,
        change: getChange('texture_score'),
      },
      clarity: {
        score: latestScan?.clarity_score ?? 0,
        change: getChange('clarity_score'),
      },
    },
    detectedIssues,
    refresh: fetchData,
  };
}
