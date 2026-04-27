import { useState } from 'react'
import { Star, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Lightbulb, Zap } from 'lucide-react'
import useCareerStore from '../../../store/careerStore'

const SPECIFICITY_PATTERNS = [
    { pattern: /\d+/, label: 'Contains a number', weight: 15 },
    { pattern: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4}|q[1-4])\b/i, label: 'Has a time reference', weight: 10 },
    { pattern: /\b(aws|dhl|cisco|sony|google|microsoft|giz|bolt|safaricom|equity|kcb|ke|nairobi|mombasa|kisumu|kenya|africa)\b/i, label: 'Named entity (company/place)', weight: 20 },
    { pattern: /\b(prevented|stopped|rescued|saved|blocked|avoided|diverted|contained)\b/i, label: 'Contains a preventive action verb', weight: 15 },
    { pattern: /\b(before|without|despite|after|within|ahead of)\b/i, label: 'Has a situational qualifier', weight: 10 },
    { pattern: /\b(%|percent|ksh|usd|million|thousand|\$|£)\b/i, label: 'Contains a metric or currency', weight: 15 },
    { pattern: /\b(only i|only our team|first time|never before|first in|sole)\b/i, label: 'Claims uniqueness', weight: 15 },
]

function scoreFlgship(text) {
    if (!text || text.trim().length < 20) return { score: 0, passed: [], failed: SPECIFICITY_PATTERNS.map(p => p.label) }
    const passed = []
    const failed = []
    let score = 0
    SPECIFICITY_PATTERNS.forEach(({ pattern, label, weight }) => {
        if (pattern.test(text)) {
            passed.push(label)
            score += weight
        } else {
            failed.push(label)
        }
    })
    // Word count bonus
    const words = text.trim().split(/\s+/).length
    if (words >= 20) score += 10
    if (words >= 35) score += 10
    return { score: Math.min(100, score), passed, failed }
}

function ScoreBadge({ score }) {
    const color = score >= 70 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
        : score >= 40 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
            : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    const label = score >= 70 ? 'Strong' : score >= 40 ? 'Developing' : 'Weak'
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${color}`}>
            {score}/100 · {label}
        </span>
    )
}

function FlagshipCard({ exp }) {
    const { updateFlagshipBullet } = useCareerStore()
    const [expanded, setExpanded] = useState(false)
    const text = exp.flagshipBullet || ''
    const { score, passed, failed } = scoreFlgship(text)

    return (
        <div className={`rounded-xl border overflow-hidden transition-all ${text.trim() ? 'border-gold-500/30 bg-navy-800' : 'border-navy-600 bg-navy-800'}`}>
            {/* Header */}
            <div
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none"
                onClick={() => setExpanded(v => !v)}
            >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${text.trim() ? 'bg-gold-500/15 border border-gold-500/30' : 'bg-navy-700 border border-navy-600'}`}>
                    <Star size={14} className={text.trim() ? 'text-gold-500' : 'text-slate-600'} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-slate-100 text-sm font-semibold truncate">{exp.role}</p>
                    <p className="text-slate-500 text-xs truncate">{exp.company}{exp.period ? ` · ${exp.period}` : ''}</p>
                </div>
                {text.trim() && <ScoreBadge score={score} />}
                {!text.trim() && <span className="text-xs text-rose-400 font-medium">Not written</span>}
                {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
            </div>

            {expanded && (
                <div className="px-5 pb-5 border-t border-navy-700 pt-4 space-y-4">
                    {/* The input */}
                    <div>
                        <label className="label mb-2 flex items-center gap-1.5">
                            <Star size={11} className="text-gold-500" />
                            Flagship Bullet — the one line only you could write
                        </label>
                        <textarea
                            className="input w-full min-h-[90px] resize-y text-sm leading-relaxed"
                            placeholder={`Write the one achievement from ${exp.company} that no AI could fabricate. Be specific: name the exact client, the time, the decision you made. e.g. "At 02:00, isolated a live intrusion attempt before any data was exfiltrated — protecting AWS and DHL environments with zero downtime."`}
                            value={text}
                            onChange={e => updateFlagshipBullet(exp.id, e.target.value)}
                        />
                    </div>

                    {/* Score breakdown */}
                    {text.trim().length > 10 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Specificity Analysis</p>
                                <ScoreBadge score={score} />
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                {passed.map(p => (
                                    <div key={p} className="flex items-center gap-2">
                                        <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                                        <span className="text-emerald-300 text-xs">{p}</span>
                                    </div>
                                ))}
                                {failed.map(f => (
                                    <div key={f} className="flex items-center gap-2">
                                        <AlertTriangle size={11} className="text-slate-600 flex-shrink-0" />
                                        <span className="text-slate-600 text-xs">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function FlagshipBulletTab() {
    const { career } = useCareerStore()
    const experiences = (career.experiences || []).filter(e => e.role)
    const filled = experiences.filter(e => e.flagshipBullet?.trim())

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Zap size={16} className="text-gold-500" />
                    <h2 className="text-slate-100 font-semibold text-base">Flagship Bullets</h2>
                    <span className="text-xs bg-gold-500/15 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded font-medium">
                        {filled.length}/{experiences.length} Done
                    </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                    One sentence per role that only you could have written. A hiring manager on CV&nbsp;#847
                    will remember exactly one thing — make it this line.
                </p>
            </div>

            {/* Guidance card */}
            <div className="card bg-gold-500/5 border-gold-500/20">
                <div className="flex items-start gap-3">
                    <Lightbulb size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                        <p className="text-gold-300 text-sm font-medium">What makes a flagship bullet unforgettable?</p>
                        <ul className="space-y-1 text-slate-400 text-xs">
                            <li>· <strong className="text-slate-300">It has a time stamp</strong> — "at 02:00", "within 48 hours", "before Q4 audit"</li>
                            <li>· <strong className="text-slate-300">It names someone real</strong> — a client (AWS, DHL), a regulator, a counterpart</li>
                            <li>· <strong className="text-slate-300">It describes a decision only YOU made</strong> — not "the team" or "we"</li>
                            <li>· <strong className="text-slate-300">It has a consequence</strong> — what would have happened if you hadn't acted?</li>
                            <li>· <strong className="text-slate-300">It's longer than 25 words</strong> — specificity takes space</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Experience cards */}
            <div className="space-y-3">
                {experiences.length === 0 ? (
                    <div className="border-2 border-dashed border-navy-600 rounded-xl p-10 text-center">
                        <Star size={28} className="text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No experience entries yet. Add them in the Experience tab first.</p>
                    </div>
                ) : (
                    experiences.map(exp => <FlagshipCard key={exp.id} exp={exp} />)
                )}
            </div>
        </div>
    )
}
