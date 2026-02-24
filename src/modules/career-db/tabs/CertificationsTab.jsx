import useCareerStore from '../../../store/careerStore'
import { Plus, Trash2, BadgeCheck } from 'lucide-react'

export default function CertificationsTab() {
    const { career, addCertification, updateCertification, deleteCertification } = useCareerStore()

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-slate-100 font-semibold text-base">Certifications</h2>
                    <p className="text-slate-400 text-xs mt-0.5">List your active and relevant professional certifications.</p>
                </div>
                <button onClick={addCertification} className="btn-primary flex items-center gap-2">
                    <Plus size={14} /> Add Certification
                </button>
            </div>

            {career.certifications.length === 0
                ? (
                    <div className="card text-center py-10">
                        <BadgeCheck size={32} className="text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">No certifications added yet.</p>
                        <button onClick={addCertification} className="btn-primary mt-4 inline-flex items-center gap-2">
                            <Plus size={14} /> Add Certification
                        </button>
                    </div>
                )
                : career.certifications.map((cert) => (
                    <div key={cert.id} className="card mb-4">
                        <div className="flex gap-3">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="label">Certification Name</label>
                                    <input className="input" value={cert.name} onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                                        placeholder="ITIL 4 Foundation, AWS Solutions Architect, PMP..." />
                                </div>
                                <div>
                                    <label className="label">Issuing Organization</label>
                                    <input className="input" value={cert.issuer} onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                                        placeholder="AXELOS, AWS, PMI..." />
                                </div>
                                <div>
                                    <label className="label">Year Obtained</label>
                                    <input className="input" value={cert.year} onChange={(e) => updateCertification(cert.id, { year: e.target.value })}
                                        placeholder="2023" />
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <input type="checkbox" id={`valid-${cert.id}`} checked={cert.valid}
                                        onChange={(e) => updateCertification(cert.id, { valid: e.target.checked })}
                                        className="accent-gold-500 w-4 h-4 cursor-pointer" />
                                    <label htmlFor={`valid-${cert.id}`} className="text-slate-300 text-xs cursor-pointer">
                                        Currently valid / active
                                    </label>
                                </div>
                            </div>
                            <button onClick={() => deleteCertification(cert.id)} className="text-slate-600 hover:text-danger cursor-pointer self-start mt-6">
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
