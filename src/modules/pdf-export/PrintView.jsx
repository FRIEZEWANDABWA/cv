import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import useCareerStore from '../../store/careerStore'
import { applyPositioning } from '../cv-designer/cvUtils'
import ExecutiveMinimal from '../../templates/ExecutiveMinimal'
import CorporateBranded from '../../templates/CorporateBranded'

export default function PrintView() {
    const { career, activeTemplate, accentColor, fontPair, marginSize, lineSpacing, designMode } = useCareerStore()
    const navigate = useNavigate()
    const positionedCareer = applyPositioning(career)

    useEffect(() => {
        // Automatically trigger print dialog shortly after load
        const timer = setTimeout(() => {
            window.print()
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="bg-white min-h-screen">
            {/* Screen-only Controls (Hidden during print) */}
            <div className="print-hidden fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={() => navigate('/export')}
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded shadow-lg hover:bg-slate-700 transition"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-gold-600 text-white px-4 py-2 rounded shadow-lg hover:bg-gold-500 transition"
                >
                    <Printer size={16} /> Print / Save as PDF
                </button>
            </div>

            {/* Print Area - Scales purely for A4 */}
            <div className="mx-auto bg-white max-w-[210mm] w-[210mm] print:w-auto print:max-w-none print:m-0 print:p-0">
                {activeTemplate === 'corporate-branded'
                    ? <CorporateBranded career={positionedCareer} accentColor={accentColor} fontPair={fontPair} marginSize={marginSize} lineSpacing={lineSpacing} designMode={designMode || 'corporate-branded'} />
                    : <ExecutiveMinimal career={positionedCareer} accentColor={accentColor} fontPair={fontPair} marginSize={marginSize} lineSpacing={lineSpacing} designMode={designMode || 'executive-minimal'} />
                }
            </div>
        </div>
    )
}
