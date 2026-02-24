import { useState } from 'react'
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
    SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    GripVertical, Plus, Trash2, ChevronDown, ChevronUp, Tag, X,
} from 'lucide-react'
import useCareerStore from '../../../store/careerStore'
import { ACHIEVEMENT_TAGS, TAG_COLORS } from '../../../utils/constants'

/* ─── Tag Picker ─────────────────────────────────────────────────────── */
function TagPicker({ selected, onChange }) {
    return (
        <div className="flex flex-wrap gap-1.5 mt-1">
            {ACHIEVEMENT_TAGS.map((tag) => {
                const active = selected.includes(tag)
                return (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => onChange(active ? selected.filter((t) => t !== tag) : [...selected, tag])}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-all cursor-pointer
              ${active
                                ? `${TAG_COLORS[tag] || 'bg-gold-500/20 text-gold-400 border-gold-500/40'} font-semibold`
                                : 'bg-navy-700 text-slate-500 border-navy-600 hover:text-slate-300'
                            }`}
                    >
                        {tag}
                    </button>
                )
            })}
        </div>
    )
}

/* ─── Achievement Row ────────────────────────────────────────────────── */
function AchievementRow({ ach, expId, index }) {
    const { updateAchievement, deleteAchievement } = useCareerStore()
    const [showTags, setShowTags] = useState(false)
    const up = (f) => updateAchievement(expId, ach.id, f)

    return (
        <div className="group border border-navy-600 rounded-lg bg-navy-800 mb-2 overflow-hidden">
            <div className="flex items-start gap-2 p-3">
                {/* Bullet number */}
                <span className="text-gold-500/60 text-xs font-bold mt-2 flex-shrink-0 w-4 text-right">{index + 1}.</span>

                {/* Text */}
                <textarea
                    className="flex-1 bg-transparent text-slate-200 text-sm resize-none focus:outline-none leading-relaxed min-h-[48px]"
                    value={ach.text}
                    onChange={(e) => up({ text: e.target.value })}
                    placeholder="Describe this achievement..."
                    rows={2}
                    onInput={(e) => {
                        e.target.style.height = 'auto'
                        e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                />

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                    <button
                        onClick={() => setShowTags((v) => !v)}
                        title="Tags"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer
              ${showTags ? 'bg-gold-500/20 text-gold-400' : 'text-slate-600 hover:text-gold-400 hover:bg-gold-500/10'}`}
                    >
                        <Tag size={12} />
                    </button>
                    <button
                        onClick={() => deleteAchievement(expId, ach.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Metrics row */}
            <div className="px-3 pb-2 flex items-center gap-2 border-t border-navy-700">
                <span className="text-slate-600 text-xs flex-shrink-0">Metric:</span>
                <input
                    className="flex-1 bg-transparent text-slate-400 text-xs focus:outline-none focus:text-slate-200 placeholder-navy-600"
                    value={ach.metrics || ''}
                    onChange={(e) => up({ metrics: e.target.value })}
                    placeholder="e.g. 20% cost savings | 1,000+ users"
                />
            </div>

            {/* Tags */}
            {showTags && (
                <div className="px-3 pb-3 border-t border-navy-700">
                    <p className="text-slate-600 text-xs mb-1.5 mt-2">Tag this achievement:</p>
                    <TagPicker selected={ach.tags || []} onChange={(tags) => up({ tags })} />
                </div>
            )}

            {/* Active tags summary */}
            {!showTags && ach.tags?.length > 0 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1">
                    {ach.tags.map((t) => (
                        <span key={t} className={`text-xs px-1.5 py-0 rounded ${TAG_COLORS[t] || ''}`}>{t}</span>
                    ))}
                </div>
            )}
        </div>
    )
}

/* ─── Experience Card ────────────────────────────────────────────────── */
function ExperienceCard({ exp }) {
    const [open, setOpen] = useState(true)
    const { updateExperience, deleteExperience, addAchievement, reorderAchievements } = useCareerStore()
    const up = (f) => updateExperience(exp.id, f)
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

    const handleAchDrag = ({ active, over }) => {
        if (!over || active.id === over.id) return
        const oldIdx = exp.achievements.findIndex((a) => a.id === active.id)
        const newIdx = exp.achievements.findIndex((a) => a.id === over.id)
        reorderAchievements(exp.id, arrayMove(exp.achievements, oldIdx, newIdx))
    }

    return (
        <div className="border border-navy-600 rounded-xl mb-4 overflow-hidden bg-navy-800/50">
            {/* Card Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-navy-800 border-b border-navy-700">
                <div className="flex-1">
                    <input
                        className="input w-full bg-transparent border-0 border-b border-navy-600 focus:border-gold-500 rounded-none px-0 text-base font-semibold text-slate-100 placeholder-navy-500"
                        value={exp.role}
                        onChange={(e) => up({ role: e.target.value })}
                        placeholder="Job Title"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${exp.achievements.length > 0 ? 'border-gold-500/30 text-gold-500/70 bg-gold-500/5' : 'border-navy-600 text-slate-600'}`}>
                        {exp.achievements.length} achievements
                    </span>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                        onClick={() => deleteExperience(exp.id)}
                        className="text-slate-600 hover:text-danger transition-colors cursor-pointer"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {open && (
                <div className="p-4">
                    {/* Meta row */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="label text-xs">Company / Organisation</label>
                            <input className="input" value={exp.company} onChange={(e) => up({ company: e.target.value })} placeholder="e.g. KOFISI Africa" />
                        </div>
                        <div>
                            <label className="label text-xs">Period</label>
                            <input className="input" value={exp.period} onChange={(e) => up({ period: e.target.value })} placeholder="e.g. Jan 2020 – Aug 2022" />
                        </div>
                        <div>
                            <label className="label text-xs">Location</label>
                            <input className="input" value={exp.location} onChange={(e) => up({ location: e.target.value })} placeholder="e.g. Nairobi, Kenya" />
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="flex items-center justify-between mb-2">
                        <label className="label text-xs">Achievements & Responsibilities</label>
                        <button
                            onClick={() => addAchievement(exp.id)}
                            className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 cursor-pointer transition-colors"
                        >
                            <Plus size={12} /> Add achievement
                        </button>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleAchDrag}>
                        <SortableContext items={exp.achievements.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                            {exp.achievements.length === 0
                                ? (
                                    <div className="border-2 border-dashed border-navy-600 rounded-lg p-4 text-center">
                                        <p className="text-slate-600 text-sm">No achievements yet</p>
                                        <button onClick={() => addAchievement(exp.id)} className="text-gold-500 text-xs mt-1 cursor-pointer hover:text-gold-400">+ Add one</button>
                                    </div>
                                )
                                : exp.achievements.map((ach, i) => (
                                    <AchievementRow key={ach.id} ach={ach} expId={exp.id} index={i} />
                                ))
                            }
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    )
}

/* ─── Main Tab ───────────────────────────────────────────────────────── */
export default function ExperiencesTab() {
    const { career, addExperience, reorderExperiences } = useCareerStore()
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

    const handleDrag = ({ active, over }) => {
        if (!over || active.id === over.id) return
        const oldIdx = career.experiences.findIndex((e) => e.id === active.id)
        const newIdx = career.experiences.findIndex((e) => e.id === over.id)
        reorderExperiences(arrayMove(career.experiences, oldIdx, newIdx))
    }

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-slate-100 font-semibold">Work Experience</h2>
                    <p className="text-slate-500 text-xs mt-0.5">{career.experiences.length} roles · Drag the role header to reorder</p>
                </div>
                <button onClick={addExperience} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={14} /> Add Role
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDrag}>
                <SortableContext items={career.experiences.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                    {career.experiences.map((exp) => (
                        <ExperienceCard key={exp.id} exp={exp} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    )
}
