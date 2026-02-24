import { useState } from 'react'
import { Brain, User, Briefcase, GraduationCap, Award, Zap, BarChart3, Upload } from 'lucide-react'
import ProfileTab from './tabs/ProfileTab'
import ExperiencesTab from './tabs/ExperiencesTab'
import EducationTab from './tabs/EducationTab'
import CertificationsTab from './tabs/CertificationsTab'
import SkillsTab from './tabs/SkillsTab'
import KeyStatsTab from './tabs/KeyStatsTab'
import PDFImportModal from './PDFImportModal'

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'experiences', label: 'Experiences', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Zap },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'keystats', label: 'Key Stats', icon: BarChart3 },
]

export default function CareerDB() {
    const [activeTab, setActiveTab] = useState('profile')
    const [showImport, setShowImport] = useState(false)

    const ActiveTab = {
        profile: ProfileTab,
        experiences: ExperiencesTab,
        skills: SkillsTab,
        certifications: CertificationsTab,
        education: EducationTab,
        keystats: KeyStatsTab,
    }[activeTab]

    return (
        <div className="flex flex-col h-full min-h-screen">
            {showImport && <PDFImportModal onClose={() => setShowImport(false)} />}

            {/* Page Header */}
            <div className="px-8 pt-8 pb-4 border-b border-navy-700">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold-500/15 rounded-lg flex items-center justify-center border border-gold-500/30">
                            <Brain size={16} className="text-gold-500" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-100">Career Intelligence Database</h1>
                    </div>
                    <button
                        onClick={() => setShowImport(true)}
                        className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
                    >
                        <Upload size={14} />
                        Import CV (PDF)
                    </button>
                </div>
                <p className="text-slate-400 text-sm ml-11">
                    Your master career data — structured, tagged, and ready for any opportunity.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-navy-700 px-8">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer
              ${activeTab === id
                                ? 'border-gold-500 text-gold-500'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                            }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-8">
                <ActiveTab />
            </div>
        </div>
    )
}
