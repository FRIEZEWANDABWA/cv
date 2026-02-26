import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, AlertCircle, Loader2, User, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import useCareerStore from '../../store/careerStore'
import { processCvChat, processCoverLetterChat } from './aiChatService'

export default function FloatingAIChat({ mode = 'cv' }) {
    const { career, updateCareer, coverLetter, updateCoverLetter, aiConfig } = useCareerStore()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', text: `Hi! I'm your AI ${mode === 'cv' ? 'CV' : 'Cover Letter'} Editor. Tell me what changes you'd like to make!` }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const messagesEndRef = useRef(null)
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, loading, isOpen])

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
            const recentHistory = newHistory.slice(-5)

            if (mode === 'cv') {
                const result = await processCvChat(recentHistory, career, aiConfig)
                if (result.updatedCareerData) {
                    updateCareer(result.updatedCareerData)
                }
                setMessages(prev => [...prev, { role: 'assistant', text: result.assistantReply }])
            } else if (mode === 'cover-letter') {
                const result = await processCoverLetterChat(recentHistory, coverLetter.generatedText, aiConfig)
                if (result.updatedCoverLetterText) {
                    updateCoverLetter({ generatedText: result.updatedCoverLetterText })
                }
                setMessages(prev => [...prev, { role: 'assistant', text: result.assistantReply }])
            }
        } catch (err) {
            console.error(err)
            setError(err.message || 'Something went wrong.')
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error while applying changes." }])
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-navy-900 border border-gold-500/50 shadow-xl shadow-gold-500/20 rounded-full flex flex-col items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-navy-900 transition-all z-50 group"
            >
                <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
            </button>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 max-w-[90vw] h-[550px] max-h-[85vh] bg-navy-950 border border-gold-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 flex-shrink-0 animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="px-4 py-3 bg-navy-900/80 border-b border-navy-800 flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                        <Sparkles size={16} className="text-gold-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                            AI Output Editor <span className="px-1.5 py-0.5 rounded text-[9px] bg-navy-700 text-slate-400 uppercase border border-navy-600">Beta</span>
                        </h3>
                        <p className="text-[10px] text-slate-400">Directly edits the {mode === 'cv' ? 'Resume Data' : 'Letter Text'}</p>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-200 transition-colors bg-navy-800 p-1.5 rounded-lg border border-navy-700">
                    <ChevronDown size={14} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-navy-950/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                            ${msg.role === 'user' ? 'bg-slate-700' : 'bg-gold-500/20 border border-gold-500/30'}`}
                        >
                            {msg.role === 'user' ? <User size={12} className="text-slate-300" /> : <Bot size={12} className="text-gold-400" />}
                        </div>
                        <div className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%]
                            ${msg.role === 'user'
                                ? 'bg-navy-700 text-slate-200 rounded-tr-none'
                                : 'bg-navy-800/80 border border-navy-700 text-slate-300 rounded-tl-none'}`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-gold-500/20 border border-gold-500/30">
                            <Bot size={12} className="text-gold-400" />
                        </div>
                        <div className="p-3 rounded-xl bg-navy-800/80 border border-navy-700 text-slate-400 rounded-tl-none flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin text-gold-500" />
                            <span className="text-xs">Processing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-navy-900/80 border-t border-navy-800">
                {error && (
                    <div className="mb-2 text-[10px] text-red-400 flex items-center gap-1.5 bg-red-500/10 px-2 py-1.5 rounded border border-red-500/20">
                        <AlertCircle size={10} /> {error}
                    </div>
                )}
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        placeholder={aiConfig?.apiKey ? "Prompt AI to make changes..." : "Add API key in settings."}
                        className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-3 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all resize-none min-h-[44px] placeholder:text-slate-500"
                        rows={1}
                        disabled={loading || !aiConfig?.apiKey}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading || !aiConfig?.apiKey}
                        className="absolute right-2 bottom-2 p-1.5 bg-gold-500 hover:bg-gold-400 disabled:bg-navy-700 disabled:text-slate-500 text-navy-900 rounded-md transition-colors cursor-pointer"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
