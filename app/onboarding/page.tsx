'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()

  const handleSkip = async () => {
    if (!user) return

    // Mark onboarding as complete
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id)

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-light mb-4">Welcome to Twacha Labs</h1>
        <p className="text-xl text-gray-600 font-light mb-12">
          We'll build the full onboarding flow next. For now, let's get you started.
        </p>
        <button
          onClick={handleSkip}
          className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition"
        >
          Continue to Dashboard →
        </button>
      </div>
    </div>
  )
}
