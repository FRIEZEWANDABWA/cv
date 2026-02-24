import useCareerStore from '../../../store/careerStore'
import { Plus, Trash2 } from 'lucide-react'

export default function EducationTab() {
    const { career, addEducation, updateEducation, deleteEducation } = useCareerStore()

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-slate-100 font-semibold text-base">Education</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Add degrees in reverse chronological order.</p>
                </div>
                <button onClick={addEducation} className="btn-primary flex items-center gap-2">
                    <Plus size={14} /> Add Education
                </button>
            </div>

            {career.education.length === 0
                ? (
                    <div className="card text-center py-10">
                        <p className="text-slate-400 text-sm">No education entries yet.</p>
                        <button onClick={addEducation} className="btn-primary mt-4 inline-flex items-center gap-2">
                            <Plus size={14} /> Add Degree
                        </button>
                    </div>
                )
                : career.education.map((edu) => (
                    <div key={edu.id} className="card mb-4">
                        <div className="flex gap-3">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Degree</label>
                                    <input className="input" value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                        placeholder="Bachelor of Science" />
                                </div>
                                <div>
                                    <label className="label">Field of Study</label>
                                    <input className="input" value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                                        placeholder="Computer Science / IT Management" />
                                </div>
                                <div>
                                    <label className="label">Institution</label>
                                    <input className="input" value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                                        placeholder="University Name" />
                                </div>
                                <div>
                                    <label className="label">Year Completed</label>
                                    <input className="input" value={edu.year} onChange={(e) => updateEducation(edu.id, { year: e.target.value })}
                                        placeholder="2010" />
                                </div>
                            </div>
                            <button onClick={() => deleteEducation(edu.id)} className="text-slate-600 hover:text-danger cursor-pointer self-start mt-6">
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
