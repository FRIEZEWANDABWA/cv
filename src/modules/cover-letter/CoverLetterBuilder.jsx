import { useState } from 'react'
import { Bot, RefreshCw, AlertCircle, Target, Building2, Briefcase, FileSignature, CheckCircle, Download } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import useCareerStore from '../../store/careerStore'
import { aiGenerateCoverLetter } from './aiGenerateCoverLetter'
import CoverLetterPDF from '../../templates/pdf/CoverLetterPDF'
import FloatingAIChat from '../ai-assistant/FloatingAIChat'

export default function CoverLetterBuilder() {
    const { career, coverLetter, updateCoverLetter, aiConfig } = useCareerStore()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            const blob = await pdf(<CoverLetterPDF career={career} targetCompany={targetCompany || 'Company'} generatedText={generatedText} accentColor={career.accentColor} />).toBlob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${(career.profile?.name || 'Cover_Letter').replace(/\s+/g, '_')}_${(targetCompany || 'Company').replace(/\s+/g, '_')}.pdf`
            link.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Failed to generate PDF', err)
            setError('Failed to generate PDF document.')
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const handleGenerate = async () => {
        if (!coverLetter.targetRole || !coverLetter.targetCompany) {
            setError('Please provide at least a Target Role and Company.')
            setTimeout(() => setError(''), 3000)
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const generatedText = await aiGenerateCoverLetter(career, coverLetter, aiConfig)
            updateCoverLetter({ generatedText })
            setSuccess('Cover letter generated successfully!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to generate cover letter.')
        } finally {
            setLoading(false)
        }
    }

    const { targetCompany, targetRole, jdContext, generatedText } = coverLetter

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
                    Generate an AI-tailored cover letter based on your CV data and target job description.
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
                                    className="textarea w-full min-h-[160px] text-sm"
                                    placeholder="Paste the key requirements or full JD here for a highly tailored letter..."
                                    value={jdContext || ''}
                                    onChange={(e) => updateCoverLetter({ jdContext: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !targetRole || !targetCompany}
                                className="btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <><RefreshCw size={16} className="animate-spin" /> Generating...</> : <><Bot size={16} /> Generate Letter</>}
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
                            <p className="text-slate-500 text-xs mt-1">Fill out the target details and click generate.</p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto my-12 bg-white shadow-xl shadow-slate-200/50 p-16 font-sans text-slate-800">
                            {/* Header matching roughly corporate branded style */}
                            <div className="border-b-2 border-slate-800 pb-6 mb-8">
                                <h1 className="text-3xl font-bold tracking-tight mb-1 uppercase">{career.profile.name}</h1>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{career.profile.title}</p>
                                <div className="mt-4 flex gap-4 text-xs text-slate-500">
                                    {career.profile.email && <span>{career.profile.email}</span>}
                                    {career.profile.phone && <span>{career.profile.phone}</span>}
                                    {career.profile.location && <span>{career.profile.location}</span>}
                                </div>
                            </div>

                            {/* Editable Date & Target */}
                            <div className="mb-8 text-sm flex justify-between items-start">
                                <div>
                                    <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <div className="mt-4 font-semibold">
                                        <p>Hiring Manager</p>
                                        <p>{targetCompany}</p>
                                    </div>
                                </div>
                                <div className="print-hidden">
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isGeneratingPDF}
                                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-gold-500 px-3 py-1.5 rounded text-xs font-semibold shadow-sm border border-gold-500/30 transition-colors disabled:opacity-50"
                                    >
                                        {isGeneratingPDF ? 'Preparing...' : <><Download size={13} /> Download PDF</>}
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
