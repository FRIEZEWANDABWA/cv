import { useState } from 'react'
import { Search, Zap, AlertCircle, CheckCircle, TrendingUp, Target, RefreshCw } from 'lucide-react'
import useCareerStore from '../../store/careerStore'
import { analyzeJD } from './analyzeJD'
import { POSITIONING_MODES, TAG_COLORS } from '../../utils/constants'

function ScoreBadge({ score }) {
    const color = score >= 75 ? 'bg-success/15 text-success border-success/30'
        : score >= 50 ? 'bg-warning/15 text-warning border-warning/30'
            : 'bg-danger/15 text-danger border-danger/30'
    const label = score >= 75 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Weak Match'

    return (
        <div className={`flex flex-col items-center justify-center p-6 rounded-xl border ${color}`}>
            <span className="text-4xl font-bold">{score}%</span>
            <span className="text-sm font-medium mt-1">{label}</span>
            <span className="text-xs opacity-70 mt-0.5">ATS Alignment Score</span>
        </div>
    )
}

function CategoryBar({ label, score, max }) {
    const pct = max > 0 ? Math.round((score / max) * 100) : 0
    const color = pct >= 66 ? 'bg-success' : pct >= 33 ? 'bg-warning' : 'bg-slate-600'
    return (
        <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 text-xs capitalize">{label}</span>
                <span className="text-slate-400 text-xs">{score} hits</span>
            </div>
            <div className="h-1.5 bg-navy-600 rounded-full">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    )
}

export default function JDAnalyzer() {
    const { jdText, jdAnalysis, setJdText, setJdAnalysis, career, updatePositioning } = useCareerStore()
    const [loading, setLoading] = useState(false)

    const handleAnalyze = () => {
        if (!jdText.trim()) return
        setLoading(true)
        setTimeout(() => { // Simulate brief processing
            const result = analyzeJD(jdText, career)
            setJdAnalysis(result)
            setLoading(false)
        }, 600)
    }

    const handleClear = () => { setJdText(''); setJdAnalysis(null) }

    const maxCategory = jdAnalysis
        ? Math.max(...Object.values(jdAnalysis.categoryScores))
        : 1

    const suggestedMode = jdAnalysis
        ? POSITIONING_MODES.find((m) => m.id === jdAnalysis.suggestedPositioning)
        : null

    return (
        <div className="flex flex-col h-full min-h-screen">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-navy-700">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-gold-500/15 rounded-lg flex items-center justify-center border border-gold-500/30">
                        <Search size={16} className="text-gold-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-100">JD Intelligence Analyzer</h1>
                </div>
                <p className="text-slate-400 text-sm ml-11">
                    Paste any job description. Get instant keyword alignment, gap analysis, and positioning guidance.
                </p>
            </div>

            <div className="flex flex-1 gap-0 overflow-hidden">
                {/* Left — Input */}
                <div className="w-[45%] p-6 border-r border-navy-700 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <label className="label">Job Description</label>
                        {jdText && (
                            <button onClick={handleClear} className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 cursor-pointer">
                                <RefreshCw size={11} /> Clear
                            </button>
                        )}
                    </div>
                    <textarea
                        className="textarea flex-1 min-h-[400px] text-sm leading-relaxed"
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder={`Paste the full job description here...

Example:
We are seeking a Head of IT to lead our enterprise technology strategy. The ideal candidate will have 10+ years of IT leadership experience with strong expertise in IT governance, ITIL, Azure cloud migration, cybersecurity, and ERP systems. You will manage a team of 30+ across infrastructure, service delivery, and cybersecurity functions...`}
                    />
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-slate-500 text-xs">
                            {jdText.split(/\s+/).filter(Boolean).length} words
                        </span>
                        <button
                            onClick={handleAnalyze}
                            disabled={!jdText.trim() || loading}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? <><RefreshCw size={14} className="animate-spin" /> Analyzing...</>
                                : <><Zap size={14} /> Analyze JD</>
                            }
                        </button>
                    </div>
                </div>

                {/* Right — Results */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {!jdAnalysis
                        ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mb-4 border border-navy-600">
                                    <Search size={24} className="text-slate-500" />
                                </div>
                                <p className="text-slate-400 text-sm font-medium">Paste a JD and click Analyze</p>
                                <p className="text-slate-600 text-xs mt-1">Results will appear here instantly</p>
                            </div>
                        )
                        : (
                            <div className="space-y-5">
                                {/* Score + Positioning */}
                                <div className="grid grid-cols-3 gap-4">
                                    <ScoreBadge score={jdAnalysis.matchScore} />
                                    <div className="col-span-2 card">
                                        <p className="label mb-2">Suggested Role Positioning</p>
                                        {suggestedMode && (
                                            <>
                                                <p className="text-gold-400 font-semibold text-base mb-1">{suggestedMode.label}</p>
                                                <p className="text-slate-400 text-xs mb-3">
                                                    Based on JD emphasis, switch your positioning to highlight the right strengths.
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {suggestedMode.tags.map((t) => (
                                                        <span key={t} className={`tag text-xs border ${TAG_COLORS[t] || 'tag'}`}>{t}</span>
                                                    ))}
                                                </div>
                                                {career.positioning !== jdAnalysis.suggestedPositioning && (
                                                    <button
                                                        onClick={() => updatePositioning(jdAnalysis.suggestedPositioning)}
                                                        className="btn-primary text-xs py-1.5"
                                                    >
                                                        Apply Positioning →
                                                    </button>
                                                )}
                                                {career.positioning === jdAnalysis.suggestedPositioning && (
                                                    <span className="text-success text-xs flex items-center gap-1">
                                                        <CheckCircle size={12} /> Already applied
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Category JD Intensity */}
                                <div className="card">
                                    <p className="label mb-4">JD Category Intensity</p>
                                    {Object.entries(jdAnalysis.categoryScores)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([cat, score]) => (
                                            <CategoryBar key={cat} label={cat} score={score} max={maxCategory} />
                                        ))
                                    }
                                </div>

                                {/* Keywords Present */}
                                <div className="card">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle size={14} className="text-success" />
                                        <p className="text-slate-200 text-sm font-medium">Keywords Present in Your CV ({jdAnalysis.presentKeywords.length})</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {jdAnalysis.presentKeywords.length === 0
                                            ? <p className="text-slate-500 text-xs">None detected — consider enriching your CV data.</p>
                                            : jdAnalysis.presentKeywords.map((kw) => (
                                                <span key={kw} className="bg-success/10 text-success text-xs px-2 py-0.5 rounded border border-success/25 font-medium">
                                                    {kw}
                                                </span>
                                            ))
                                        }
                                    </div>
                                </div>

                                {/* Missing Keywords */}
                                <div className="card">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle size={14} className="text-warning" />
                                        <p className="text-slate-200 text-sm font-medium">Keyword Gaps ({jdAnalysis.missingKeywords.length})</p>
                                    </div>
                                    <p className="text-slate-400 text-xs mb-3">
                                        These JD keywords are not detected in your current CV. Review each — if you have the experience, add it.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {jdAnalysis.missingKeywords.length === 0
                                            ? <p className="text-success text-xs font-medium">✓ No significant gaps detected</p>
                                            : jdAnalysis.missingKeywords.map((kw) => (
                                                <span key={kw} className="bg-warning/10 text-warning text-xs px-2 py-0.5 rounded border border-warning/25 font-medium">
                                                    {kw}
                                                </span>
                                            ))
                                        }
                                    </div>
                                </div>

                                {/* Priority Tags */}
                                {jdAnalysis.tagEmphasis.length > 0 && (
                                    <div className="card">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Target size={14} className="text-gold-500" />
                                            <p className="text-slate-200 text-sm font-medium">Prioritize These Tags in CV</p>
                                        </div>
                                        <p className="text-slate-400 text-xs mb-3">
                                            Lead with achievements tagged below. Move them to the top of each role in the Career DB.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {jdAnalysis.tagEmphasis.map((tag) => (
                                                <span key={tag} className={`tag border text-xs ${TAG_COLORS[tag] || ''}`}>{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
