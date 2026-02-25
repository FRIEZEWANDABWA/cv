import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Key, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react'
import useCareerStore from '../../store/careerStore'

export default function Settings() {
    const { aiConfig, updateAiConfig } = useCareerStore()
    const [provider, setProvider] = useState(aiConfig.provider || 'openai')
    const [apiKey, setApiKey] = useState(aiConfig.apiKey || '')
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        setProvider(aiConfig.provider || 'openai')
        setApiKey(aiConfig.apiKey || '')
    }, [aiConfig])

    const handleSave = () => {
        updateAiConfig({ provider, apiKey })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="flex flex-col h-full bg-navy-900">
            <div className="px-8 pt-8 pb-4 border-b border-navy-700">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-gold-500/15 rounded-lg flex items-center justify-center border border-gold-500/30">
                        <SettingsIcon size={16} className="text-gold-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-100">Application Settings</h1>
                </div>
                <p className="text-slate-400 text-sm ml-11">Configure AI intelligence and application preferences.</p>
            </div>

            <div className="p-8 max-w-3xl">
                <div className="card space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={18} className="text-emerald-400" />
                            <h2 className="text-lg font-semibold text-slate-100">AI Intelligence (BYOK)</h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            CareerWeapon uses a "Bring Your Own Key" architecture. This means your CV data is never sent to our servers. It travels directly from your browser to your chosen AI provider, ensuring 100% privacy for your executive data.
                        </p>

                        <div className="space-y-5">
                            <div>
                                <label className="label mb-2 block">AI Provider</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setProvider('openai')}
                                        className={`px-4 py-3 rounded-lg border text-left transition-all ${provider === 'openai'
                                                ? 'bg-gold-500/10 border-gold-500/50 text-gold-400'
                                                : 'bg-navy-800 border-navy-700 hover:border-navy-600 text-slate-400'
                                            }`}
                                    >
                                        <p className="font-medium text-slate-200 text-sm">OpenAI (Recommended)</p>
                                        <p className="text-xs opacity-70 mt-1">Uses GPT-4o-mini for fast, high-quality generation.</p>
                                    </button>
                                    <button
                                        onClick={() => setProvider('gemini')}
                                        className={`px-4 py-3 rounded-lg border text-left transition-all ${provider === 'gemini'
                                                ? 'bg-gold-500/10 border-gold-500/50 text-gold-400'
                                                : 'bg-navy-800 border-navy-700 hover:border-navy-600 text-slate-400'
                                            }`}
                                    >
                                        <p className="font-medium text-slate-200 text-sm">Google Gemini</p>
                                        <p className="text-xs opacity-70 mt-1">Uses Gemini 2.5 Flash. Requires Google API Key.</p>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label mb-2 block">API Key</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key size={16} className="text-slate-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder={provider === 'openai' ? "sk-proj-..." : "AIzaSy..."}
                                        className="input pl-10 w-full font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Keys are stored locally in your browser's localStorage and are never transmitted anywhere except directly to {provider === 'openai' ? 'OpenAI' : 'Google'}.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-navy-700 flex items-center gap-4">
                                <button
                                    onClick={handleSave}
                                    className="btn-primary"
                                >
                                    Save Configuration
                                </button>
                                {saved && (
                                    <span className="text-emerald-400 text-sm flex items-center gap-1.5 animate-in fade-in">
                                        <CheckCircle size={14} /> Saved securely to browser
                                    </span>
                                )}
                                {!saved && !apiKey && (
                                    <span className="text-amber-400/80 text-sm flex items-center gap-1.5">
                                        <AlertTriangle size={14} /> AI features are currently disabled
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
