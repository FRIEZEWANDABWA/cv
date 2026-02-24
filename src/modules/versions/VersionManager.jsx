import { useState } from 'react'
import {
    Layers, Plus, Trash2, Edit2, Check, X, Copy,
    ChevronRight, Save, Bookmark, BookmarkCheck,
} from 'lucide-react'
import useCareerStore from '../../store/careerStore'

const SLOT_COLORS = ['bg-gold-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500']

function VersionSlot({ version, index, isActive, onSwitch, onSave, onRename, onDuplicate, onDelete }) {
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(version.name)

    const commitRename = () => {
        if (name.trim()) onRename(version.id, name.trim())
        setEditing(false)
    }

    const jdLabel = version.jdText
        ? version.jdText.slice(0, 32).trim() + '…'
        : 'No JD linked'

    return (
        <div className={`rounded-xl border overflow-hidden transition-all ${isActive ? 'border-gold-500/50 bg-navy-700' : 'border-navy-600 bg-navy-800 hover:border-navy-500'}`}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
                <div className={`w-2 h-8 rounded-sm flex-shrink-0 ${SLOT_COLORS[index % 5]}`} />
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                className="input py-1 text-sm flex-1"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false) }}
                            />
                            <button onClick={commitRename} className="text-emerald-400 cursor-pointer"><Check size={14} /></button>
                            <button onClick={() => setEditing(false)} className="text-slate-500 cursor-pointer"><X size={14} /></button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-slate-100 text-sm font-semibold truncate">{version.name}</p>
                            <p className="text-slate-600 text-xs truncate">{jdLabel}</p>
                        </div>
                    )}
                </div>
                {!editing && (
                    <button onClick={() => setEditing(true)} className="text-slate-600 hover:text-slate-400 cursor-pointer flex-shrink-0">
                        <Edit2 size={13} />
                    </button>
                )}
            </div>

            {/* Meta */}
            <div className="px-4 pb-2 flex flex-wrap gap-3 border-t border-navy-700">
                {[
                    { label: 'Template', val: version.template === 'corporate-branded' ? 'Branded' : 'Minimal' },
                    { label: 'Mode', val: version.positioning || 'hybrid' },
                ].map(({ label, val }) => (
                    <div key={label}>
                        <span className="text-slate-600 text-xs">{label}: </span>
                        <span className="text-slate-400 text-xs capitalize">{val}</span>
                    </div>
                ))}
                <div>
                    <span className="text-slate-600 text-xs">Saved: </span>
                    <span className="text-slate-400 text-xs">{new Date(version.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex border-t border-navy-700">
                <button
                    onClick={() => onSwitch(version.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${isActive ? 'text-gold-400' : 'text-slate-400 hover:text-gold-400 hover:bg-gold-500/5'}`}
                >
                    {isActive ? <BookmarkCheck size={12} /> : <ChevronRight size={12} />}
                    {isActive ? 'Active' : 'Switch to'}
                </button>
                <button
                    onClick={() => onSave(version.id)}
                    title="Save current settings to this version"
                    className="flex items-center justify-center px-3 py-2.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/5 border-l border-navy-700 transition-colors cursor-pointer"
                >
                    <Save size={12} />
                </button>
                <button
                    onClick={() => onDuplicate(version.id)}
                    title="Duplicate this version"
                    className="flex items-center justify-center px-3 py-2.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/5 border-l border-navy-700 transition-colors cursor-pointer"
                >
                    <Copy size={12} />
                </button>
                <button
                    onClick={() => onDelete(version.id)}
                    title="Delete version"
                    className="flex items-center justify-center px-3 py-2.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 border-l border-navy-700 transition-colors cursor-pointer"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    )
}

export default function VersionManager() {
    const {
        versions, activeVersionId,
        createVersion, updateVersion, deleteVersion, duplicateVersion,
        switchVersion, saveCurrentToVersion, clearActiveVersion,
    } = useCareerStore()

    const [newName, setNewName] = useState('')
    const [creating, setCreating] = useState(false)

    const handleCreate = () => {
        const result = createVersion(newName.trim() || undefined)
        if (result === false) return // cap reached
        setNewName('')
        setCreating(false)
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-navy-700">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-gold-500/15 rounded-lg flex items-center justify-center border border-gold-500/30">
                        <Layers size={16} className="text-gold-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-100">CV Versions</h1>
                </div>
                <p className="text-slate-400 text-sm ml-11">Store up to 5 named CV configurations. Settings, positioning, and JD links are saved per version.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-2xl space-y-4">

                    {/* Active indicator */}
                    {activeVersionId && (
                        <div className="flex items-center justify-between p-3 bg-gold-500/5 border border-gold-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Bookmark size={14} className="text-gold-400" />
                                <span className="text-gold-300 text-sm">
                                    Active: <strong>{versions.find((v) => v.id === activeVersionId)?.name}</strong>
                                </span>
                            </div>
                            <button
                                onClick={clearActiveVersion}
                                className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                            >
                                Back to draft
                            </button>
                        </div>
                    )}

                    {/* Version slots */}
                    {versions.length === 0 && !creating && (
                        <div className="border-2 border-dashed border-navy-600 rounded-xl p-10 text-center">
                            <Layers size={28} className="text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-medium mb-1">No versions saved yet</p>
                            <p className="text-slate-600 text-xs mb-4">Create your first named version — e.g. "DHL Head of IT" or "Governance Focus"</p>
                            <button onClick={() => setCreating(true)} className="btn-primary text-sm flex items-center gap-2 mx-auto">
                                <Plus size={14} /> Create First Version
                            </button>
                        </div>
                    )}

                    {versions.map((v, i) => (
                        <VersionSlot
                            key={v.id}
                            version={v}
                            index={i}
                            isActive={v.id === activeVersionId}
                            onSwitch={switchVersion}
                            onSave={saveCurrentToVersion}
                            onRename={(id, name) => updateVersion(id, { name })}
                            onDuplicate={duplicateVersion}
                            onDelete={deleteVersion}
                        />
                    ))}

                    {/* Create new */}
                    {creating ? (
                        <div className="border border-navy-600 rounded-xl p-4 bg-navy-800">
                            <p className="text-slate-300 text-sm font-medium mb-3">Name this version</p>
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    className="input flex-1"
                                    placeholder="e.g. DHL Head of IT, Governance Focus…"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
                                />
                                <button onClick={handleCreate} className="btn-primary text-sm px-4">Save</button>
                                <button onClick={() => setCreating(false)} className="btn-secondary text-sm px-3">Cancel</button>
                            </div>
                            <p className="text-slate-600 text-xs mt-2">Current template, positioning mode, and JD will be saved with this version.</p>
                        </div>
                    ) : versions.length > 0 && versions.length < 5 && (
                        <button
                            onClick={() => setCreating(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-navy-600 rounded-xl text-slate-500 hover:text-gold-400 hover:border-gold-500/30 transition-colors text-sm cursor-pointer"
                        >
                            <Plus size={14} /> Add version ({versions.length}/5)
                        </button>
                    )}

                    {versions.length >= 5 && (
                        <div className="text-center text-slate-600 text-xs py-2">
                            Maximum 5 versions reached. Delete one to create a new slot.
                        </div>
                    )}

                    {/* Usage guide */}
                    <div className="mt-8 p-4 bg-navy-800 border border-navy-700 rounded-xl">
                        <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">How versions work</p>
                        <ul className="space-y-1.5 text-slate-500 text-xs">
                            <li>· Achievement <strong className="text-slate-400">content</strong> always comes from the master Career DB</li>
                            <li>· Each version stores its own <strong className="text-slate-400">template, positioning, section order, and JD</strong></li>
                            <li>· Click <strong className="text-slate-400">Save (💾)</strong> to snapshot current settings into a version</li>
                            <li>· Click <strong className="text-slate-400">Switch to</strong> to restore that version's settings</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
