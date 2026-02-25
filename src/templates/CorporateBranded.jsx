import { getFont, getLineHeightVal, formatBullets } from './templateHelpers'

const DM = {
    'corporate-branded': { nameSz: '20pt', nameWt: '700', labelSz: '7.5pt', labelLsp: '1.2px', bodySz: '9pt', sectionGap: '18px', bandOpacity: 1 },
    'board-minimal': { nameSz: '21pt', nameWt: '700', labelSz: '7.5pt', labelLsp: '1.6px', bodySz: '9.5pt', sectionGap: '22px', bandOpacity: 0 },
}

export default function CorporateBranded({ career, accentColor, fontPair, marginSize, lineSpacing, designMode, preview }) {
    const font = getFont(fontPair)
    const lh = getLineHeightVal(lineSpacing)
    const clr = accentColor || '#C9A84C'
    const dm = DM[designMode] || DM['corporate-branded']
    const vis = career.sectionVisibility || {}
    const isBoardMinimal = designMode === 'board-minimal'

    const mx = marginSize === 'tight' ? '26px' : marginSize === 'spacious' ? '54px' : '42px'
    const my = marginSize === 'tight' ? '22px' : marginSize === 'spacious' ? '46px' : '34px'

    const edPri = career.educationPriority || 'standard'
    let defaultOrder = ['summary', 'skills', 'experiences', 'certifications', 'education']
    if (edPri === 'mid') defaultOrder = ['summary', 'education', 'skills', 'experiences', 'certifications']
    if (edPri === 'academic') defaultOrder = ['education', 'summary', 'skills', 'experiences', 'certifications']
    const order = career.sectionOrder?.filter(s => s !== 'keyStats') || defaultOrder

    const contactItems = [
        career.profile?.email,
        career.profile?.phone,
        career.profile?.location,
        career.profile?.linkedin,
        career.profile?.website,
    ].filter(Boolean)

    const wrapStyle = preview
        ? { background: '#fff', boxShadow: '0 2px 32px rgba(0,0,0,0.18)', width: '100%', minHeight: '1090px' }
        : { background: '#fff', width: '100%' }

    const renders = {
        summary: () => vis.summary !== false && (
            <div key="summary" style={{ marginBottom: dm.sectionGap }}>
                <SH label="Professional Summary" clr={clr} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2d2d2d', lineHeight: lh, textAlign: 'justify', margin: '0 0 10px 0' }}>
                    {career.summary}
                </p>
                {career.executiveScale && (
                    <p style={{ fontFamily: font.body, fontSize: '7.5pt', color: '#666', fontWeight: '500', letterSpacing: '0.2px', margin: 0 }}>
                        {career.executiveScale}
                    </p>
                )}
            </div>
        ),

        skills: () => vis.skills !== false && (
            <div key="skills" style={{ marginBottom: dm.sectionGap }}>
                <SH label="Core Competencies" clr={clr} font={font} dm={dm} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { label: 'Technical', items: career.skills?.technical },
                        { label: 'Governance', items: career.skills?.governance },
                        { label: 'Leadership', items: career.skills?.leadership },
                    ].map(({ label, items }) => items?.length > 0 && (
                        <div key={label} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <p style={{ width: '80px', flexShrink: 0, fontFamily: font.body, fontSize: '6.5pt', color: clr, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px', marginTop: '2px' }}>{label}</p>
                            <p style={{ flex: 1, fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: '1.45', margin: 0 }}>
                                {items.join('  ·  ')}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        ),

        experiences: () => vis.experiences !== false && (
            <div key="experiences" style={{ marginBottom: dm.sectionGap }}>
                <SH label="Professional Experience" clr={clr} font={font} dm={dm} />
                {career.experiences.filter(e => e.role).map((exp) => (
                    <div key={exp.id} style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div>
                                <span style={{ fontFamily: font.heading, fontSize: '10pt', fontWeight: '700', color: '#000' }}>{exp.role}</span>
                                {exp.company && <span style={{ fontFamily: font.body, fontSize: '9pt', color: '#555', marginLeft: '6px' }}>— {exp.company}</span>}
                            </div>
                            <span style={{ fontFamily: font.body, fontSize: '8pt', color: '#777', fontStyle: 'italic' }}>{exp.period}{exp.location ? `  ·  ${exp.location}` : ''}</span>
                        </div>
                        <div style={{ width: '24px', height: '1px', backgroundColor: clr, opacity: 0.4, margin: '5px 0 7px 0' }} />
                        {exp.achievements.map((ach, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '3px' }}>
                                <span style={{ fontFamily: font.body, fontSize: '9pt', color: '#888', lineHeight: lh }}>–</span>
                                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh, margin: 0 }}>{ach.text}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        ),

        certifications: () => vis.certifications !== false && (
            <div key="certifications" style={{ marginBottom: dm.sectionGap }}>
                <SH label="Certifications" clr={clr} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: '1.7', margin: 0 }}>
                    {career.certifications.filter(c => c.name).map((c, i, arr) => (
                        <span key={c.id}>{c.name}{c.year ? ` (${c.year})` : ''}{c.issuer ? `, ${c.issuer}` : ''}{i < arr.length - 1 ? '  ·  ' : ''}</span>
                    ))}
                </p>
            </div>
        ),

        education: () => vis.education !== false && (
            <div key="education" style={{ marginBottom: dm.sectionGap }}>
                <SH label="Education" clr={clr} font={font} dm={dm} />
                {career.education.filter(e => e.degree).map((edu) => (
                    <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <div>
                            <span style={{ fontFamily: font.heading, fontSize: '9.5pt', fontWeight: '600', color: '#111' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</span>
                            {edu.institution && <div style={{ fontFamily: font.body, fontSize: '8.5pt', color: '#555' }}>{edu.institution}</div>}
                        </div>
                        {edu.year && <span style={{ fontFamily: font.body, fontSize: '8pt', color: '#888', fontStyle: 'italic' }}>{edu.year}</span>}
                    </div>
                ))}
            </div>
        ),
        referees: () => vis.referees !== false && career.referees && (
            <div key="referees" style={{ marginBottom: dm.sectionGap }}>
                <SH label="Referees" clr={clr} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2d2d2d', lineHeight: lh, textAlign: 'justify', margin: '0 0 10px 0' }}>
                    {career.referees}
                </p>
            </div>
        ),
        keyStats: () => null,
    }

    return (
        <div style={wrapStyle}>
            <header style={{
                position: 'relative', overflow: 'hidden', padding: `30px ${mx} 24px`,
                background: isBoardMinimal ? '#fff' : `${clr}08`,
                borderBottom: isBoardMinimal ? `1px solid ${clr}20` : 'none'
            }}>
                {!isBoardMinimal && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: clr }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontFamily: font.heading, fontSize: dm.nameSz, fontWeight: dm.nameWt, color: '#000', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                            {career.profile?.name}
                        </h1>
                        <p style={{ fontFamily: font.body, fontSize: '9.5pt', color: clr, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {career.profile?.title}
                        </p>
                    </div>
                    {career.profile?.photo && (
                        <img src={career.profile.photo} alt="" style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '4px', border: `1px solid ${clr}30` }} />
                    )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px', marginTop: '12px' }}>
                    {contactItems.map((item, i) => (
                        <span key={i} style={{ fontFamily: font.body, fontSize: '7.5pt', color: '#555' }}>
                            {item}{i < contactItems.length - 1 && <span style={{ color: '#ccc', marginLeft: '12px' }}>|</span>}
                        </span>
                    ))}
                </div>
            </header>
            <div style={{ padding: `24px ${mx} ${my}` }}>
                {order.map(id => renders[id] ? renders[id]() : null)}
            </div>
        </div>
    )
}

function SH({ label, clr, font, dm }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontFamily: font.body, fontSize: dm.labelSz, fontWeight: '700', color: '#111', textTransform: 'uppercase', letterSpacing: dm.labelLsp }}>{label}</h2>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: '#e2e2e2' }} />
        </div>
    )
}
