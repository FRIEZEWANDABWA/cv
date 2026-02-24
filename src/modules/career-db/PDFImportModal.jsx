import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, RefreshCw, Wand2 } from 'lucide-react'
import { extractTextFromPDF } from '../../utils/pdfExtractor'
import { parseCVText } from '../../utils/cvParser'
import useCareerStore from '../../store/careerStore'

const STEPS = {
    idle: 'idle',
    extracting: 'extracting',
    parsing: 'parsing',
    review: 'review',
    done: 'done',
    error: 'error',
}

function ImportStep({ num, label, active, done }) {
    return (
        <div className={`flex items-center gap-2.5 ${active ? 'text-gold-400' : done ? 'text-success' : 'text-slate-600'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
        ${active ? 'border-gold-500 bg-gold-500/20' : done ? 'border-success bg-success/20' : 'border-navy-600 bg-navy-800'}`}>
                {done ? '✓' : num}
            </div>
            <span className="text-sm">{label}</span>
        </div>
    )
}

export default function PDFImportModal({ onClose }) {
    const [step, setStep] = useState(STEPS.idle)
    const [fileName, setFileName] = useState('')
    const [rawText, setRawText] = useState('')
    const [parsed, setParsed] = useState(null)
    const [error, setError] = useState('')
    const [overwrite, setOverwrite] = useState(false)
    const fileRef = useRef()
    const { importCareer, career } = useCareerStore()

    const handleFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.type !== 'application/pdf') {
            setError('Please select a PDF file.')
            setStep(STEPS.error)
            return
        }
        setFileName(file.name)
        setError('')

        // Step 1: Extract
        setStep(STEPS.extracting)
        let text = ''
        try {
            text = await extractTextFromPDF(file)
            if (!text.trim()) {
                setError('No readable text found in this PDF. It may be a scanned image or a locked file. Try copying the text from your PDF and pasting below instead.')
                setStep(STEPS.error)
                return
            }
            setRawText(text)
        } catch (err) {
            setError(`PDF extraction failed: ${err.message}`)
            setStep(STEPS.error)
            return
        }

        // Step 2: Parse
        setStep(STEPS.parsing)
        try {
            await new Promise((r) => setTimeout(r, 400)) // brief UX pause
            const result = parseCVText(text)
            setParsed(result)
            setStep(STEPS.review)
        } catch (err) {
            setError(`Parsing failed: ${err.message}`)
            setStep(STEPS.error)
        }
    }

    const handleImport = () => {
        if (!parsed) return
        // Merge or overwrite — keep existing data if not overwriting
        const toImport = overwrite ? parsed : mergeWithExisting(career, parsed)
        importCareer(toImport)
        setStep(STEPS.done)
        setTimeout(onClose, 1800)
    }

    const stats = parsed ? {
        experiences: parsed.experiences.length,
        achievements: parsed.experiences.reduce((n, e) => n + e.achievements.length, 0),
        skills: parsed.skills.technical.length + parsed.skills.governance.length + parsed.skills.leadership.length,
        education: parsed.education.length,
        certs: parsed.certifications.length,
    } : null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-navy-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold-500/15 rounded-lg flex items-center justify-center border border-gold-500/30">
                            <Upload size={15} className="text-gold-500" />
                        </div>
                        <div>
                            <h2 className="text-slate-100 font-semibold text-base">Import CV from PDF</h2>
                            <p className="text-slate-500 text-xs">Auto-extract your career data into the database</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    {/* Progress Steps */}
                    <div className="flex gap-0 mb-6">
                        <div className="flex flex-col gap-2 flex-1">
                            <ImportStep num={1} label="Select PDF" active={step === STEPS.idle} done={step !== STEPS.idle && step !== STEPS.error} />
                            <ImportStep num={2} label="Extract Text" active={step === STEPS.extracting} done={['parsing', 'review', 'done'].includes(step)} />
                            <ImportStep num={3} label="Parse Career Data" active={step === STEPS.parsing} done={['review', 'done'].includes(step)} />
                            <ImportStep num={4} label="Review & Import" active={step === STEPS.review} done={step === STEPS.done} />
                        </div>
                    </div>

                    {/* Content by step */}
                    {step === STEPS.idle && (
                        <div>
                            <div
                                className="border-2 border-dashed border-navy-600 hover:border-gold-500/50 rounded-xl p-10 text-center cursor-pointer transition-colors group"
                                onClick={() => fileRef.current?.click()}
                            >
                                <FileText size={36} className="text-slate-600 group-hover:text-gold-500 mx-auto mb-3 transition-colors" />
                                <p className="text-slate-300 font-medium text-sm mb-1">Drop your CV PDF here</p>
                                <p className="text-slate-500 text-xs">or click to browse</p>
                                <p className="text-slate-600 text-xs mt-3">Supports standard PDFs. Scanned images may not extract correctly.</p>
                            </div>
                            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />

                            {/* Texture tip for illustrator PDFs */}
                            <div className="mt-4 p-3 bg-gold-500/5 border border-gold-500/20 rounded-lg">
                                <p className="text-gold-400 text-xs font-medium mb-1">💡 Tip for Designer PDFs (Illustrator/InDesign)</p>
                                <p className="text-slate-400 text-xs">If your CV was designed in a layout tool, extraction works best when the PDF has embedded text. If it fails, use the text paste option below.</p>
                            </div>
                        </div>
                    )}

                    {(step === STEPS.extracting || step === STEPS.parsing) && (
                        <div className="flex flex-col items-center py-12 gap-4">
                            <Loader2 size={36} className="text-gold-500 animate-spin" />
                            <p className="text-slate-200 font-medium text-sm">
                                {step === STEPS.extracting ? `Extracting text from ${fileName}...` : 'Parsing career structure...'}
                            </p>
                            <p className="text-slate-500 text-xs">
                                {step === STEPS.extracting ? 'Reading all pages' : 'Detecting roles, achievements, skills & education'}
                            </p>
                        </div>
                    )}

                    {step === STEPS.error && (
                        <div>
                            <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/30 rounded-xl mb-5">
                                <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-danger text-sm font-medium mb-1">Extraction issue</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">{error}</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-3">Paste your CV text manually instead:</p>
                            <textarea
                                className="textarea w-full h-40 text-xs"
                                placeholder="Paste the text content of your CV here..."
                                onChange={(e) => {
                                    if (e.target.value.trim().length > 50) {
                                        setRawText(e.target.value)
                                        setStep(STEPS.parsing)
                                        setTimeout(() => {
                                            const result = parseCVText(e.target.value)
                                            setParsed(result)
                                            setStep(STEPS.review)
                                        }, 500)
                                    }
                                }}
                            />
                            <button onClick={() => { setStep(STEPS.idle); setError('') }} className="btn-ghost mt-3 flex items-center gap-1.5 text-sm">
                                <RefreshCw size={13} /> Try another file
                            </button>
                        </div>
                    )}

                    {step === STEPS.review && parsed && (
                        <div className="space-y-4">
                            {/* What was found */}
                            <div className="p-4 bg-success/8 border border-success/25 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle size={15} className="text-success" />
                                    <p className="text-slate-200 text-sm font-medium">Extraction complete</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        ['Name', parsed.profile.name || '—'],
                                        ['Email', parsed.profile.email || '—'],
                                        ['Phone', parsed.profile.phone || '—'],
                                        ['Roles found', stats.experiences],
                                        ['Achievements', stats.achievements],
                                        ['Skills detected', stats.skills],
                                        ['Education', stats.education],
                                        ['Certifications', stats.certs],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex justify-between">
                                            <span className="text-slate-500 text-xs">{label}</span>
                                            <span className="text-slate-200 text-xs font-medium">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary preview */}
                            {parsed.summary && (
                                <div className="card">
                                    <p className="label mb-2">Extracted Summary</p>
                                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-4">{parsed.summary}</p>
                                </div>
                            )}

                            {/* Overwrite option */}
                            {career.experiences.length > 0 && (
                                <div className="flex items-start gap-3 p-3 bg-warning/8 border border-warning/25 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="overwrite"
                                        checked={overwrite}
                                        onChange={(e) => setOverwrite(e.target.checked)}
                                        className="mt-0.5 cursor-pointer"
                                    />
                                    <label htmlFor="overwrite" className="text-xs text-slate-300 cursor-pointer leading-relaxed">
                                        <span className="text-warning font-medium">Replace existing data</span> — your current Career DB will be cleared.
                                        Uncheck to merge (add to existing).
                                    </label>
                                </div>
                            )}

                            <div className="flex items-center gap-2 p-3 bg-navy-800 border border-navy-600 rounded-lg">
                                <Wand2 size={13} className="text-gold-500 flex-shrink-0" />
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    After import, review each tab in Career Intelligence — the parser does its best but you should verify job titles, dates, and achievement text.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === STEPS.done && (
                        <div className="flex flex-col items-center py-12 gap-3">
                            <CheckCircle size={40} className="text-success" />
                            <p className="text-slate-100 font-semibold text-base">Career data imported!</p>
                            <p className="text-slate-400 text-sm">Closing and loading your Career Intelligence DB...</p>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                {step === STEPS.review && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-700 bg-navy-950">
                        <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
                        <button onClick={handleImport} className="btn-primary flex items-center gap-2 text-sm">
                            <Upload size={14} /> Import to Career DB
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function mergeWithExisting(existing, imported) {
    return {
        ...imported,
        profile: imported.profile.name ? imported.profile : existing.profile,
        summary: imported.summary || existing.summary,
        experiences: [...existing.experiences, ...imported.experiences],
        education: [...existing.education, ...imported.education],
        certifications: [...existing.certifications, ...imported.certifications],
        skills: {
            technical: [...new Set([...existing.skills.technical, ...imported.skills.technical])],
            governance: [...new Set([...existing.skills.governance, ...imported.skills.governance])],
            leadership: [...new Set([...existing.skills.leadership, ...imported.skills.leadership])],
        },
    }
}
