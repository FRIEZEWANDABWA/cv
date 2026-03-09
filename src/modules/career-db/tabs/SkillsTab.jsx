import { useState } from 'react'
import useCareerStore from '../../../store/careerStore'
import { Plus, X } from 'lucide-react'

function SkillPill({ skill, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 bg-navy-600 text-slate-200 text-xs px-2.5 py-1 rounded-full border border-navy-500">
            {skill}
            <button onClick={() => onRemove(skill)} className="text-slate-400 hover:text-danger cursor-pointer transition-colors">
                <X size={11} />
            </button>
        </span>
    )
}

function SkillGroup({ category, defaultLabel, placeholder, description }) {
    const { career, updateSkills, updateSkillLabel } = useCareerStore()
    const skills = career.skills?.[category] || []
    const currentLabel = career.skillLabels?.[category] || defaultLabel
    const [input, setInput] = useState('')

    const add = () => {
        const trimmed = input.trim()
        if (!trimmed || skills.includes(trimmed)) return
        updateSkills(category, [...skills, trimmed])
        setInput('')
    }

    const remove = (skill) => updateSkills(category, skills.filter((s) => s !== skill))

    const handleKey = (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    }

    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <input
                    type="text"
                    value={currentLabel}
                    onChange={(e) => updateSkillLabel(category, e.target.value)}
                    className="text-slate-100 font-semibold text-sm bg-transparent border-b border-transparent focus:border-gold-500 hover:border-navy-500 focus:outline-none transition-colors w-full sm:w-2/3 pb-0.5"
                />
                <span className="text-slate-500 text-xs shrink-0">{skills.length} skills</span>
            </div>
            <p className="text-slate-500 text-xs mb-4">{description}</p>

            <div className="flex gap-2 mb-3">
                <input
                    className="input flex-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={placeholder}
                />
                <button onClick={add} className="btn-primary px-3 py-2 flex items-center gap-1">
                    <Plus size={14} />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[40px]">
                {skills.length === 0
                    ? <p className="text-slate-600 text-xs py-2">Add skills above or press Enter</p>
                    : skills.map((s) => <SkillPill key={s} skill={s} onRemove={remove} />)
                }
            </div>
        </div>
    )
}

export default function SkillsTab() {
    return (
        <div className="max-w-3xl space-y-5">
            <div>
                <h2 className="text-slate-100 font-semibold text-base">Core Competencies</h2>
                <p className="text-slate-400 text-xs mt-0.5">Edit the category titles to whatever you want, and press Enter or comma to add skills.</p>
            </div>

            <SkillGroup
                category="ictLeadership"
                defaultLabel="ICT Strategy & Leadership"
                placeholder="ICT Strategy, Digital Transformation, IT Operations..."
                description="Leadership, strategy, and management competencies aligned with ICT executive roles."
            />
            <SkillGroup
                category="cloudInfrastructure"
                defaultLabel="Cloud & Infrastructure Platforms"
                placeholder="Microsoft Azure, AWS, Microsoft 365, SD-WAN, LAN/WAN..."
                description="Cloud platforms, network architecture, and enterprise infrastructure technologies."
            />
            <SkillGroup
                category="cybersecurity"
                defaultLabel="Cybersecurity & Governance"
                placeholder="ISO 27001, ITIL, Business Continuity, Incident Management..."
                description="Security governance, risk management, and IT service management frameworks."
            />
            <SkillGroup
                category="businessOperations"
                defaultLabel="Business & Operational Management"
                placeholder="Vendor Management, ICT Budget, Procurement, Asset Lifecycle..."
                description="Business operations, financial management, and procurement competencies."
            />
            <SkillGroup
                category="technical"
                defaultLabel="Technical (Legacy)"
                placeholder="Legacy skills..."
                description="(Legacy) Use if you need a generic technical category."
            />
            <SkillGroup
                category="governance"
                defaultLabel="Governance (Legacy)"
                placeholder="Legacy governance skills..."
                description="(Legacy) Use if you need a generic governance category."
            />
            <SkillGroup
                category="leadership"
                defaultLabel="Leadership (Legacy)"
                placeholder="Legacy leadership skills..."
                description="(Legacy) Use if you need a generic leadership category."
            />
        </div>
    )
}
