import { useState } from 'react'
import useCareerStore from '../../../store/careerStore'
import { User, Camera, Link, Phone, Mail, MapPin, Plus, X } from 'lucide-react'

export default function ProfileTab() {
    const { career, updateProfile, updateSummary, updateStrategicImpact, updateTechEnvironment } = useCareerStore()
    const { profile, summary, strategicImpact = [], techEnvironment = '' } = career
    const [impactInput, setImpactInput] = useState('')

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (r) => updateProfile({ photo: r.target.result })
        reader.readAsDataURL(file)
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div className="card">
                <h2 className="section-title">Personal Information</h2>
                <div className="flex gap-6">
                    {/* Photo Upload */}
                    <div className="flex-shrink-0">
                        <label className="label">Photo (Optional)</label>
                        <div
                            className="w-24 h-24 rounded-xl border-2 border-dashed border-navy-500 flex flex-col items-center
                         justify-center cursor-pointer hover:border-gold-500 transition-colors group overflow-hidden relative"
                            onClick={() => document.getElementById('photo-upload').click()}
                        >
                            {profile.photo
                                ? <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                                : <>
                                    <Camera size={20} className="text-slate-500 group-hover:text-gold-500 transition-colors" />
                                    <span className="text-slate-500 text-xs mt-1 text-center px-1">Add Photo</span>
                                </>
                            }
                        </div>
                        <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        {profile.photo && (
                            <button onClick={() => updateProfile({ photo: null })} className="text-danger text-xs mt-1 hover:underline cursor-pointer block">
                                Remove
                            </button>
                        )}
                    </div>

                    {/* Name & Title */}
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Full Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={profile.name}
                                    onChange={(e) => updateProfile({ name: e.target.value })}
                                    placeholder="e.g. Frieze Kere Wandabwa"
                                />
                            </div>
                            <div>
                                <label className="label">Professional Title</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={profile.title}
                                    onChange={(e) => updateProfile({ title: e.target.value })}
                                    placeholder="e.g. Head of IT | IT Manager"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label flex items-center gap-1.5"><Mail size={11} /> Email</label>
                                <input type="email" className="input" value={profile.email}
                                    onChange={(e) => updateProfile({ email: e.target.value })}
                                    placeholder="your@email.com" />
                            </div>
                            <div>
                                <label className="label flex items-center gap-1.5"><Phone size={11} /> Phone</label>
                                <input type="text" className="input" value={profile.phone}
                                    onChange={(e) => updateProfile({ phone: e.target.value })}
                                    placeholder="+254 7XX XXX XXX" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label flex items-center gap-1.5"><MapPin size={11} /> Location</label>
                                <input type="text" className="input" value={profile.location}
                                    onChange={(e) => updateProfile({ location: e.target.value })}
                                    placeholder="City, Country" />
                            </div>
                            <div>
                                <label className="label flex items-center gap-1.5"><Link size={11} /> LinkedIn</label>
                                <input type="text" className="input" value={profile.linkedin || ''}
                                    onChange={(e) => updateProfile({ linkedin: e.target.value })}
                                    placeholder="linkedin.com/in/yourprofile" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label flex items-center gap-1.5"><Link size={11} /> Website <span className="text-slate-600 font-normal">(optional)</span></label>
                                <input type="text" className="input" value={profile.website || ''}
                                    onChange={(e) => updateProfile({ website: e.target.value })}
                                    placeholder="yoursite.com" />
                            </div>
                            <div>
                                <label className="label flex items-center gap-1.5"><Link size={11} /> GitHub <span className="text-slate-600 font-normal">(optional)</span></label>
                                <input type="text" className="input" value={profile.github || ''}
                                    onChange={(e) => updateProfile({ github: e.target.value })}
                                    placeholder="github.com/yourhandle" />
                            </div>
                        </div>
                        <p className="text-slate-600 text-xs">Contact row format: Email · Phone · Location · LinkedIn · Website — shown as plain text, no icons (executive standard).</p>
                    </div>
                </div>
            </div>

            {/* Professional Summary */}
            <div className="card">
                <h2 className="section-title">Professional Summary</h2>
                <p className="text-slate-400 text-xs mb-3">
                    Write in first person, past-and-present voice. Start with your biggest positioning statement. No buzzwords.
                </p>
                <textarea
                    className="textarea h-36"
                    value={summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    placeholder="IT Manager with 10+ years of experience leading enterprise ICT operations..."
                />
                <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-500 text-xs">Aim for 3–5 powerful sentences</span>
                    <span className={`text-xs font-medium ${summary.length > 600 ? 'text-danger' : summary.length > 400 ? 'text-warning' : 'text-success'}`}>
                        {summary.length} chars
                    </span>
                </div>
            </div>

            {/* Strategic IT Leadership Impact */}
            <div className="card">
                <h2 className="section-title">Strategic IT Leadership Impact</h2>
                <p className="text-slate-400 text-xs mb-3">
                    Key quantified achievements to showcase on the CV. Add 4–6 bullet points (e.g. 20% cost savings, 99.9% uptime).
                </p>
                <div className="flex gap-2 mb-3">
                    <input
                        className="input flex-1"
                        value={impactInput}
                        onChange={(e) => setImpactInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const t = impactInput.trim()
                                if (t) { updateStrategicImpact([...strategicImpact, t]); setImpactInput('') }
                            }
                        }}
                        placeholder="Directed ICT operations supporting 15+ locations, 99.9% uptime..."
                    />
                    <button
                        onClick={() => {
                            const t = impactInput.trim()
                            if (t) { updateStrategicImpact([...strategicImpact, t]); setImpactInput('') }
                        }}
                        className="btn-primary px-3 py-2 flex items-center gap-1"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                <div className="space-y-2">
                    {strategicImpact.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 bg-navy-800 p-2.5 rounded-lg border border-navy-600">
                            <span className="text-gold-500 text-sm mt-0.5 flex-shrink-0">•</span>
                            <p className="flex-1 text-slate-300 text-xs leading-relaxed">{item}</p>
                            <button
                                onClick={() => updateStrategicImpact(strategicImpact.filter((_, idx) => idx !== i))}
                                className="text-slate-500 hover:text-danger cursor-pointer flex-shrink-0"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ))}
                    {strategicImpact.length === 0 && (
                        <p className="text-slate-600 text-xs py-2">No impact bullets yet — add your key wins above.</p>
                    )}
                </div>
            </div>

            {/* Technology Environment */}
            <div className="card">
                <h2 className="section-title">Technology Environment</h2>
                <p className="text-slate-400 text-xs mb-3">
                    List all tools, platforms, and systems you work with. Separate with · (middle dot) or commas.
                </p>
                <textarea
                    className="textarea h-24"
                    value={techEnvironment}
                    onChange={(e) => updateTechEnvironment(e.target.value)}
                    placeholder="Microsoft 365 · Azure · AWS · Cisco · Fortinet · Active Directory · SD-WAN..."
                />
                <p className="text-slate-600 text-xs mt-2">This appears at the bottom of page 2 as a compact technology stack list.</p>
            </div>
        </div>
    )
}
