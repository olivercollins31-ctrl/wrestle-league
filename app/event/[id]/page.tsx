'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

// EventPage component renders details for a specific event and allows users to submit predictions
export default function EventPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [eventData, setEventData] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [predictions, setPredictions] = useState<Record<string, string>>({})
  const [jokerMatchId, setJokerMatchId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch event details and associated matches
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        // Fetch event
        const { data: eventData, error: eventError } = await supabase
          .from('mvp_events')
          .select('*')
          .eq('id', id)
          .single()
        if (eventError) throw eventError
        setEventData(eventData)
        // Fetch matches for this event
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('event_id', id)
        if (matchError) throw matchError
        setMatches(matchData || [])
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  // Handle prediction selection
  const handlePredictionChange = (matchId: string, predictedWinner: string) => {
    setPredictions((prev) => ({ ...prev, [matchId]: predictedWinner }))
  }

  // Handle joker match selection
  const handleJokerChange = (matchId: string) => {
    setJokerMatchId(matchId)
  }

  // Submit predictions to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        alert('Please log in to submit predictions.')
        return
      }
      const insertPayload = Object.entries(predictions).map(([matchId, predictedWinner]) => ({
        user_id: user.id,
        match_id: matchId,
        predicted_winner: predictedWinner,
        joker: jokerMatchId === matchId,
      }))
      const { error: insertError } = await supabase.from('predictions').insert(insertPayload)
      if (insertError) throw insertError
      // After successful submission, redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      {eventData && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">{eventData.name}</h2>
          <p className="text-gray-400">
            {new Date(eventData.event_date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className="border border-gray-700 rounded p-4">
              <h3 className="font-semibold mb-2">{match.match_title}</h3>
              <div className="space-y-2">
                {/* Replace the following options with actual wrestler names or options from your data */}
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`prediction-${match.id}`}
                    value="optionA"
                    checked={predictions[match.id] === 'optionA'}
                    onChange={() => handlePredictionChange(match.id, 'optionA')}
                  />
                  Option A
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`prediction-${match.id}`}
                    value="optionB"
                    checked={predictions[match.id] === 'optionB'}
                    onChange={() => handlePredictionChange(match.id, 'optionB')}
                  />
                  Option B
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={jokerMatchId === match.id}
                    onChange={() => handleJokerChange(match.id)}
                  />
                  Joker (double points)
                </label>
              </div>
            </div>
          ))
        ) : (
          <p>No matches available for this event.</p>
        )}
        {matches.length > 0 && (
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white mt-4"
          >
            Submit Predictions
          </button>
        )}
      </form>
    </div>
  )
}
