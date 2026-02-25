import { useState, useRef } from 'react'
import { ClipboardPaste, Split, CheckCircle, XCircle, Edit3, Plus, ChevronDown, ChevronUp, Loader } from 'lucide-react'
import useCareerStore from '../../store/careerStore'
import { v4 as uuidv4 } from 'uuid'
import { aiParseCV } from './aiParseCV'

// ── Text Parser ───────────────────────────────────────────────────────────────
function parseCV(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)

    const result = {
        summary: '',
        experiences: [],
        skills: { technical: [], governance: [], leadership: [] },
        certifications: [],
        education: [],
    }

    // Detect section boundaries by common headings
    const HEADINGS = {
        summary: /^(summary|profile|executive\s+summary|about|overview)/i,
        experience: /^(experience|employment|work history|career|professional)/i,
        skills: /^(skills|competencies|expertise|capabilities)/i,
        education: /^(education|qualifications|academic)/i,
        certifications: /^(certif|licen|credentials)/i,
    }

    let currentSection = 'unknown'
    let currentExp = null
    let summaryLines = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lower = line.toLowerCase()

        // Detect section heading
        if (HEADINGS.summary.test(lower) && line.length < 50) { currentSection = 'summary'; continue }
        if (HEADINGS.experience.test(lower) && line.length < 50) { currentSection = 'experience'; continue }
        if (HEADINGS.skills.test(lower) && line.length < 50) { currentSection = 'skills'; continue }
        if (HEADINGS.education.test(lower) && line.length < 50) { currentSection = 'education'; continue }
        if (HEADINGS.certifications.test(lower) && line.length < 50) { currentSection = 'certifications'; continue }

        // Skip obvious decorative lines
        if (/^[─═\-_=]+$/.test(line)) continue

        if (currentSection === 'summary') {
            summaryLines.push(line)
        }

        if (currentSection === 'experience') {
            // Bullet detection
            if (/^[•·▸\-–—►\*]/.test(line) || /^\d+\./.test(line)) {
                const text = line.replace(/^[•·▸\-–—►\*]\s*/, '').replace(/^\d+\.\s*/, '').trim()
                if (currentExp && text) {
                    currentExp.achievements.push({ id: uuidv4(), text, metrics: '', tags: [] })
                }
            } else if (line.length > 20 && !line.startsWith('(') && !line.match(/^\d{4}/)) {
                // Likely a role/company line
                if (currentExp) result.experiences.push(currentExp)
                currentExp = {
                    id: uuidv4(),
                    role: line,
                    company: '',
                    period: '',
                    location: '',
                    achievements: [],
                }
            } else if (currentExp && line.match(/^\d{4}|present|current/i)) {
                currentExp.period = line
            }
        }

        if (currentSection === 'skills') {
            const parts = line.split(/[,·|•]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 60)
            // Simple categorisation heuristic
            parts.forEach(skill => {
                const sl = skill.toLowerCase()
                if (/govern|compli|risk|audit|itil|budget|program|portfolio|policy/.test(sl)) {
                    result.skills.governance.push(skill)
                } else if (/lead|manage|direct|stakeholder|negotiat|present|mentor|coach/.test(sl)) {
                    result.skills.leadership.push(skill)
                } else {
                    result.skills.technical.push(skill)
                }
            })
        }

        if (currentSection === 'education') {
            if (line.length > 5) {
                const lastEdu = result.education[result.education.length - 1]
                if (!lastEdu || lastEdu.institution) {
                    result.education.push({ id: uuidv4(), degree: line, field: '', institution: '', year: '' })
                } else if (!lastEdu.institution) {
                    lastEdu.institution = line
                }
            }
        }

        if (currentSection === 'certifications') {
            if (line.length > 3) {
                const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/)
                result.certifications.push({
                    id: uuidv4(),
                    name: line.replace(/\b(20\d{2}|19\d{2})\b/, '').trim(),
                    year: yearMatch ? yearMatch[0] : '',
                    issuer: '',
                })
            }
        }
    }

    if (currentExp) result.experiences.push(currentExp)
    result.summary = summaryLines.join(' ').trim()

    // De-duplicate skills
    result.skills.technical = [...new Set(result.skills.technical)].slice(0, 20)
    result.skills.governance = [...new Set(result.skills.governance)].slice(0, 15)
    result.skills.leadership = [...new Set(result.skills.leadership)].slice(0, 15)

    return result
}

// ── Parsed Preview ────────────────────────────────────────────────────────────
function ParsedSection({ title, count, children, defaultOpen }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="border border-navy-600 rounded-xl overflow-hidden mb-3">
            <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-navy-800 cursor-pointer hover:bg-navy-700 transition-colors">
                <div className="flex items-center gap-2">
                    <span className="text-slate-200 text-sm font-medium">{title}</span>
                    <span className="text-xs text-slate-500 bg-navy-700 px-1.5 py-0.5 rounded">{count}</span>
                </div>
                {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
            </button>
            {open && <div className="p-4 bg-navy-900">{children}</div>}
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ContentLab() {
    const { career, updateProfile, updateCareer, aiConfig } = useCareerStore()
    const [rawText, setRawText] = useState('')
    const [parsed, setParsed] = useState(null)
    const [parsing, setParsing] = useState(false)
    const [parseError, setParseError] = useState('')
    const [applyMode, setApplyMode] = useState(null) // null | 'replace' | 'merge' | 'new-version'
    const [applied, setApplied] = useState(false)
    const textRef = useRef(null)

    const handleParse = async () => {
        if (!rawText.trim()) return
        setParsing(true)
        setParseError('')
        setParsed(null)

        try {
            if (aiConfig?.apiKey) {
                const result = await aiParseCV(rawText, aiConfig)
                setParsed(result)
            } else {
                const result = parseCV(rawText)
                setParsed(result)
            }
        } catch (err) {
            console.error(err)
            try {
                // Fallback
                const result = parseCV(rawText)
                setParsed(result)
                setParseError("AI parser failed. Used basic keyword parser.")
            } catch (fallbackErr) {
                setParseError("Parsing failed completely.")
            }
        } finally {
            setParsing(false)
        }
    }

    const handleApply = (mode) => {
        if (!parsed) return
        if (mode === 'replace') {
            const updates = {}
            if (parsed.summary) updates.summary = parsed.summary
            if (parsed.experiences.length > 0) updates.experiences = parsed.experiences
            if (parsed.certifications.length > 0) updates.certifications = parsed.certifications
            if (parsed.education.length > 0) updates.education = parsed.education
            if (parsed.skills.technical.length + parsed.skills.governance.length + parsed.skills.leadership.length > 0) {
                updates.skills = parsed.skills
            }
            updateCareer(updates)
        }
        if (mode === 'merge') {
            const updates = {}
            if (parsed.summary && !career.summary?.trim()) updates.summary = parsed.summary
            if (parsed.experiences.length > 0) {
                updates.experiences = [...career.experiences, ...parsed.experiences]
            }
            if (parsed.certifications.length > 0) {
                updates.certifications = [...career.certifications, ...parsed.certifications]
            }
            if (parsed.education.length > 0) {
                updates.education = [...career.education, ...parsed.education]
            }
            if (parsed.skills.technical.length > 0) {
                updates.skills = {
                    technical: [...new Set([...(career.skills.technical || []), ...parsed.skills.technical])],
                    governance: [...new Set([...(career.skills.governance || []), ...parsed.skills.governance])],
                    leadership: [...new Set([...(career.skills.leadership || []), ...parsed.skills.leadership])],
                }
            }
            updateCareer(updates)
        }
        setApplyMode(mode)
        setApplied(true)
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-navy-700">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-gold-500/15 rounded-lg flex items-center justify-center border border-gold-500/30">
                        <Edit3 size={16} className="text-gold-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-100">Content Lab</h1>
                </div>
                <p className="text-slate-400 text-sm ml-11">Paste any CV text — full document, summary, or bullet points. Parse, preview, then choose how to apply.</p>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: Input */}
                <div className="w-96 flex-shrink-0 border-r border-navy-700 flex flex-col">
                    <div className="p-5 flex-1 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <ClipboardPaste size={14} className="text-gold-400" />
                            <p className="text-slate-300 text-sm font-medium">Paste CV Content</p>
                        </div>
                        <textarea
                            ref={textRef}
                            className="input flex-1 min-h-[280px] text-xs font-mono resize-none leading-relaxed"
                            placeholder={"Paste any CV content here:\n\n• Full CV text\n• Just the summary paragraph\n• A set of bullet points\n• An executive bio\n• Achievements from another role\n\nThe parser will extract what it can find."}
                            value={rawText}
                            onChange={e => setRawText(e.target.value)}
                        />
                        <div className="space-y-2">
                            {parseError && (
                                <p className="text-[10px] text-amber-500 mb-1">{parseError}</p>
                            )}
                            <button
                                onClick={handleParse}
                                disabled={!rawText.trim() || parsing}
                                className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {parsing ? <><Loader size={14} className="animate-spin" /> {aiConfig?.apiKey ? 'AI Parsing…' : 'Parsing…'}</> : <><Split size={14} /> Parse Content</>}
                            </button>
                            <button onClick={() => { setRawText(''); setParsed(null); setApplied(false); setApplyMode(null); setParseError('') }} className="btn-secondary w-full text-sm">
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Parsed result */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!parsed && !parsing && (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                            <ClipboardPaste size={28} className="text-slate-700" />
                            <p className="text-slate-500 text-sm">Parsed content will appear here</p>
                            <p className="text-slate-700 text-xs max-w-xs">The parser extracts summary, experience bullets, skills, education, and certifications. You then choose what to keep.</p>
                        </div>
                    )}

                    {parsed && (
                        <div className="max-w-2xl">
                            <div className="mb-5 flex items-center justify-between">
                                <p className="text-slate-300 font-medium">Parsed Preview</p>
                                {!applied && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>Not applied yet</span>
                                    </div>
                                )}
                                {applied && (
                                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                                        <CheckCircle size={12} />
                                        <span>Applied ({applyMode})</span>
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            {parsed.summary && (
                                <ParsedSection title="Executive Summary" count="1 paragraph" defaultOpen>
                                    <p className="text-slate-300 text-xs leading-relaxed">{parsed.summary}</p>
                                </ParsedSection>
                            )}

                            {/* Experiences */}
                            {parsed.experiences.length > 0 && (
                                <ParsedSection title="Experiences" count={`${parsed.experiences.length} roles`} defaultOpen>
                                    {parsed.experiences.map((exp, i) => (
                                        <div key={i} className="mb-4 last:mb-0">
                                            <p className="text-slate-200 text-sm font-semibold">{exp.role}</p>
                                            {exp.period && <p className="text-slate-500 text-xs">{exp.period}</p>}
                                            <ul className="mt-2 space-y-1">
                                                {exp.achievements.map((a, j) => (
                                                    <li key={j} className="text-slate-400 text-xs flex gap-2">
                                                        <span className="text-gold-400/60 flex-shrink-0">–</span>
                                                        {a.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </ParsedSection>
                            )}

                            {/* Skills */}
                            {(parsed.skills.technical.length + parsed.skills.governance.length + parsed.skills.leadership.length > 0) && (
                                <ParsedSection title="Skills" count={`${parsed.skills.technical.length + parsed.skills.governance.length + parsed.skills.leadership.length} items`} defaultOpen>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: 'Technical', items: parsed.skills.technical },
                                            { label: 'Governance', items: parsed.skills.governance },
                                            { label: 'Leadership', items: parsed.skills.leadership },
                                        ].map(({ label, items }) => items.length > 0 && (
                                            <div key={label}>
                                                <p className="text-gold-400/70 text-xs uppercase tracking-wider mb-2">{label}</p>
                                                {items.map((s, i) => <p key={i} className="text-slate-400 text-xs">{s}</p>)}
                                            </div>
                                        ))}
                                    </div>
                                </ParsedSection>
                            )}

                            {/* Education */}
                            {parsed.education.length > 0 && (
                                <ParsedSection title="Education" count={`${parsed.education.length} records`} defaultOpen={false}>
                                    {parsed.education.map((edu, i) => (
                                        <div key={i} className="mb-2">
                                            <p className="text-slate-200 text-sm">{edu.degree}</p>
                                            {edu.institution && <p className="text-slate-500 text-xs">{edu.institution}</p>}
                                        </div>
                                    ))}
                                </ParsedSection>
                            )}

                            {/* Certifications */}
                            {parsed.certifications.length > 0 && (
                                <ParsedSection title="Certifications" count={`${parsed.certifications.length}`} defaultOpen={false}>
                                    <div className="flex flex-wrap gap-2">
                                        {parsed.certifications.map((cert, i) => (
                                            <span key={i} className="text-xs text-slate-300 border border-navy-600 px-2 py-1 rounded">{cert.name}</span>
                                        ))}
                                    </div>
                                </ParsedSection>
                            )}

                            {/* Apply Actions */}
                            {!applied && (
                                <div className="mt-6 border border-navy-600 rounded-xl overflow-hidden">
                                    <div className="p-4 bg-navy-800">
                                        <p className="text-slate-200 text-sm font-medium mb-1">Apply to Career DB</p>
                                        <p className="text-slate-500 text-xs">Choose how to apply — nothing is changed until you confirm.</p>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-navy-700 border-t border-navy-700">
                                        <button
                                            onClick={() => handleApply('replace')}
                                            className="flex flex-col items-center gap-1 p-4 hover:bg-navy-700 cursor-pointer transition-colors"
                                        >
                                            <span className="text-sm font-semibold text-rose-400">Replace</span>
                                            <span className="text-xs text-slate-600 text-center">Overwrites matching sections with parsed content</span>
                                        </button>
                                        <button
                                            onClick={() => handleApply('merge')}
                                            className="flex flex-col items-center gap-1 p-4 hover:bg-navy-700 cursor-pointer transition-colors"
                                        >
                                            <span className="text-sm font-semibold text-emerald-400">Merge</span>
                                            <span className="text-xs text-slate-600 text-center">Adds parsed content alongside existing data</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {applied && (
                                <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <p className="text-emerald-400 text-sm font-medium mb-1">✓ Applied successfully</p>
                                    <p className="text-slate-500 text-xs">Go to <strong className="text-slate-400">Career Intelligence</strong> to review and edit what was imported. You can always undo by resetting or importing a backup.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
