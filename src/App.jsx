import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import {
  Brain, Search, Palette, FileText,
  Download, Upload, RotateCcw, ChevronRight, Layers, Bookmark, FlaskConical, Settings as SettingsIcon, Bot
} from 'lucide-react'
import useCareerStore from './store/careerStore'
import CareerDB from './modules/career-db/CareerDB'
import JDAnalyzer from './modules/jd-analyzer/JDAnalyzer'
import CVDesigner from './modules/cv-designer/CVDesigner'
import PDFExport from './modules/pdf-export/PDFExport'
import VersionManager from './modules/versions/VersionManager'
import ContentLab from './modules/content-lab/ContentLab'
import AIAssistant from './modules/ai-assistant/AIAssistant'
import CoverLetterBuilder from './modules/cover-letter/CoverLetterBuilder'
import { POSITIONING_MODES } from './utils/constants'

const NAV_ITEMS = [
  { to: '/career', icon: Brain, label: 'Career Intelligence', sub: 'Master data & achievements' },
  { to: '/jd', icon: Search, label: 'JD Analyzer', sub: 'Keyword scoring & gaps' },
  { to: '/lab', icon: FlaskConical, label: 'Content Lab', sub: 'Paste & parse CV content' },
  { to: '/ai-assistant', icon: Bot, label: 'AI Assistant', sub: 'Generate & refine content' },
  { to: '/cover-letter', icon: FileText, label: 'Cover Letter', sub: 'AI tailored applications' },
  { to: '/designer', icon: Palette, label: 'CV Designer', sub: 'Templates & layout control' },
  { to: '/versions', icon: Layers, label: 'CV Versions', sub: 'Up to 5 named configurations' },
  { to: '/export', icon: Download, label: 'Export PDF', sub: 'ATS-safe PDF generation' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings', sub: 'AI configuration & preferences' },
]

function Sidebar() {
  const { career, updatePositioning, exportData, importData, resetToSeed, versions, activeVersionId, pendingChanges } = useCareerStore()
  const activeVersion = versions.find((v) => v.id === activeVersionId)

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (r) => importData(r.target.result)
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <aside className="w-64 min-h-screen bg-navy-950 border-r border-navy-700 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-navy-700">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-gold-500 rounded flex items-center justify-center">
            <Brain size={14} className="text-navy-900" />
          </div>
          <span className="text-slate-100 font-bold text-sm tracking-wider uppercase">CareerWeapon</span>
        </div>
        <p className="text-slate-400 text-xs ml-9">Executive CV Intelligence</p>
      </div>

      {/* Role Positioning Switch */}
      <div className="px-4 py-4 border-b border-navy-700">
        <p className="label mb-2">Role Positioning</p>
        <div className="grid grid-cols-2 gap-1.5">
          {POSITIONING_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => updatePositioning(mode.id)}
              className={`px-2 py-1.5 rounded text-xs font-medium text-center transition-all duration-200 cursor-pointer
                ${career.positioning === mode.id
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-navy-700 text-slate-400 hover:text-slate-200 hover:bg-navy-600'
                }`}
            >
              {mode.label.split('-')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, sub }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group cursor-pointer
               ${isActive
                ? 'bg-navy-700 border-l-2 border-gold-500 pl-[10px]'
                : 'hover:bg-navy-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={isActive ? 'text-gold-500' : 'text-slate-400 group-hover:text-slate-200'}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-gold-500' : 'text-slate-300 group-hover:text-slate-100'}`}>
                    {label}
                  </p>
                  <p className="text-slate-500 text-xs truncate">{sub}</p>
                </div>
                {/* Badges */}
                {to === '/jd' && pendingChanges.length > 0 && (
                  <span className="text-xs bg-gold-500 text-navy-900 font-bold px-1.5 py-0.5 rounded-full">
                    {pendingChanges.length}
                  </span>
                )}
                {to === '/versions' && versions.length > 0 && (
                  <span className="text-xs text-slate-600">{versions.length}/5</span>
                )}
                {isActive && <ChevronRight size={12} className="text-gold-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Active version indicator */}
      {activeVersion && (
        <div className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 bg-gold-500/8 border border-gold-500/20 rounded-lg">
          <Bookmark size={11} className="text-gold-400 flex-shrink-0" />
          <p className="text-gold-300/80 text-xs truncate">{activeVersion.name}</p>
        </div>
      )}

      {/* Profile snippet */}
      <div className="px-4 py-3 border-t border-navy-700 bg-navy-800/50">
        <p className="text-slate-100 text-xs font-semibold truncate">{career.profile.name || 'Your Name'}</p>
        <p className="text-slate-400 text-xs truncate">{career.profile.title || 'Add your title'}</p>
      </div>

      {/* Data actions */}
      <div className="px-3 py-3 border-t border-navy-700 space-y-1.5">
        <button onClick={exportData} className="flex items-center gap-2 text-slate-400 hover:text-gold-400 text-xs px-3 py-2 rounded hover:bg-navy-800 w-full transition-all cursor-pointer">
          <Download size={13} /> Export Data (JSON)
        </button>
        <button onClick={handleImport} className="flex items-center gap-2 text-slate-400 hover:text-gold-400 text-xs px-3 py-2 rounded hover:bg-navy-800 w-full transition-all cursor-pointer">
          <Upload size={13} /> Import Data (JSON)
        </button>
        <button
          onClick={() => { if (confirm('Reset all data to defaults?')) resetToSeed() }}
          className="flex items-center gap-2 text-slate-500 hover:text-danger text-xs px-3 py-2 rounded hover:bg-navy-800 w-full transition-all cursor-pointer"
        >
          <RotateCcw size={13} /> Reset Data
        </button>
        <LogoutButton />
      </div>
    </aside>
  )
}

import PrintView from './modules/pdf-export/PrintView'
import Settings from './modules/settings/Settings'
import Login, { LogoutButton } from './modules/auth/Login'

export default function App() {
  const { isAuthenticated } = useCareerStore()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-navy-900">
        <div className="print-hidden">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto print:overflow-visible">
          <Routes>
            <Route path="/" element={<CareerDB />} />
            <Route path="/career" element={<CareerDB />} />
            <Route path="/jd" element={<JDAnalyzer />} />
            <Route path="/lab" element={<ContentLab />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/cover-letter" element={<CoverLetterBuilder />} />
            <Route path="/designer" element={<CVDesigner />} />
            <Route path="/versions" element={<VersionManager />} />
            <Route path="/export" element={<PDFExport />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/print" element={<PrintView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

