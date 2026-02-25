import { getFont, getLineHeightVal, formatBullets } from './templateHelpers'

// ── Design mode typography map ────────────────────────────────────────────────
const DM = {
    'executive-minimal': { namePt: '20pt', nameWt: '700', nameSpacing: '-0.3px', labelSz: '7.5pt', labelSpacing: '1.6px', bodySz: '9pt', lineGap: '18px' },
    'global-executive': { namePt: '21pt', nameWt: '700', nameSpacing: '-0.4px', labelSz: '7.5pt', labelSpacing: '1.4px', bodySz: '9.5pt', lineGap: '22px' },
    'modern-infrastructure': { namePt: '19pt', nameWt: '800', nameSpacing: '-0.1px', labelSz: '7pt', labelSpacing: '2px', bodySz: '8.5pt', lineGap: '16px' },
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
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh, margin: '0 0 8px 0', textAlign: 'justify' }}>
                    {career.summary}
                </p>
                {/* Executive scale statement — replaces infographic block */}
                {career.executiveScale && (
                    <p style={{ fontFamily: font.body, fontSize: '7.5pt', color: '#777', margin: 0, letterSpacing: '0.2px' }}>
                        {career.executiveScale}
                    </p>
                )}
            </div>
        ),

        skills: () => vis.skills !== false && (
            <div key="skills" style={{ marginBottom: dm.lineGap }}>
                <SH label="Core Competencies" clr={clr} font={font} dm={dm} />
                {/* Plain text three-column — no boxes, no tinted backgrounds */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 28px' }}>
                    {[
                        { label: 'Technical', items: career.skills?.technical },
                        { label: 'Governance', items: career.skills?.governance },
                        { label: 'Leadership', items: career.skills?.leadership },
                    ].map(({ label, items }) => items?.length > 0 && (
                        <div key={label}>
                            <p style={{ fontFamily: font.body, fontSize: '7pt', color: clr, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px 0' }}>{label}</p>
                            {items.map((s, i) => (
                                <p key={i} style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: '1.5', margin: '0 0 2px 0' }}>{s}</p>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div>
                                <span style={{ fontFamily: font.heading, fontSize: '10pt', fontWeight: '700', color: '#0f0f0f' }}>{exp.role}</span>
                                {exp.company && (
                                    <span style={{ fontFamily: font.body, fontSize: '9pt', color: '#555', marginLeft: '6px', fontWeight: '400' }}>— {exp.company}</span>
                                )}
                            </div>
                            <span style={{ fontFamily: font.body, fontSize: '8pt', color: '#777', flexShrink: 0, marginLeft: '14px', fontStyle: 'italic' }}>
                                {exp.period}{exp.location ? `  ·  ${exp.location}` : ''}
                            </span>
                        </div>
                        {/* Thin accent rule below role header */}
                        <div style={{ width: '24px', height: '1px', backgroundColor: clr, opacity: 0.4, margin: '5px 0 7px 0' }} />
                        {/* Achievements — plain bullets, no icon */}
                        {formatBullets(exp.achievements).map((ach, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '3px' }}>
                                <span style={{ fontFamily: font.body, fontSize: '9pt', color: '#888', flexShrink: 0, lineHeight: lh }}>–</span>
                                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh, margin: 0 }}>
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
                {/* Plain inline list with separators — no boxes */}
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: '1.7', margin: 0 }}>
                    {career.certifications.filter(c => c.name).map((cert, i, arr) => (
                        <span key={cert.id}>
                            {cert.name}{cert.year ? ` (${cert.year})` : ''}
                            {cert.issuer ? `, ${cert.issuer}` : ''}
                            {i < arr.length - 1 ? '  ·  ' : ''}
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
                            <span style={{ fontFamily: font.heading, fontSize: '9.5pt', fontWeight: '600', color: '#111' }}>
                                {edu.degree}{edu.field ? `, ${edu.field}` : ''}
                            </span>
                            {edu.institution && (
                                <div style={{ fontFamily: font.body, fontSize: '8.5pt', color: '#555', marginTop: '1px' }}>{edu.institution}</div>
                            )}
                        </div>
                        {edu.year && (
                            <span style={{ fontFamily: font.body, fontSize: '8pt', color: '#888', flexShrink: 0, marginLeft: '12px', fontStyle: 'italic' }}>{edu.year}</span>
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
            <div style={{ padding: `${my} ${mx} 14px` }}>
                <h1 style={{ fontFamily: font.heading, fontSize: dm.namePt, fontWeight: dm.nameWt, color: '#080808', margin: '0 0 3px 0', letterSpacing: dm.nameSpacing }}>
                    {career.profile?.name || 'Your Name'}
                </h1>
                <p style={{ fontFamily: font.body, fontSize: '9pt', color: clr, fontWeight: '600', margin: '0 0 8px 0', letterSpacing: '0.15px' }}>
                    {career.profile?.title || 'Professional Title'}
                </p>
                {/* Thin accent rule — single, not thick */}
                <div style={{ width: '100%', height: '0.75px', backgroundColor: clr, marginBottom: '8px', opacity: 0.7 }} />
                {/* Contact row — pipe-separated, no icons */}
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {contactItems.map((item, i) => (
                        <span key={i} style={{ fontFamily: font.body, fontSize: '7.5pt', color: '#555' }}>
                            {item}
                            {i < contactItems.length - 1 && (
                                <span style={{ color: '#ccc', margin: '0 8px' }}>|</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{
                fontFamily: font.body, fontSize: dm.labelSz, fontWeight: '600',
                color: '#111', margin: 0,
                textTransform: 'uppercase', letterSpacing: dm.labelSpacing,
                flexShrink: 0,
            }}>
                {label}
            </h2>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: '#d4d4d4' }} />
        </div>
    )
}
