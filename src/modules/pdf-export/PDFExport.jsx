import { useState, Suspense } from 'react'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { FileText, Download, Eye, EyeOff, CheckCircle, AlertTriangle, XCircle, Layers } from 'lucide-react'
import useCareerStore from '../../store/careerStore'
import { computeATSScore, applyPositioning } from '../cv-designer/cvUtils'
import ExecutiveMinimalPDF from '../../templates/pdf/ExecutiveMinimalPDF'
import CorporateBrandedPDF from '../../templates/pdf/CorporateBrandedPDF'

const CHECKLIST = [
    { id: 'name', label: 'Full name present', check: (c) => !!c.profile?.name?.trim() },
    { id: 'title', label: 'Professional title set', check: (c) => !!c.profile?.title?.trim() },
    { id: 'email', label: 'Email address included', check: (c) => !!c.profile?.email?.trim() },
    { id: 'phone', label: 'Phone number included', check: (c) => !!c.profile?.phone?.trim() },
    { id: 'summary', label: 'Executive summary written', check: (c) => (c.summary?.trim()?.length || 0) > 60 },
    { id: 'exp', label: '1 or more roles added', check: (c) => c.experiences?.filter(e => e.role).length >= 1 },
    { id: 'bullets', label: 'Achievements use action verbs', check: (c) => c.experiences?.some(e => e.achievements?.some(a => a.text?.trim())) },
    { id: 'skills', label: 'Minimum 5 skills listed', check: (c) => ((c.skills?.technical?.length || 0) + (c.skills?.governance?.length || 0) + (c.skills?.leadership?.length || 0)) >= 5 },
    { id: 'edu', label: 'Education record present', check: (c) => c.education?.filter(e => e.degree).length >= 1 },
    { id: 'metrics', label: 'At least 3 achievements have metrics', check: (c) => c.experiences?.flatMap(e => e.achievements || []).filter(a => a.metrics?.trim()).length >= 3 },
]

function ChecklistItem({ passed, label }) {
    return (
        <div className="flex items-center gap-2.5 py-1.5">
            {passed
                ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                : <XCircle size={14} className="text-rose-400/70 flex-shrink-0" />
            }
            <span className={`text-sm ${passed ? 'text-slate-300' : 'text-slate-500'}`}>{label}</span>
        </div>
    )
}

function ScoreBadge({ score }) {
    const color = score >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
        : score >= 60 ? 'text-gold-400 border-gold-500/30 bg-gold-500/5'
            : 'text-rose-400 border-rose-500/30 bg-rose-500/5'
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold ${color}`}>
            <span>{score}/100</span>
            <span className="font-normal text-xs opacity-70">ATS score</span>
        </div>
    )
}

export default function PDFExport() {
    const { career, activeTemplate, accentColor, fontPair, marginSize, lineSpacing } = useCareerStore()
    const [showPreview, setShowPreview] = useState(false)

    const { score: atsScore } = computeATSScore(career)
    const passedCount = CHECKLIST.filter((i) => i.check(career)).length
    const allPassed = passedCount === CHECKLIST.length
    const fileName = `${(career.profile?.name || 'CV').replace(/\s+/g, '_')}_CareerWeapon.pdf`

    const PDFDoc = activeTemplate === 'corporate-branded' ? CorporateBrandedPDF : ExecutiveMinimalPDF
    const docProps = { career, accentColor, fontPair, marginSize, lineSpacing }

    return (
        <div className="flex flex-col h-full">
            <div className="px-8 pt-8 pb-4 border-b border-navy-700">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-gold-500/15 rounded-lg flex items-center justify-center border border-gold-500/30">
                        <FileText size={16} className="text-gold-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-100">PDF Export</h1>
                </div>
                <p className="text-slate-400 text-sm ml-11">Board-ready output — selectable text, ATS-safe, embedded fonts.</p>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left panel — pre-flight */}
                <div className="w-80 flex-shrink-0 border-r border-navy-700 overflow-y-auto p-6 space-y-6">

                    {/* ATS Score */}
                    <div className="card">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">ATS Readiness</p>
                        <ScoreBadge score={atsScore} />
                        <div className="mt-3 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 60 ? 'bg-gold-500' : 'bg-rose-500'}`}
                                style={{ width: `${atsScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Export settings summary */}
                    <div className="card space-y-2">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Export Settings</p>
                        {[
                            { label: 'Template', val: activeTemplate === 'corporate-branded' ? 'Corporate Branded' : 'Executive Minimal' },
                            { label: 'Font', val: fontPair?.toUpperCase() || 'INTER' },
                            { label: 'Margins', val: marginSize || 'Normal' },
                            { label: 'Spacing', val: lineSpacing || 'Normal' },
                            { label: 'Accent', val: accentColor || '#C9A84C' },
                        ].map(({ label, val }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-slate-500 text-xs">{label}</span>
                                <span className="text-slate-300 text-xs font-medium">{val}</span>
                            </div>
                        ))}
                    </div>

                    {/* Checklist */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-slate-400 text-xs uppercase tracking-wider">Pre-flight Check</p>
                            <span className="text-xs text-slate-500">{passedCount}/{CHECKLIST.length}</span>
                        </div>
                        <div className="divide-y divide-navy-700">
                            {CHECKLIST.map((item) => (
                                <ChecklistItem key={item.id} passed={item.check(career)} label={item.label} />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        {!allPassed && (
                            <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-300/80 text-xs leading-relaxed">
                                    {CHECKLIST.length - passedCount} items incomplete. You can still export — complete items improve ATS performance.
                                </p>
                            </div>
                        )}

                        <Suspense fallback={
                            <div className="btn-primary w-full text-center opacity-60 cursor-wait">Preparing PDF…</div>
                        }>
                            <PDFDownloadLink
                                document={<PDFDoc {...docProps} />}
                                fileName={fileName}
                                className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                            >
                                {({ loading }) => loading
                                    ? <><span className="animate-spin">⊙</span> Generating…</>
                                    : <><Download size={14} /> Download PDF</>
                                }
                            </PDFDownloadLink>
                        </Suspense>

                        <button
                            onClick={() => setShowPreview((v) => !v)}
                            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                        >
                            {showPreview ? <><EyeOff size={14} /> Hide Preview</> : <><Eye size={14} /> Preview PDF</>}
                        </button>
                    </div>
                </div>

                {/* Right panel — PDF preview */}
                <div className="flex-1 overflow-hidden bg-navy-900">
                    {showPreview ? (
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full text-slate-500">Rendering preview…</div>
                        }>
                            <PDFViewer width="100%" height="100%" showToolbar={false} className="border-0">
                                <PDFDoc {...docProps} />
                            </PDFViewer>
                        </Suspense>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                            <div className="w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                                <Layers size={22} className="text-gold-500/70" />
                            </div>
                            <div>
                                <p className="text-slate-300 font-medium mb-1">PDF Preview</p>
                                <p className="text-slate-600 text-sm">Click "Preview PDF" to inspect your document<br />before downloading.</p>
                            </div>
                            <div className="text-xs text-slate-700 mt-2 space-y-1">
                                <p>· Text selectable · ATS-readable · Fonts embedded</p>
                                <p>· @react-pdf/renderer · A4 · &lt; 2MB target</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
