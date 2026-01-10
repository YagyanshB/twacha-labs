import { PRICING_TIERS, PricingTier } from './pricing';

// Simple usage tracking (expand with database later)

export interface UsageData {
  userId: string;
  analysisCount: number;
  lastAnalysisDate: string;
  tier: PricingTier;
  resetDate: string;
}

export function getUserUsage(userId: string): UsageData {
  // For now, use localStorage (replace with DB later)
  if (typeof window === 'undefined') return getDefaultUsage(userId);
  
  const stored = localStorage.getItem(`usage_${userId}`);
  if (!stored) return getDefaultUsage(userId);
  
  const usage = JSON.parse(stored);
  
  // Check if month has reset
  const now = new Date();
  const resetDate = new Date(usage.resetDate);
  
  if (now > resetDate) {
    // Reset counter
    usage.analysisCount = 0;
    usage.resetDate = getNextMonthDate();
    localStorage.setItem(`usage_${userId}`, JSON.stringify(usage));
  }
  
  return usage;
}

export function incrementUsage(userId: string): boolean {
  const usage = getUserUsage(userId);
  const tier = PRICING_TIERS[usage.tier];
  
  // Check if limit reached
  if (usage.analysisCount >= tier.limits.analysesPerMonth) {
    return false; // Limit reached
  }
  
  // Check if month has reset
  const now = new Date();
  const resetDate = new Date(usage.resetDate);
  
  if (now > resetDate) {
    // Reset counter
    usage.analysisCount = 1;
    usage.resetDate = getNextMonthDate();
  } else {
    usage.analysisCount++;
  }
  
  usage.lastAnalysisDate = now.toISOString();
  
  localStorage.setItem(`usage_${userId}`, JSON.stringify(usage));
  return true;
}

export function canAnalyze(userId: string): { allowed: boolean; reason?: string } {
  const usage = getUserUsage(userId);
  const tier = PRICING_TIERS[usage.tier];
  
  if (usage.analysisCount >= tier.limits.analysesPerMonth) {
    return {
      allowed: false,
      reason: `You've reached your ${tier.limits.analysesPerMonth} analysis limit this month`
    };
  }
  
  return { allowed: true };
}

function getDefaultUsage(userId: string): UsageData {
  return {
    userId,
    analysisCount: 0,
    lastAnalysisDate: new Date().toISOString(),
    tier: 'free',
    resetDate: getNextMonthDate()
  };
}

function getNextMonthDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}
