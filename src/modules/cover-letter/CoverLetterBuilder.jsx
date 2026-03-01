import { useState, useCallback } from 'react'
import { Bot, RefreshCw, AlertCircle, Target, Building2, Briefcase, FileSignature, CheckCircle, Download, LayoutTemplate, Pen } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import useCareerStore from '../../store/careerStore'
import { aiGenerateCoverLetter } from './aiGenerateCoverLetter'
import CoverLetterPDF from '../../templates/pdf/CoverLetterPDF'
import FloatingAIChat from '../ai-assistant/FloatingAIChat'

/* ─── Default template builder ──────────────────────────────── */
function buildDefaultCoverLetter(career, targetRole, targetCompany, jdContext) {
    const name = career?.profile?.name || 'Your Name'
    const title = career?.profile?.title || 'Professional'
    const location = career?.profile?.location || ''

    const experienceYears = career?.experiences?.length > 0
        ? Math.max(...career.experiences.map(e => {
            const match = (e.period || '').match(/\d{4}/)
            return match ? new Date().getFullYear() - parseInt(match[0]) : 0
        }))
        : 5

    const topSkills = [
        ...(career?.skills?.technical || []).slice(0, 3),
        ...(career?.skills?.governance || []).slice(0, 2),
        ...(career?.skills?.leadership || []).slice(0, 2),
    ].slice(0, 5).join(', ') || 'strategic planning, operational leadership'

    const latestRole = career?.experiences?.[0]?.role || title
    const latestCompany = career?.experiences?.[0]?.company || 'my current organization'
    const topAchievement = career?.experiences?.[0]?.achievements?.[0]?.text || 'delivering measurable results aligned with organizational objectives'

    const company = targetCompany || '[Company Name]'
    const role = targetRole || '[Target Role]'

    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${role} position at ${company}. With over ${experienceYears} years of progressive experience in ${topSkills}, I am confident in my ability to contribute meaningfully to your organization's strategic objectives.

In my most recent role as ${latestRole} at ${latestCompany}, I have demonstrated consistent success in ${topAchievement.toLowerCase().startsWith('led') || topAchievement.toLowerCase().startsWith('managed') ? topAchievement.charAt(0).toLowerCase() + topAchievement.slice(1) : topAchievement}. This experience has equipped me with a comprehensive understanding of the challenges and opportunities that define high-impact leadership in this domain.

${jdContext ? `Having reviewed the requirements for this position, I am particularly drawn to the emphasis on ${jdContext.split('.')[0].toLowerCase().trim() || 'the role\'s strategic scope'}. My background aligns closely with these priorities, and I am eager to bring my expertise to ${company}.` : `My track record of aligning technology strategy with business objectives, combined with my commitment to operational excellence, positions me as a strong candidate for this role at ${company}.`}

I would welcome the opportunity to discuss how my experience and vision can support ${company}'s continued growth and success. I am available for an interview at your earliest convenience${location ? ` and am based in ${location}` : ''}.

Thank you for considering my application. I look forward to the possibility of contributing to your team.`
}

/* ─── Cover Letter Formats ──────────────────────────────────── */
const COVER_FORMATS = [
    { id: 'executive', label: 'Executive', sub: 'Minimal header, dark border' },
    { id: 'modern', label: 'Modern', sub: 'Accent color header band' },
    { id: 'classic', label: 'Classic', sub: 'Centered header, traditional' },
]

/* ─── Component ─────────────────────────────────────────────── */
export default function CoverLetterBuilder() {
    const { career, coverLetter, updateCoverLetter, aiConfig, accentColor } = useCareerStore()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const [coverFormat, setCoverFormat] = useState('executive')

    const { targetCompany, targetRole, jdContext, generatedText } = coverLetter

    /* ── Generate default template letter ───────────────────── */
    const handleUseTemplate = useCallback(() => {
        const text = buildDefaultCoverLetter(career, targetRole, targetCompany, jdContext)
        updateCoverLetter({ generatedText: text })
        setSuccess('Default cover letter generated from your CV data.')
        setTimeout(() => setSuccess(''), 3000)
    }, [career, targetRole, targetCompany, jdContext, updateCoverLetter])

    /* ── AI-powered generation ──────────────────────────────── */
    const handleGenerate = async () => {
        if (!targetRole || !targetCompany) {
            setError('Please provide at least a Target Role and Company.')
            setTimeout(() => setError(''), 3000)
            return
        }

        if (!aiConfig?.apiKey) {
            setError('AI API Key is required in Settings. Use "Generate from Template" instead.')
            setTimeout(() => setError(''), 4000)
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const text = await aiGenerateCoverLetter(career, coverLetter, aiConfig)
            updateCoverLetter({ generatedText: text })
            setSuccess('AI cover letter generated successfully!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to generate cover letter.')
        } finally {
            setLoading(false)
        }
    }

    /* ── PDF Download ───────────────────────────────────────── */
    const handleDownloadPDF = async () => {
        if (!generatedText) {
            setError('No cover letter content to download.')
            setTimeout(() => setError(''), 3000)
            return
        }

        setIsGeneratingPDF(true)
        setError('')

        try {
            const doc = (
                <CoverLetterPDF
                    career={career}
                    targetCompany={targetCompany || 'Company'}
                    generatedText={generatedText}
                    accentColor={accentColor || '#C9A84C'}
                    format={coverFormat}
                />
            )
            const blob = await pdf(doc).toBlob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${(career.profile?.name || 'Cover_Letter').replace(/\s+/g, '_')}_${(targetCompany || 'Company').replace(/\s+/g, '_')}_Cover_Letter.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setTimeout(() => URL.revokeObjectURL(url), 1000)
        } catch (err) {
            console.error('PDF generation failed:', err)
            setError('PDF generation failed. Try refreshing and downloading again.')
            setTimeout(() => setError(''), 4000)
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    return (
        <div className="flex flex-col h-full min-h-screen">
            <div className="px-8 pt-8 pb-4 border-b border-navy-700">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-gold-500/15 rounded-lg flex items-center justify-center border border-gold-500/30">
                        <FileSignature size={16} className="text-gold-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-100">Cover Letter Builder</h1>
                </div>
                <p className="text-slate-400 text-sm ml-11">
                    Generate a tailored cover letter from your CV data — with or without AI.
                </p>
            </div>

            <div className="flex flex-1 gap-0 overflow-hidden">
                {/* Left — Config */}
                <div className="w-[40%] p-6 border-r border-navy-700 flex flex-col overflow-y-auto">
                    <div className="space-y-5">
                        <div className="card space-y-4">
                            <div>
                                <label className="label mb-2 flex items-center gap-2">
                                    <Briefcase size={12} className="text-slate-400" />
                                    Target Role
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., Senior IT Manager"
                                    value={targetRole || ''}
                                    onChange={(e) => updateCoverLetter({ targetRole: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label mb-2 flex items-center gap-2">
                                    <Building2 size={12} className="text-slate-400" />
                                    Target Company
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., Safaricom PLC"
                                    value={targetCompany || ''}
                                    onChange={(e) => updateCoverLetter({ targetCompany: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label mb-2">Job Description Context (Optional)</label>
                                <textarea
                                    className="textarea w-full min-h-[120px] text-sm"
                                    placeholder="Paste the key requirements or full JD here for a highly tailored letter..."
                                    value={jdContext || ''}
                                    onChange={(e) => updateCoverLetter({ jdContext: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Cover Letter Format */}
                        <div>
                            <label className="label mb-2 flex items-center gap-2">
                                <LayoutTemplate size={12} className="text-slate-400" />
                                PDF Format
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {COVER_FORMATS.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setCoverFormat(f.id)}
                                        className={`py-2 px-2 text-xs rounded-lg transition-all cursor-pointer border text-center
                                            ${coverFormat === f.id
                                                ? 'bg-gold-500 text-navy-900 border-gold-500 font-semibold'
                                                : 'bg-navy-800 text-slate-400 border-navy-600 hover:text-slate-200 hover:border-navy-500'}`}
                                    >
                                        <p className="font-semibold">{f.label}</p>
                                        <p className={`text-[10px] mt-0.5 ${coverFormat === f.id ? 'text-navy-700' : 'text-slate-500'}`}>{f.sub}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleUseTemplate}
                                className="flex items-center justify-center gap-2 py-2.5 bg-navy-700 hover:bg-navy-600 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-navy-600"
                            >
                                <Pen size={14} />
                                Generate from Template (No API)
                            </button>

                            <button
                                onClick={handleGenerate}
                                disabled={loading || !targetRole || !targetCompany}
                                className="btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <><RefreshCw size={14} className="animate-spin" /> Generating...</> : <><Bot size={14} /> Generate with AI</>}
                            </button>

                            {error && (
                                <span className="text-xs text-danger flex items-center justify-center gap-1.5 bg-danger/10 py-2 rounded">
                                    <AlertCircle size={12} /> {error}
                                </span>
                            )}
                            {success && (
                                <span className="text-xs text-success flex items-center justify-center gap-1.5 bg-success/10 py-2 rounded">
                                    <CheckCircle size={12} /> {success}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — Preview */}
                <div className="flex-1 bg-slate-100 overflow-y-auto relative">
                    {!generatedText ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
                            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-slate-200">
                                <FileSignature size={24} className="text-slate-400" />
                            </div>
                            <p className="text-slate-600 text-sm font-medium">Your Cover Letter will appear here</p>
                            <p className="text-slate-500 text-xs mt-1">Fill out the details and click one of the generate buttons.</p>
                            <p className="text-slate-400 text-xs mt-3 max-w-sm">
                                <strong>Tip:</strong> Use "Generate from Template" for a quick draft without needing an API key, or use "Generate with AI" for a tailored letter.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto my-12 bg-white shadow-xl shadow-slate-200/50 p-16 font-sans text-slate-800">
                            {/* Header matching roughly corporate branded style */}
                            <div className="border-b-2 border-slate-800 pb-6 mb-8">
                                <h1 className="text-3xl font-bold tracking-tight mb-1 uppercase">{career.profile?.name}</h1>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{career.profile?.title}</p>
                                <div className="mt-4 flex gap-4 text-xs text-slate-500">
                                    {career.profile?.email && <span>{career.profile.email}</span>}
                                    {career.profile?.phone && <span>{career.profile.phone}</span>}
                                    {career.profile?.location && <span>{career.profile.location}</span>}
                                </div>
                            </div>

                            {/* Date & Target */}
                            <div className="mb-8 text-sm flex justify-between items-start">
                                <div>
                                    <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <div className="mt-4 font-semibold">
                                        <p>Hiring Manager</p>
                                        <p>{targetCompany || 'Company'}</p>
                                    </div>
                                </div>
                                <div className="print-hidden flex gap-2">
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isGeneratingPDF}
                                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-gold-500 px-3 py-1.5 rounded text-xs font-semibold shadow-sm border border-gold-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {isGeneratingPDF ? (
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                                                Preparing...
                                            </span>
                                        ) : (
                                            <><Download size={13} /> Download PDF</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <textarea
                                className="w-full min-h-[400px] text-sm leading-relaxed text-slate-700 bg-transparent border-none outline-none resize-none"
                                value={generatedText}
                                onChange={(e) => updateCoverLetter({ generatedText: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Embedded AI Chat for live edits */}
            {generatedText && <FloatingAIChat mode="cover-letter" />}
        </div>
    )
}
