import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, AlertCircle, Loader2, User } from 'lucide-react'
import useCareerStore from '../../store/careerStore'
import { processCvChat } from './aiChatService'

export default function AIAssistant() {
    const { career, updateCareer, aiConfig } = useCareerStore()

    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm your AI CV Editor. I have direct access to your Career Database. Tell me what you'd like to change—e.g., 'Rewrite my summary to be more authoritative', 'Add a skill called Kubernetes', or 'Shorten my latest job's achievements'." }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Auto-scroll to bottom of chat
    const messagesEndRef = useRef(null)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const handleSend = async () => {
        if (!input.trim() || loading) return
        if (!aiConfig?.apiKey) {
            setError("Please configure your API Key in Settings first.")
            return
        }

        const userText = input.trim()
        setInput('')
        setError('')
        setLoading(true)

        const newHistory = [...messages, { role: 'user', text: userText }]
        setMessages(newHistory)

        try {
            // Keep recent history short to save context window (last 5 messages)
            const recentHistory = newHistory.slice(-5)

            const result = await processCvChat(recentHistory, career, aiConfig)

            // Apply the mutated CV object directly to the store
            if (result.updatedCareerData) {
                updateCareer(result.updatedCareerData)
            }

            // Add the assistant's reply
            setMessages(prev => [...prev, { role: 'assistant', text: result.assistantReply }])
        } catch (err) {
            console.error(err)
            setError(err.message || 'Something went wrong.')
            // Add error message to chat
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error while updating your CV." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-navy-950">
            {/* Header */}
            <div className="px-6 py-5 border-b border-navy-800 bg-navy-900/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                        <Sparkles size={20} className="text-gold-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            CV Editor AI
                        </h1>
                        <p className="text-sm text-slate-400">Give me instructions and I'll update your Career Database automatically.</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                            ${msg.role === 'user' ? 'bg-slate-700' : 'bg-gold-500/20 border border-gold-500/30'}`}
                        >
                            {msg.role === 'user' ? <User size={14} className="text-slate-300" /> : <Bot size={14} className="text-gold-400" />}
                        </div>

                        {/* Message Bubble */}
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed
                            ${msg.role === 'user'
                                ? 'bg-navy-700 text-slate-200 rounded-tr-none'
                                : 'bg-navy-800/80 border border-navy-700 text-slate-300 rounded-tl-none'}`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-4 max-w-3xl">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-gold-500/20 border border-gold-500/30">
                            <Bot size={14} className="text-gold-400" />
                        </div>
                        <div className="p-4 rounded-2xl bg-navy-800/80 border border-navy-700 text-slate-400 rounded-tl-none flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-gold-500" />
                            <span>Analyzing your CV data and making changes...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-navy-800 bg-navy-900/50 flex-shrink-0">
                {error && (
                    <div className="mb-3 text-[11px] text-red-400 flex items-center gap-1.5 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <AlertCircle size={12} /> {error}
                    </div>
                )}

                <div className="relative max-w-4xl mx-auto">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        placeholder={aiConfig?.apiKey ? "e.g. 'Rewrite my most recent job's achievements using the STAR method...'" : "Please enter your AI API key in Settings first."}
                        className="w-full bg-navy-800 border border-navy-700 rounded-xl pl-4 pr-12 py-4 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all resize-none min-h-[56px] placeholder:text-slate-500"
                        rows={2}
                        disabled={loading || !aiConfig?.apiKey}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading || !aiConfig?.apiKey}
                        className="absolute right-3 bottom-3 p-2 bg-gold-500 hover:bg-gold-400 disabled:bg-navy-700 disabled:text-slate-500 text-navy-900 rounded-lg transition-colors cursor-pointer"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-center text-[10px] text-slate-500 mt-3">
                    The AI has direct write-access to your database. Use 'CV Versions' tab to save a snapshot before making bulk changes!
                </p>
            </div>
        </div>
    )
}
