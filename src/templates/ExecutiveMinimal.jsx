import { getFont, getLineHeightVal, formatBullets } from './templateHelpers'
import { cleanAndCapitalizeSkill } from '../modules/cv-designer/textUtils'

// ── Design mode typography map ────────────────────────────────────────────────
const DM = {
    'executive-minimal': { namePt: '22pt', nameWt: '700', nameSpacing: '0.5px', labelSz: '8pt', labelSpacing: '2px', roleSz: '9.5pt', subSz: '9pt', bodySz: '9pt', dateSz: '8.5pt', lineGap: '24px' },
    'global-executive': { namePt: '23pt', nameWt: '700', nameSpacing: '0.3px', labelSz: '8pt', labelSpacing: '1.8px', roleSz: '10pt', subSz: '9.5pt', bodySz: '9.5pt', dateSz: '9pt', lineGap: '26px' },
    'modern-infrastructure': { namePt: '21pt', nameWt: '800', nameSpacing: '0.7px', labelSz: '7.5pt', labelSpacing: '2.5px', roleSz: '9pt', subSz: '8.5pt', bodySz: '8.5pt', dateSz: '8pt', lineGap: '20px' },
}

export default function ExecutiveMinimal({ career, accentColor, fontPair, marginSize, lineSpacing, designMode, preview }) {
    const font = getFont(fontPair)
    const lh = getLineHeightVal(lineSpacing)
    const clr = accentColor || '#C9A84C'
    const dm = DM[designMode] || DM['executive-minimal']
    const vis = career.sectionVisibility || {}

    // Margins
    const mx = marginSize === 'tight' ? '26px' : marginSize === 'spacious' ? '54px' : '42px'
    const my = marginSize === 'tight' ? '22px' : marginSize === 'spacious' ? '46px' : '34px'

    // Education priority
    const edPri = career.educationPriority || 'standard'
    let defaultOrder = ['summary', 'skills', 'experiences', 'certifications', 'education']
    if (edPri === 'mid') defaultOrder = ['summary', 'education', 'skills', 'experiences', 'certifications']
    if (edPri === 'academic') defaultOrder = ['education', 'summary', 'skills', 'experiences', 'certifications']
    const order = career.sectionOrder?.filter(s => s !== 'keyStats') || defaultOrder

    // Contact pipe row — show only fields that exist
    const contactItems = [
        career.profile?.email,
        career.profile?.phone,
        career.profile?.location,
        career.profile?.linkedin,
        career.profile?.website,
    ].filter(Boolean)

    // ── Wrap ──────────────────────────────────────────────────────────────────
    const wrapStyle = preview
        ? { background: '#fff', boxShadow: '0 2px 32px rgba(0,0,0,0.18)', width: '100%', minHeight: '1090px' }
        : { background: '#fff', width: '100%' }

    // ── Section renderers ─────────────────────────────────────────────────────
    const renders = {

        summary: () => vis.summary !== false && career.summary?.trim() && (
            <div key="summary" style={{ marginBottom: dm.lineGap }}>
                <SH label="Professional Summary" clr={clr} font={font} dm={dm} />
                <div style={{ maxWidth: '94%' }}>
                    <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: lh, margin: '0 0 8px 0', textAlign: 'justify' }}>
                        {career.summary}
                    </p>
                    {/* Executive scale statement — replaces infographic block */}
                    {career.executiveScale && (
                        <p style={{ fontFamily: font.body, fontSize: dm.dateSz, color: '#666', margin: 0, letterSpacing: '0.2px' }}>
                            {career.executiveScale}
                        </p>
                    )}
                </div>
            </div>
        ),

        skills: () => vis.skills !== false && (
            <div key="skills" style={{ marginBottom: dm.lineGap }}>
                <SH label="Core Competencies" clr={clr} font={font} dm={dm} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { label: 'Technical', items: career.skills?.technical },
                        { label: 'Governance', items: career.skills?.governance },
                        { label: 'Leadership', items: career.skills?.leadership },
                    ].map(({ label, items }) => items?.length > 0 && (
                        <div key={label}>
                            <div style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#111', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
                            {items.map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '2px', alignItems: 'flex-start' }}>
                                    <span style={{ fontFamily: font.body, fontSize: dm.bodySz, color: clr, flexShrink: 0, lineHeight: lh }}>•</span>
                                    <span style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#444', lineHeight: lh }}>{cleanAndCapitalizeSkill(s)}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        ),

        experiences: () => vis.experiences !== false && career.experiences?.filter(e => e.role).length > 0 && (
            <div key="experiences" style={{ marginBottom: dm.lineGap }}>
                <SH label="Professional Experience" clr={clr} font={font} dm={dm} />
                {career.experiences.filter(e => e.role).map((exp) => (
                    <div key={exp.id} style={{ marginBottom: '14px' }}>
                        {/* Role header row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <div>
                                <span style={{ fontFamily: font.heading, fontSize: dm.roleSz, fontWeight: '600', color: '#111' }}>{exp.role}</span>
                                {exp.company && (
                                    <span style={{ fontFamily: font.body, fontSize: dm.subSz, color: '#444', marginLeft: '6px', fontWeight: '400' }}>— {exp.company}</span>
                                )}
                            </div>
                            <span style={{ fontFamily: font.body, fontSize: dm.dateSz, color: '#666', flexShrink: 0, marginLeft: '14px', fontStyle: 'italic' }}>
                                {exp.period}{exp.location ? `  ·  ${exp.location}` : ''}
                            </span>
                        </div>
                        {exp.technologies && (
                            <div style={{ marginBottom: '6px' }}>
                                <span style={{ fontFamily: font.body, fontSize: dm.dateSz, color: clr, fontWeight: '600' }}>Technologies: </span>
                                <span style={{ fontFamily: font.body, fontSize: dm.dateSz, color: '#555' }}>
                                    {exp.technologies.split(',').map(t => cleanAndCapitalizeSkill(t.trim())).join(', ')}
                                </span>
                            </div>
                        )}
                        {formatBullets(exp.achievements).map((ach, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '6px', alignItems: 'flex-start', maxWidth: '96%' }}>
                                <span style={{ fontFamily: font.body, fontSize: dm.bodySz, color: clr, flexShrink: 0, lineHeight: lh }}>•</span>
                                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: lh, margin: 0 }}>
                                    {ach.text}
                                </p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        ),

        certifications: () => vis.certifications !== false && career.certifications?.filter(c => c.name).length > 0 && (
            <div key="certifications" style={{ marginBottom: dm.lineGap }}>
                <SH label="Certifications" clr={clr} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: '1.7', margin: 0 }}>
                    {career.certifications.filter(c => c.name).map((cert, i, arr) => (
                        <span key={cert.id}>
                            <span style={{ fontWeight: '500' }}>{cert.name}</span>
                            {cert.year ? ` (${cert.year})` : ''}
                            {cert.issuer ? `, ${cert.issuer}` : ''}
                            {i < arr.length - 1 ? <span style={{ color: '#ccc', margin: '0 8px' }}>·</span> : ''}
                        </span>
                    ))}
                </p>
            </div>
        ),

        education: () => vis.education !== false && career.education?.filter(e => e.degree).length > 0 && (
            <div key="education" style={{ marginBottom: dm.lineGap }}>
                <SH label="Education" clr={clr} font={font} dm={dm} />
                {career.education.filter(e => e.degree).map((edu) => (
                    <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <div>
                            <span style={{ fontFamily: font.heading, fontSize: dm.roleSz, fontWeight: '600', color: '#111' }}>
                                {edu.degree}{edu.field ? `, ${edu.field}` : ''}
                            </span>
                            {edu.institution && (
                                <div style={{ fontFamily: font.body, fontSize: dm.subSz, color: '#444', marginTop: '1px' }}>{edu.institution}</div>
                            )}
                        </div>
                        {edu.year && (
                            <span style={{ fontFamily: font.body, fontSize: dm.dateSz, color: '#666', flexShrink: 0, marginLeft: '12px', fontStyle: 'italic' }}>{edu.year}</span>
                        )}
                    </div>
                ))}
            </div>
        ),

        // keyStats deliberately omitted — replaced by executiveScale inline in summary
        keyStats: () => null,

        referees: () => vis.referees !== false && career.referees && (
            <div key="referees" style={{ marginBottom: dm.lineGap }}>
                <SH label="Referees" clr={clr} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh, margin: '0 0 8px 0' }}>
                    {career.referees}
                </p>
            </div>
        ),
    }

    return (
        <div style={wrapStyle}>
            {/* ── Header ── */}
            <div style={{ padding: `${my} ${mx} 20px`, borderBottom: `0.5px solid ${clr}40`, marginBottom: '20px' }}>
                <h1 style={{ fontFamily: font.heading, fontSize: dm.namePt, fontWeight: dm.nameWt, color: '#080808', margin: '0 0 4px 0', letterSpacing: dm.nameSpacing }}>
                    {career.profile?.name || 'Your Name'}
                </h1>
                <p style={{ fontFamily: font.body, fontSize: dm.roleSz, color: clr, fontWeight: '600', margin: '0 0 10px 0', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    {career.profile?.title || 'Professional Title'}
                </p>
                {/* Contact row */}
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {contactItems.map((item, i) => (
                        <span key={i} style={{ fontFamily: font.body, fontSize: dm.dateSz, color: '#666', fontWeight: '400' }}>
                            {item}
                            {i < contactItems.length - 1 && (
                                <span style={{ color: '#ccc', margin: '0 8px' }}>·</span>
                            )}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Body — strict single column ── */}
            <div style={{ padding: `0 ${mx} ${my}` }}>
                {order.map(id => {
                    const fn = renders[id]
                    return fn ? fn() : null
                })}
            </div>
        </div>
    )
}

// ── Section heading — uppercase, letter-spaced, hairline rule ────────────────
function SH({ label, clr, font, dm }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', marginTop: '6px' }}>
            <h2 style={{
                fontFamily: font.body, fontSize: dm.labelSz, fontWeight: '700',
                color: '#111', margin: 0,
                textTransform: 'uppercase', letterSpacing: dm.labelSpacing,
                flexShrink: 0,
            }}>
                {label}
            </h2>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: '#e2e2e2' }} />
        </div>
    )
}
