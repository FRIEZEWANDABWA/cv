import { useState } from 'react'
import { Palette, Eye, EyeOff, GripVertical, Monitor, Sliders, Printer, Zap, Plus, Trash2, Edit3, Type } from 'lucide-react'
import useCareerStore from '../../store/careerStore'
import { aiAutoTailorCV } from './aiTailorService'
import { ACCENT_COLORS, CV_FONTS } from '../../utils/constants'
import { computeATSScore, applyPositioning } from './cvUtils'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ExecutiveMinimal from '../../templates/ExecutiveMinimal'
import CorporateBranded from '../../templates/CorporateBranded'
import FloatingAIChat from '../ai-assistant/FloatingAIChat'

// SECTION_LABELS constant removed, now managed via careerStore

function SortableSectionRow({ id, label, visible, onToggle, onRename, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
    const [isEditing, setIsEditing] = useState(false)
    const [tempLabel, setTempLabel] = useState(label)

    const handleRename = () => {
        onRename(id, tempLabel)
        setIsEditing(false)
    }

    return (
        <div ref={setNodeRef} style={style}
            className={`flex flex-col gap-1 px-3 py-2 rounded-lg mb-2 border transition-colors
        ${visible ? 'bg-navy-700 border-navy-600' : 'bg-navy-800 border-navy-700 opacity-60'}`}
        >
            <div className="flex items-center gap-2">
                <div {...attributes} {...listeners} className="text-slate-600 hover:text-slate-400 cursor-grab">
                    <GripVertical size={14} />
                </div>
                {isEditing ? (
                    <input
                        autoFocus
                        value={tempLabel}
                        onChange={(e) => setTempLabel(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        className="flex-1 bg-navy-900 text-slate-100 text-xs px-2 py-1 rounded border border-gold-500/50 outline-none"
                    />
                ) : (
                    <span className={`flex-1 text-xs font-medium cursor-text ${visible ? 'text-slate-200' : 'text-slate-500'}`} onClick={() => setIsEditing(true)}>
                        {label || id}
                    </span>
                )}
                <div className="flex items-center gap-1.5">
                    <button onClick={() => onToggle(id)} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors p-1" title="Toggle Visibility">
                        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    {id.startsWith('custom_') && (
                        <button onClick={() => onDelete(id)} className="text-slate-500 hover:text-danger cursor-pointer transition-colors p-1" title="Delete Custom Section">
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

const DESIGN_MODES = [
    { id: 'executive-minimal', label: 'Executive Minimal', sub: 'Clean hierarchy, LaTeX-grade restraint', template: 'executive-minimal' },
    { id: 'global-executive', label: 'Global Executive', sub: 'Wider spacing, refined authority', template: 'executive-minimal' },
    { id: 'modern-infrastructure', label: 'Modern Infrastructure', sub: 'Sharp accents, compact density', template: 'executive-minimal' },
    { id: 'board-minimal', label: 'Board Minimal', sub: 'White header, maximum restraint', template: 'corporate-branded' },
    { id: 'corporate-branded', label: 'Corporate Branded', sub: 'Accent header, photo support', template: 'corporate-branded' },
]

const EDUCATION_PRIORITY = [
    { id: 'standard', label: 'Standard', sub: 'At bottom — proven through impact' },
    { id: 'mid', label: 'Executive Mid', sub: 'After summary — balanced emphasis' },
    { id: 'academic', label: 'Academic', sub: 'Top — qualifications-led roles' },
]

const SKILLS_LAYOUT_OPTIONS = [
    { id: 'columns3', label: '3 Columns Grid' },
    { id: 'columns2', label: '2 Columns Grid' },
    { id: 'compact', label: 'Compact Rows' },
    { id: 'badge', label: 'Modern Badges' },
    { id: 'inline', label: 'Inline Flow' },
]

const CERT_LAYOUT_OPTIONS = [
    { id: 'line', label: 'Inline (Default)' },
    { id: 'grid', label: '2-Column Grid' },
    { id: 'list', label: 'Compact List' },
]

export default function CVDesigner() {
    const {
        career, activeTemplate, accentColor, fontPair, marginSize, lineSpacing,
        designMode, setTemplate, setAccentColor, setFontPair, setMarginSize, setLineSpacing,
        setDesignMode, reorderSections, toggleSectionVisibility, updateCareer,
        jdText, aiConfig, applyAutoTailoredData, createVersion,
        updateSectionLabel, addCustomSection, deleteCustomSection,
        updateSkillLabel, addSkillItem, removeSkillItem, addAchievement, removeAchievement, updateAchievement
    } = useCareerStore()

    const [controlsTab, setControlsTab] = useState('layout')
    const [isTailoring, setIsTailoring] = useState(false)
    const [tailorError, setTailorError] = useState('')
    const [tailorSuccess, setTailorSuccess] = useState(false)

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

    const positionedCareer = applyPositioning(career)
    const { score: atsScore, checks } = computeATSScore(career)
    const activeMode = DESIGN_MODES.find(m => m.id === (designMode || 'executive-minimal')) || DESIGN_MODES[0]
    const educationPriority = career.educationPriority || 'standard'

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return
        const oldIdx = career.sectionOrder.indexOf(active.id)
        const newIdx = career.sectionOrder.indexOf(over.id)
        reorderSections(arrayMove(career.sectionOrder, oldIdx, newIdx))
    }

    const handleAutoTailor = async () => {
        if (!jdText || jdText.length < 50) {
            setTailorError('Please paste a full Job Description in the JD Analyzer first.')
            setTimeout(() => setTailorError(''), 4000)
            return
        }

        if (!aiConfig?.apiKey) {
            setTailorError('AI API Key is required. Please set it in Settings.')
            setTimeout(() => setTailorError(''), 4000)
            return
        }

        setIsTailoring(true)
        setTailorError('')
        setTailorSuccess(false)

        try {
            // Save backup version before rewriting
            createVersion(`Pre-Tailor Backup (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`)

            const tailoredJson = await aiAutoTailorCV(career, jdText, aiConfig)
            applyAutoTailoredData(tailoredJson)
            setTailorSuccess(true)
            setTimeout(() => setTailorSuccess(false), 3000)
        } catch (err) {
            console.error(err)
            setTailorError('AI Auto-Tailor failed. Please try again or check console logs.')
            setTimeout(() => setTailorError(''), 4000)
        } finally {
            setIsTailoring(false)
        }
    }

    return (
        <div className="flex h-full min-h-screen">
            {/* Left Controls Panel */}
            <div className="w-72 bg-navy-950 border-r border-navy-700 flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="px-5 pt-6 pb-4 border-b border-navy-700">
                    <div className="flex items-center gap-2 mb-1">
                        <Palette size={15} className="text-gold-500" />
                        <h2 className="text-slate-100 font-semibold text-sm">Design Controls</h2>
                    </div>
                    {/* ATS Score */}
                    <div className={`mt-3 px-3 py-2 rounded-lg flex items-center justify-between border
            ${atsScore >= 80 ? 'bg-success/10 border-success/30' : atsScore >= 55 ? 'bg-warning/10 border-warning/30' : 'bg-danger/10 border-danger/30'}`}>
                        <span className="text-xs text-slate-300">ATS Readiness</span>
                        <span className={`font-bold text-sm ${atsScore >= 80 ? 'text-success' : atsScore >= 55 ? 'text-warning' : 'text-danger'}`}>
                            {atsScore}/100
                        </span>
                    </div>
                </div>

                <div className="flex border-b border-navy-700">
                    {[
                        ['layout', 'Layout', Sliders],
                        ['content', 'Content', Edit3],
                        ['style', 'Style', Palette]
                    ].map(([id, label, Icon]) => (
                        <button key={id} onClick={() => setControlsTab(id)}
                            className={`flex-1 py-3 text-[11px] font-medium transition-colors cursor-pointer flex flex-col items-center gap-1
                ${controlsTab === id ? 'text-gold-500 border-b-2 border-gold-500 -mb-px' : 'text-slate-400 hover:text-slate-200'}`}>
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-4 space-y-5">
                    {controlsTab === 'layout' ? (
                        <>
                            {/* Design Mode Selector */}
                            <div>
                                <label className="label">Design Mode</label>
                                <div className="space-y-1.5">
                                    {DESIGN_MODES.map((m) => (
                                        <button key={m.id} onClick={() => { setDesignMode(m.id); setTemplate(m.template) }}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer
                        ${activeMode.id === m.id ? 'border-gold-500 bg-gold-500/10' : 'border-navy-600 bg-navy-800 hover:border-navy-500'}`}>
                                            <p className={`text-xs font-semibold ${activeMode.id === m.id ? 'text-gold-400' : 'text-slate-200'}`}>{m.label}</p>
                                            <p className="text-slate-500 text-xs">{m.sub}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Education Priority */}
                            <div>
                                <label className="label">Education Priority</label>
                                <div className="space-y-1.5">
                                    {EDUCATION_PRIORITY.map((ep) => (
                                        <button key={ep.id}
                                            onClick={() => updateCareer({ educationPriority: ep.id })}
                                            className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer
                        ${educationPriority === ep.id ? 'border-gold-500 bg-gold-500/10' : 'border-navy-600 bg-navy-800 hover:border-navy-500'}`}>
                                            <p className={`text-xs font-semibold ${educationPriority === ep.id ? 'text-gold-400' : 'text-slate-200'}`}>{ep.label}</p>
                                            <p className="text-slate-500 text-xs">{ep.sub}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Skills Format Generator */}
                            <div>
                                <label className="label">Skills Format</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {SKILLS_LAYOUT_OPTIONS.map((s) => (
                                        <button key={s.id}
                                            onClick={() => updateCareer({ skillsLayout: s.id })}
                                            className={`py-1.5 px-2 text-[11px] rounded cursor-pointer transition-colors border text-left
                        ${(career.skillsLayout || 'columns3') === s.id ? 'bg-gold-500 text-navy-900 border-gold-500 font-semibold' : 'bg-navy-800 text-slate-400 border-navy-600 hover:text-slate-200'}`}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section Order & Visibility */}
                            <div>
                                <label className="label flex justify-between items-center">
                                    Section Order & Visibility
                                    <button onClick={() => {
                                        const label = prompt('Custom Section Label:')
                                        if (label) addCustomSection(label)
                                    }} className="text-gold-500 hover:text-gold-400 p-1" title="Add Custom Section">
                                        <Plus size={14} />
                                    </button>
                                </label>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={career.sectionOrder} strategy={verticalListSortingStrategy}>
                                        {career.sectionOrder.map((sectionId) => (
                                            <SortableSectionRow
                                                key={sectionId}
                                                id={sectionId}
                                                label={career.sectionLabels?.[sectionId] || sectionId}
                                                visible={career.sectionVisibility[sectionId]}
                                                onToggle={toggleSectionVisibility}
                                                onRename={updateSectionLabel}
                                                onDelete={deleteCustomSection}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>

                            {/* Certifications Format */}
                            <div className="bg-gold-500/5 p-3 rounded-lg border border-gold-500/20">
                                <label className="label flex items-center gap-2">
                                    <Type size={13} className="text-gold-500" />
                                    Certifications Layout
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {CERT_LAYOUT_OPTIONS.map((c) => (
                                        <button key={c.id}
                                            onClick={() => updateCareer({ certificationsLayout: c.id })}
                                            className={`py-1.5 px-1 text-[10px] rounded cursor-pointer transition-colors border text-center
                        ${(career.certificationsLayout || 'line') === c.id ? 'bg-gold-500 text-navy-900 border-gold-500 font-semibold' : 'bg-navy-800 text-slate-400 border-navy-600 hover:text-slate-200'}`}>
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Margins */}
                            <div>
                                <label className="label">Margin Size</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {['tight', 'normal', 'spacious'].map((m) => (
                                        <button key={m} onClick={() => setMarginSize(m)}
                                            className={`py-1.5 text-xs rounded capitalize cursor-pointer transition-colors border
                        ${marginSize === m ? 'bg-gold-500 text-navy-900 border-gold-500 font-semibold' : 'bg-navy-800 text-slate-400 border-navy-600 hover:text-slate-200'}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* Line Spacing */}
                            <div>
                                <label className="label">Line Spacing</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {['compact', 'normal', 'relaxed', 'professional'].map((s) => (
                                        <button key={s} onClick={() => setLineSpacing(s)}
                                            className={`py-1.5 text-xs rounded capitalize cursor-pointer transition-colors border
                        ${lineSpacing === s ? 'bg-gold-500 text-navy-900 border-gold-500 font-semibold' : 'bg-navy-800 text-slate-400 border-navy-600 hover:text-slate-200'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Standard A4 Margins */}
                            <div>
                                <label className="label">A4 Standards</label>
                                <button
                                    onClick={() => { 
                                        setMarginSize('standard'); 
                                        setLineSpacing('professional');
                                        setDesignMode('executive-standard');
                                        setFontPair('calibri');
                                    }}
                                    className="w-full py-2.5 rounded-lg border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 text-[11px] font-semibold hover:bg-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Monitor size={13} />
                                    Apply Strict A4 Rules (11pt/1.15)
                                </button>
                            </div>
                        </>
                    ) : controlsTab === 'content' ? (
                        <div className="space-y-6 pb-20">
                            {/* Profile Title Edit */}
                            <div>
                                <label className="label">Professional Title</label>
                                <input
                                    className="w-full bg-navy-800 border border-navy-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-gold-500 outline-none"
                                    value={career.profile?.title || ''}
                                    placeholder="e.g. IT Manager | Infrastructure"
                                    onChange={(e) => updateCareer({ profile: { ...career.profile, title: e.target.value } })}
                                />
                            </div>

                            {/* Summary Edit */}
                            <div>
                                <label className="label">Professional Summary</label>
                                <textarea
                                    className="w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-xs text-slate-200 focus:border-gold-500 outline-none resize-none h-32 leading-relaxed"
                                    value={career.summary}
                                    onChange={(e) => updateCareer({ summary: e.target.value })}
                                />
                            </div>

                            {/* Key Achievements Editor */}
                            <div>
                                <label className="label flex justify-between items-center">
                                    Key Achievements
                                    <button onClick={addAchievement} className="text-gold-500 hover:text-gold-400 p-1">
                                        <Plus size={14} />
                                    </button>
                                </label>
                                <div className="space-y-2">
                                    {(career.keyAchievements || []).map((ach, idx) => (
                                        <div key={idx} className="group relative">
                                            <textarea
                                                className="w-full bg-navy-900/50 border border-navy-700 rounded-lg p-2 pr-8 text-[11px] text-slate-300 focus:border-gold-500 outline-none resize-none h-16 transition-all"
                                                value={ach}
                                                onChange={(e) => updateAchievement(idx, e.target.value)}
                                            />
                                            <button
                                                onClick={() => removeAchievement(idx)}
                                                className="absolute top-2 right-2 text-slate-600 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills Item Management */}
                            <div className="space-y-4">
                                <label className="label">Core Competencies (Deep Edit)</label>
                                {Object.keys(career.skills || {}).map(groupKey => (
                                    <div key={groupKey} className="bg-navy-900/30 p-3 rounded-xl border border-navy-800/50">
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                value={career.skillLabels?.[groupKey] || groupKey}
                                                onChange={(e) => updateSkillLabel(groupKey, e.target.value)}
                                                className="flex-1 bg-transparent border-b border-navy-700 py-1 text-[11px] font-bold text-gold-500 uppercase tracking-wider outline-none focus:border-gold-500"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {(career.skills[groupKey] || []).map((skill, sidx) => (
                                                <div key={sidx} className="group flex items-center gap-1 bg-navy-800 border border-navy-700 rounded px-2 py-1 transition-all hover:border-gold-500/40">
                                                    <span className="text-[10px] text-slate-300">{skill}</span>
                                                    <button onClick={() => removeSkillItem(groupKey, sidx)} className="text-slate-600 hover:text-danger">
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="flex-1 min-w-[80px]">
                                                <input
                                                    placeholder="+ add skill"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                                            addSkillItem(groupKey, e.target.value.trim())
                                                            e.target.value = ''
                                                        }
                                                    }}
                                                    className="w-full bg-navy-800/20 border border-dashed border-navy-700 rounded px-2 py-1 text-[10px] text-slate-500 outline-none focus:border-gold-500 focus:text-slate-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10px] text-slate-600 italic px-1 pt-4 text-center">
                                All changes apply instantly to the preview and PDF.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Font Pair */}
                            <div>
                                <label className="label">Typography</label>
                                <div className="space-y-2">
                                    {CV_FONTS.map((f) => (
                                        <button key={f.id} onClick={() => setFontPair(f.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer
                        ${fontPair === f.id ? 'border-gold-500 bg-gold-500/10' : 'border-navy-600 bg-navy-800 hover:border-navy-500'}`}>
                                            <p className={`text-xs font-medium ${fontPair === f.id ? 'text-gold-400' : 'text-slate-200'}`}>{f.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accent Color */}
                            <div>
                                <label className="label">Accent Color</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ACCENT_COLORS.map((c) => (
                                        <button key={c.id} onClick={() => setAccentColor(c.value)}
                                            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all
                        ${accentColor === c.value ? 'border-gold-500 bg-gold-500/5' : 'border-navy-600 hover:border-navy-500'}`}>
                                            <div className="w-8 h-8 rounded-full border-2 border-white/10" style={{ backgroundColor: c.value }} />
                                            <span className="text-slate-400 text-xs leading-tight text-center">{c.label.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right — CV Preview */}
            <div className="flex-1 bg-slate-200 overflow-y-auto flex flex-col items-center py-8 px-6 gap-4 relative">

                {/* Auto-Tailor Notifications overlay */}
                <div className="absolute top-4 right-1/2 translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-2">
                    {tailorError && (
                        <div className="bg-danger text-white px-4 py-2 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 opacity-95">
                            {tailorError}
                        </div>
                    )}
                    {tailorSuccess && (
                        <div className="bg-success text-white px-4 py-2 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 opacity-95">
                            ✓ CV Successfully Tailored to Job Description!
                        </div>
                    )}
                </div>

                <div className="w-full max-w-[780px] flex items-center justify-between mb-2 gap-3">
                    <div className="flex items-center gap-2 text-slate-500 text-xs flex-1">
                        <Monitor size={13} />
                        <span>Live Preview — {activeMode.label}</span>
                    </div>

                    <button
                        onClick={handleAutoTailor}
                        disabled={isTailoring}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm disabled:opacity-60 disabled:cursor-wait"
                    >
                        {isTailoring ? (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing & Tailoring...
                            </span>
                        ) : (
                            <>
                                <Zap size={13} className="text-indigo-200" />
                                <span>Auto-Tailor to JD</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => window.open('/print', '_blank')}
                        className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                    >
                        <Printer size={13} className="text-gold-500" />
                        <span>Exact PDF</span>
                    </button>
                </div>

                {/* CV Preview wrapper — A4 ratio */}
                <div className="w-full max-w-[780px]">
                    {activeMode.template === 'corporate-branded'
                        ? <CorporateBranded career={positionedCareer} accentColor={accentColor} fontPair={fontPair} marginSize={marginSize} lineSpacing={lineSpacing} designMode={activeMode.id} preview />
                        : <ExecutiveMinimal career={positionedCareer} accentColor={accentColor} fontPair={fontPair} marginSize={marginSize} lineSpacing={lineSpacing} designMode={activeMode.id} preview />
                    }
                </div>
            </div>

            {/* Embedded AI Chat for live edits */}
            <FloatingAIChat mode="cv" />
        </div>
    )
}
