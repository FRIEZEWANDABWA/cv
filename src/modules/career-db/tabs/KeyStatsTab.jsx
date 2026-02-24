import useCareerStore from '../../../store/careerStore'
import { DollarSign, Users, Calendar, Target } from 'lucide-react'

const STAT_FIELDS = [
    {
        key: 'yearsExperience', label: 'Years of Experience', icon: Calendar,
        placeholder: 'e.g. 15+', hint: 'Total years in IT management / leadership roles'
    },
    {
        key: 'teamSize', label: 'Largest Team Managed', icon: Users,
        placeholder: 'e.g. 45 direct & indirect reports', hint: 'Peak team/headcount under your direct leadership'
    },
    {
        key: 'budgetOwnership', label: 'IT Budget Ownership', icon: DollarSign,
        placeholder: 'e.g. $4.2M annual IT budget', hint: 'Annual capex/opex budget you managed or influenced'
    },
]

export default function KeyStatsTab() {
    const { career, updateKeyStats } = useCareerStore()
    const stats = career.keyStats

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h2 className="text-slate-100 font-semibold text-base">Key Executive Statistics</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                    These headline numbers anchor your positioning. They appear in the CV header area and drive executive authority.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
                {STAT_FIELDS.map(({ key, label, icon: Icon, placeholder, hint }) => (
                    <div key={key} className="card">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center border border-gold-500/20 flex-shrink-0">
                                <Icon size={18} className="text-gold-500" />
                            </div>
                            <div className="flex-1">
                                <label className="label">{label}</label>
                                <input
                                    className="input text-base font-semibold"
                                    value={stats[key]}
                                    onChange={(e) => updateKeyStats({ [key]: e.target.value })}
                                    placeholder={placeholder}
                                />
                                <p className="text-slate-500 text-xs mt-1.5">{hint}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card bg-gold-500/5 border-gold-500/20">
                <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-gold-500" />
                    <p className="text-gold-400 text-sm font-medium">Strategic Note</p>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                    Recruiters at executive level scan for three things in the first 8 seconds: <strong className="text-slate-100">scope</strong>,
                    <strong className="text-slate-100"> scale</strong>, and <strong className="text-slate-100">impact</strong>.
                    These stats deliver all three at a glance. Be specific, honest, and use the highest defensible numbers.
                </p>
            </div>
        </div>
    )
}
