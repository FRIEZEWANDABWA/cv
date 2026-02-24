import { useMemo } from 'react'
import { CheckCircle, XCircle, RefreshCw, Lightbulb } from 'lucide-react'
import useCareerStore from '../../store/careerStore'
import { suggestToneVerb, toneIntegrityCheck } from '../../utils/toneEngine'

/**
 * Generates JD-driven suggestions from an existing jdAnalysis.
 * Returns array of suggestion objects — never writes anything automatically.
 */
function generateSuggestions(career, analysis) {
    if (!analysis || !career) return []
    const suggestions = []
    const mode = analysis.suggestedPositioning || career.positioning || 'hybrid'

    // 1. Suggest reordering competencies based on JD emphasis
    const topCategory = Object.entries(analysis.categoryScores || {})
        .sort((a, b) => b[1] - a[1])[0]?.[0]

    const categoryToSkill = {
        governance: 'governance',
        cloud: 'technical',
        infrastructure: 'technical',
        security: 'governance',
        itsm: 'governance',
        leadership: 'leadership',
    }
    const topSkillGroup = categoryToSkill[topCategory] || null

    if (topSkillGroup && topSkillGroup !== 'technical') {
        suggestions.push({
            id: `suggest-skills-${topSkillGroup}`,
            type: 'reorderSkillCategory',
            title: `Elevate ${topSkillGroup} skills`,
            description: `This JD is ${topCategory}-heavy. Moving the ${topSkillGroup} competency group to the top aligns your skills section with what the hiring team prioritises.`,
            preview: `Skills order: ${topSkillGroup} → technical → leadership`,
            payload: null,
            category: 'skills',
        })
    }

    // 2. Per-experience: suggest reordering achievements to put highest-relevance first
    career.experiences.forEach((exp) => {
        if (!exp.achievements?.length) return
        const scored = exp.achievements.map((a) => {
            let score = 0
            const lower = (a.text || '').toLowerCase()
            Object.entries(analysis.categoryScores || {}).forEach(([cat, weight]) => {
                const keywords = analysis.presentKeywords?.[cat] || []
                keywords.forEach((kw) => { if (lower.includes(kw.toLowerCase())) score += weight })
            })
            return { ...a, score }
        })
        const sorted = [...scored].sort((a, b) => b.score - a.score)
        const alreadySorted = scored.every((a, i) => a.id === sorted[i].id)
        if (!alreadySorted && sorted[0].id !== scored[0].id) {
            suggestions.push({
                id: `suggest-order-${exp.id}`,
                type: 'reorderAchievements',
                title: `Reorder achievements in ${exp.role} at ${exp.company}`,
                description: `Move the most JD-relevant achievement to the top: "${sorted[0].text?.slice(0, 80)}…"`,
                preview: `Top bullet → "${sorted[0].text?.slice(0, 60)}…"`,
                payload: { expId: exp.id, newOrder: sorted },
                category: 'experience',
            })
        }
    })

    // 3. Suggest tone verb improvements on top 3 achievements
    const allAchs = career.experiences.flatMap((e) => e.achievements || [])
    let verbSuggestCount = 0
    allAchs.forEach((ach) => {
        if (verbSuggestCount >= 3) return
        const s = suggestToneVerb(ach.text, mode)
        if (s) {
            suggestions.push({
                id: `suggest-verb-${ach.id}`,
                type: 'verbSuggestion',
                title: `Strengthen verb: "${s.original}"`,
                description: s.reason,
                preview: `Consider: "${s.suggestion}" instead of "${s.original}"`,
                payload: { achId: ach.id, suggestion: s.suggestion },
                category: 'tone',
            })
            verbSuggestCount++
        }
    })

    // 4. Flag tone integrity issues
    allAchs.slice(0, 15).forEach((ach) => {
        const flags = toneIntegrityCheck(ach.text || '')
        flags.filter((f) => f.severity === 'high').slice(0, 1).forEach((f) => {
            suggestions.push({
                id: `suggest-tone-${ach.id}-${f.type}`,
                type: 'toneFlag',
                title: `Tone alert: ${f.type}`,
                description: f.message,
                preview: `In: "${(ach.text || '').slice(0, 70)}…"`,
                payload: null,
                category: 'tone',
            })
        })
    })

    return suggestions
}

const CATEGORY_STYLES = {
    skills: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    experience: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
    tone: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

function SuggestionCard({ s, onAccept, onReject }) {
    const canAccept = s.type !== 'verbSuggestion' && s.type !== 'toneFlag'

    return (
        <div className="border border-navy-600 rounded-xl overflow-hidden bg-navy-800 mb-3">
            <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5">
                    <Lightbulb size={15} className="text-gold-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-slate-200 text-sm font-medium">{s.title}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_STYLES[s.category] || ''}`}>{s.category}</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed mb-2">{s.description}</p>
                    <div className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-xs text-gold-300/80 font-mono">
                        {s.preview}
                    </div>
                </div>
            </div>
            <div className="flex border-t border-navy-700">
                {canAccept && (
                    <button
                        onClick={() => onAccept(s.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    >
                        <CheckCircle size={12} /> Accept
                    </button>
                )}
                <button
                    onClick={() => onReject(s.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:bg-navy-700 transition-colors cursor-pointer ${canAccept ? 'border-l border-navy-700' : ''}`}
                >
                    <XCircle size={12} /> {canAccept ? 'Reject' : 'Dismiss'}
                </button>
            </div>
        </div>
    )
}

export default function SuggestionEngine() {
    const { career, jdAnalysis, pendingChanges, acceptPendingChange, rejectPendingChange, addPendingChange, clearPendingChanges } = useCareerStore()

    const suggestions = useMemo(
        () => generateSuggestions(career, jdAnalysis),
        [career, jdAnalysis]
    )

    const handleAccept = (id) => {
        const s = suggestions.find((sg) => sg.id === id)
        if (!s?.payload) return
        acceptPendingChange(id) || addPendingChange({ ...s })
        // Directly apply if payload is ready
        const store = useCareerStore.getState()
        if (s.type === 'reorderAchievements') {
            store.reorderAchievements(s.payload.expId, s.payload.newOrder)
        }
    }

    const handleReject = (id) => {
        rejectPendingChange(id)
    }

    if (!jdAnalysis) {
        return (
            <div className="p-6 text-center">
                <RefreshCw size={20} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Analyse a job description first to see suggestions here.</p>
            </div>
        )
    }

    if (suggestions.length === 0) {
        return (
            <div className="p-6 text-center">
                <CheckCircle size={20} className="text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No suggestions</p>
                <p className="text-slate-600 text-xs mt-1">Your CV is well-aligned to this JD.</p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-slate-200 text-sm font-semibold">{suggestions.length} suggestions</p>
                    <p className="text-slate-500 text-xs mt-0.5">All changes require your confirmation</p>
                </div>
            </div>
            {suggestions.map((s) => (
                <SuggestionCard key={s.id} s={s} onAccept={handleAccept} onReject={handleReject} />
            ))}
        </div>
    )
}
