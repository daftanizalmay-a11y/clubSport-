'use client'
import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

const suggestions = [
  'Skriv ett mötesprotokoll för styrelsemötet',
  'Hur många medlemmar har vi betalt denna säsong?',
  'Skriv en välkomsthälsning till nya medlemmar',
  'Vad behöver vi tänka på inför AGM?',
  'Hjälp mig skriva en kallelse till nästa match',
]

export default function AIClient({ club, members, teams, userId }: { club: any; members: any[]; teams: any[]; userId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hej! Jag är er AI-assistent för ${club.name}. Jag kan hjälpa er med protokoll, kommunikation, administrativa frågor och mycket mer. Vad kan jag hjälpa er med idag?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const primaryColor = club?.primary_color || '#22c55e'

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return
    const userMessage: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          club_context: {
            name: club.name,
            sport: club.sport,
            city: club.city,
            member_count: members.length,
            team_count: teams.length,
            plan: club.plan_slug,
          }
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content || 'Något gick fel. Försök igen.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ett fel uppstod. Kontrollera din anslutning och försök igen.' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">AI</p>
        <h1 className="text-3xl font-bold text-white">AI-assistent</h1>
        <p className="text-white/50 mt-1">{club.name} · {members.length} medlemmar · {teams.length} lag</p>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0 text-black font-bold" style={{ backgroundColor: primaryColor }}>AI</div>
              )}
              <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'text-black' : 'bg-white/10 text-white'}`}
                style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 text-black font-bold" style={{ backgroundColor: primaryColor }}>AI</div>
              <div className="bg-white/10 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-white/30 text-xs mb-2">Förslag:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/10 p-4 flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
            placeholder="Skriv ett meddelande..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm" />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 text-black transition-colors"
            style={{ backgroundColor: primaryColor }}>
            Skicka
          </button>
        </div>
      </div>
    </div>
  )
}
