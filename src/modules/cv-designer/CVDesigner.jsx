import { useState } from 'react'
import { Palette, Eye, EyeOff, GripVertical, Monitor, Sliders } from 'lucide-react'
import useCareerStore from '../../store/careerStore'
import { ACCENT_COLORS, CV_FONTS } from '../../utils/constants'
import { computeATSScore, applyPositioning } from './cvUtils'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ExecutiveMinimal from '../../templates/ExecutiveMinimal'
import CorporateBranded from '../../templates/CorporateBranded'

const SECTION_LABELS = {
    summary: 'Executive Summary',
    keyStats: 'Key Statistics',
    skills: 'Core Competencies',
    experiences: 'Work Experience',
    certifications: 'Certifications',
    education: 'Education',
}

function SortableSectionRow({ id, visible, onToggle }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

    return (
        <div ref={setNodeRef} style={style}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 border transition-colors
        ${visible ? 'bg-navy-700 border-navy-600' : 'bg-navy-800 border-navy-700 opacity-60'}`}
        >
            <div {...attributes} {...listeners} className="text-slate-600 hover:text-slate-400 cursor-grab">
                <GripVertical size={14} />
            </div>
            <span className={`flex-1 text-xs font-medium ${visible ? 'text-slate-200' : 'text-slate-500'}`}>
                {SECTION_LABELS[id] || id}
            </span>
            <button onClick={() => onToggle(id)} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                {visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
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

export default function CVDesigner() {
    const {
        career, activeTemplate, accentColor, fontPair, marginSize, lineSpacing,
        designMode, setTemplate, setAccentColor, setFontPair, setMarginSize, setLineSpacing,
        setDesignMode, reorderSections, toggleSectionVisibility, updateCareer,
    } = useCareerStore()

    const [controlsTab, setControlsTab] = useState('layout')
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

                {/* Controls Tabs */}
                <div className="flex border-b border-navy-700">
                    {[['layout', 'Layout'], ['style', 'Style']].map(([id, label]) => (
                        <button key={id} onClick={() => setControlsTab(id)}
                            className={`flex-1 py-2.5 text-xs font-medium transition-colors cursor-pointer
                ${controlsTab === id ? 'text-gold-500 border-b-2 border-gold-500 -mb-px' : 'text-slate-400 hover:text-slate-200'}`}>
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

                            {/* Section Order & Visibility */}
                            <div>
                                <label className="label">Section Order & Visibility</label>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={career.sectionOrder} strategy={verticalListSortingStrategy}>
                                        {career.sectionOrder.map((sectionId) => (
                                            <SortableSectionRow
                                                key={sectionId}
                                                id={sectionId}
                                                visible={career.sectionVisibility[sectionId]}
                                                onToggle={toggleSectionVisibility}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
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
                                    {['compact', 'normal', 'relaxed'].map((s) => (
                                        <button key={s} onClick={() => setLineSpacing(s)}
                                            className={`py-1.5 text-xs rounded capitalize cursor-pointer transition-colors border
                        ${lineSpacing === s ? 'bg-gold-500 text-navy-900 border-gold-500 font-semibold' : 'bg-navy-800 text-slate-400 border-navy-600 hover:text-slate-200'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
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
            <div className="flex-1 bg-slate-200 overflow-y-auto flex flex-col items-center py-8 px-6 gap-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <Monitor size={13} />
                    <span>Live Preview — {activeMode.label}</span>
                </div>

                {/* CV Preview wrapper — A4 ratio */}
                <div className="w-full max-w-[780px]">
                    {activeMode.template === 'corporate-branded'
                        ? <CorporateBranded career={positionedCareer} accentColor={accentColor} fontPair={fontPair} marginSize={marginSize} lineSpacing={lineSpacing} designMode={activeMode.id} preview />
                        : <ExecutiveMinimal career={positionedCareer} accentColor={accentColor} fontPair={fontPair} marginSize={marginSize} lineSpacing={lineSpacing} designMode={activeMode.id} preview />
                    }
                </div>
            </div>
        </div>
    )
}
