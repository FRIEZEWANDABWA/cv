import { getFont, getLineHeightVal } from './templateHelpers'
import { cleanAndCapitalizeSkill } from '../modules/cv-designer/textUtils'

const DM = {
    'corporate-branded': { nameSz: '22pt', nameWt: '700', nameSpacing: '0.4px', labelSz: '8pt', labelLsp: '1.8px', bodySz: '9pt', sectionGap: '20px', bandOpacity: 1 },
    'board-minimal': { nameSz: '23pt', nameWt: '700', nameSpacing: '0.2px', labelSz: '8pt', labelLsp: '2.2px', bodySz: '9.5pt', sectionGap: '22px', bandOpacity: 0 },
    'executive-standard': { nameSz: '24pt', nameWt: '700', nameSpacing: '0px', labelSz: '13pt', labelLsp: '1px', bodySz: '11pt', sectionGap: '28px', bandOpacity: 1 },
}

// ── Unified skill group list ─────────
const SKILL_GROUPS_ALL = [
    { key: 'ictLeadership', label: 'ICT Strategy & Leadership' },
    { key: 'cloudInfrastructure', label: 'Cloud & Infrastructure' },
    { key: 'cybersecurity', label: 'Cybersecurity & Governance' },
    { key: 'businessOperations', label: 'Business & Operations' },
    { key: 'technical', label: 'Technical' },
    { key: 'governance', label: 'Governance' },
    { key: 'leadership', label: 'Leadership' },
]

// ── Skills layout renderers (shared across templates) ─────────────────────────
function renderSkillsColumns({ skills = {}, font, dm, clr, columns = 2, skillLabels = {} }) {
    const allKeys = [...new Set([...SKILL_GROUPS_ALL.map(g => g.key), ...Object.keys(skills)])]
    const active = allKeys.filter(k => skills[k]?.length > 0)
    const colTemplate = `repeat(${Math.min(columns, active.length || 1)}, 1fr)`
    return (
        <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: '10px 24px' }}>
            {active.map((key) => {
                const group = SKILL_GROUPS_ALL.find(g => g.key === key) || { key, label: key }
                return (
                    <div key={key}>
                        <p style={{ fontFamily: font.body, fontSize: '7pt', color: clr, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px 0' }}>{skillLabels[key] || group.label}</p>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                            {skills[key].map((s, i) => (
                                <li key={i} style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#444', lineHeight: '1.5', margin: '0 0 2px 0' }}>• {cleanAndCapitalizeSkill(s)}</li>
                            ))}
                        </ul>
                    </div>
                )
            })}
        </div>
    )
}

function renderSkillsCompact({ skills = {}, font, dm, clr, skillLabels = {} }) {
    const allKeys = [...new Set([...SKILL_GROUPS_ALL.map(g => g.key), ...Object.keys(skills)])]
    const active = allKeys.filter(k => skills[k]?.length > 0)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {active.map((key) => {
                const group = SKILL_GROUPS_ALL.find(g => g.key === key) || { key, label: key }
                return (
                    <div key={key} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: font.body, fontSize: '7pt', color: clr, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px', width: '115px', flexShrink: 0, paddingTop: '2px' }}>{skillLabels[key] || group.label}</span>
                        <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#444', lineHeight: '1.5', margin: 0, flex: 1 }}>
                            {skills[key].map(s => cleanAndCapitalizeSkill(s)).join('  ·  ')}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}

function renderSkillsBadge({ skills = {}, font, dm, clr }) {
    const allKeys = [...new Set([...SKILL_GROUPS_ALL.map(g => g.key), ...Object.keys(skills)])]
    const allItems = allKeys.flatMap(k => (skills[k] || []).map(s => cleanAndCapitalizeSkill(s)))
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 8px' }}>
            {allItems.map((s, i) => (
                <span key={i} style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', background: `${clr}12`, border: `0.5px solid ${clr}35`, borderRadius: '3px', padding: '2px 8px', lineHeight: '1.5' }}>{s}</span>
            ))}
        </div>
    )
}

function renderSkillsInline({ skills = {}, font, dm, clr, skillLabels = {} }) {
    const allKeys = [...new Set([...SKILL_GROUPS_ALL.map(g => g.key), ...Object.keys(skills)])]
    const active = allKeys.filter(k => skills[k]?.length > 0)
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 28px' }}>
            {active.map((key) => {
                const group = SKILL_GROUPS_ALL.find(g => g.key === key) || { key, label: key }
                return (
                    <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ fontFamily: font.body, fontSize: '7pt', color: clr, fontWeight: '700', flexShrink: 0 }}>▸</span>
                        <div>
                            <span style={{ fontFamily: font.body, fontSize: '7pt', color: '#111', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: '4px' }}>{skillLabels[key] || group.label}:</span>
                            <span style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#444', lineHeight: '1.5' }}>{skills[key].map(s => cleanAndCapitalizeSkill(s)).join(', ')}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const SKILLS_LAYOUTS = {
    columns2: (p) => renderSkillsColumns({ ...p, columns: 2 }),
    columns3: (p) => renderSkillsColumns({ ...p, columns: 3 }),
    compact: (p) => renderSkillsCompact(p),
    badge: (p) => renderSkillsBadge(p),
    inline: (p) => renderSkillsInline(p),
}

const CERT_LAYOUTS = {
    line: ({ certs, font, dm, clr, lh }) => (
        <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: lh, margin: 0 }}>
            {certs.map((cert, i, arr) => (
                <span key={cert.id}>
                    {cert.name}{cert.year ? ` (${cert.year})` : ''}
                    {cert.issuer ? `, ${cert.issuer}` : ''}
                    {i < arr.length - 1 ? '  ·  ' : ''}
                </span>
            ))}
        </p>
    ),
    grid: ({ certs, font, dm, clr }) => (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4px 24px' }}>
            {certs.map((cert) => (
                <div key={cert.id} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '9pt', color: clr, flexShrink: 0 }}>•</span>
                    <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', margin: 0, lineHeight: '1.2' }}>
                        <span style={{ fontWeight: '600' }}>{cert.name}</span>
                        {cert.issuer && <span style={{ color: '#666', fontSize: '0.9em' }}> — {cert.issuer}</span>}
                    </p>
                </div>
            ))}
        </div>
    ),
    list: ({ certs, font, dm, clr }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {certs.map((cert) => (
                <div key={cert.id} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                    <span style={{ color: clr, flexShrink: 0 }}>•</span>
                    <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', margin: 0, lineHeight: '1.2' }}>
                        <span style={{ fontWeight: '600' }}>{cert.name}</span>
                        {cert.issuer && <span style={{ color: '#555', marginLeft: '6px' }}>— {cert.issuer}</span>}
                        {cert.year && <span style={{ color: '#888', fontStyle: 'italic', marginLeft: '8px', fontSize: '0.9em' }}>{cert.year}</span>}
                    </p>
                </div>
            ))}
        </div>
    )
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
    let defaultOrder = ['summary', 'strategicImpact', 'skills', 'experiences', 'certifications', 'education', 'techEnvironment']
    if (edPri === 'mid') defaultOrder = ['summary', 'strategicImpact', 'education', 'skills', 'experiences', 'certifications', 'techEnvironment']
    if (edPri === 'academic') defaultOrder = ['education', 'summary', 'strategicImpact', 'skills', 'experiences', 'certifications', 'techEnvironment']

    // Fallback
    let order = career.sectionOrder?.filter(s => s !== 'keyStats' && s !== 'keyAchievements') || defaultOrder
    if (!order.includes('strategicImpact')) order.splice(1, 0, 'strategicImpact')
    if (!order.includes('techEnvironment')) order.push('techEnvironment')

    order = [...new Set(order)]

    const skillsLayout = career.skillsLayout || 'columns2'
    const skillsRenderer = SKILLS_LAYOUTS[skillsLayout] || SKILLS_LAYOUTS.columns2

    const contactItems = [
        career.profile?.email,
        career.profile?.phone,
        career.profile?.location,
        career.profile?.linkedin,
        career.profile?.website,
    ].filter(Boolean)

    const wrapStyle = preview
        ? { background: '#fff', boxShadow: '0 2px 32px rgba(0,0,0,0.18)', width: '100%', minHeight: '1122px', position: 'relative' }
        : { background: '#fff', width: '100%' }

    const renders = {
        summary: () => vis.summary !== false && (
            <div key="summary" style={{ marginBottom: dm.sectionGap }}>
                <SH label={career.sectionLabels?.summary || "Professional Summary"} clr={clr} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2d2d2d', lineHeight: lh, textAlign: 'justify', margin: 0 }}>
                    {career.summary}
                </p>
            </div>
        ),

        strategicImpact: () => {
            const impactItems = (career.strategicImpact && career.strategicImpact.length > 0)
                ? career.strategicImpact
                : (career.keyAchievements && career.keyAchievements.length > 0 ? career.keyAchievements : [])

            if (vis.strategicImpact === false || impactItems.length === 0) return null

            return (
                <div key="strategicImpact" style={{ marginBottom: dm.sectionGap }}>
                    <SH label={career.sectionLabels?.strategicImpact || "Strategic IT Leadership Impact"} clr={clr} font={font} dm={dm} />
                    {impactItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'flex-start' }}>
                            <span style={{ fontFamily: font.body, fontSize: '10pt', color: clr, lineHeight: lh, flexShrink: 0 }}>•</span>
                            <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2d2d2d', lineHeight: lh, margin: 0 }}>{item}</p>
                        </div>
                    ))}
                </div>
            )
        },

        keyAchievements: () => null,
        keyStats: () => null,

        skills: () => {
            const hasSkills = Object.keys(career.skills || {}).some(k => career.skills[k]?.length > 0)
            if (vis.skills === false || !hasSkills) return null
            return (
                <div key="skills" style={{ marginBottom: dm.sectionGap }}>
                    <SH label={career.sectionLabels?.skills || "Core Competencies"} clr={clr} font={font} dm={dm} />
                    {skillsRenderer({ skills: career.skills, font, dm, clr, skillLabels: career.skillLabels })}
                </div>
            )
        },

        experiences: () => vis.experiences !== false && (
            <div key="experiences" style={{ marginBottom: dm.sectionGap }}>
                <SH label={career.sectionLabels?.experiences || "Professional Experience"} clr={clr} font={font} dm={dm} />
                {career.experiences.filter(e => e.role).map((exp) => (
                    <div key={exp.id} style={{ marginBottom: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div>
                                <span style={{ fontFamily: font.heading, fontSize: '10pt', fontWeight: '700', color: '#000' }}>{exp.role}</span>
                                {exp.company && <span style={{ fontFamily: font.body, fontSize: '9pt', color: '#555', marginLeft: '6px' }}>— {exp.company}</span>}
                            </div>
                            <span style={{ fontFamily: font.body, fontSize: '8pt', color: '#777', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                                {exp.period}{exp.location ? `  ·  ${exp.location}` : ''}
                            </span>
                        </div>
                        <div style={{ width: '24px', height: '1px', backgroundColor: clr, opacity: 0.4, margin: '4px 0 6px 0' }} />
                        {exp.achievements.map((ach, i) => (
                            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '4px', alignItems: 'flex-start' }}>
                                <span style={{ fontFamily: font.body, fontSize: '10pt', color: clr, lineHeight: lh, flexShrink: 0 }}>•</span>
                                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: lh, margin: 0 }}>{ach.text}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        ),

        certifications: () => {
            const certs = (career.certifications || []).filter(c => c.name)
            if (vis.certifications === false || certs.length === 0) return null
            const layout = career.certificationsLayout || 'line'
            const renderer = CERT_LAYOUTS[layout] || CERT_LAYOUTS.line
            return (
                <div key="certifications" style={{ marginBottom: dm.sectionGap }}>
                    <SH label={career.sectionLabels?.certifications || "Certifications"} clr={clr} font={font} dm={dm} />
                    {renderer({ certs, font, dm, clr, lh })}
                </div>
            )
        },

        education: () => vis.education !== false && (
            <div key="education" style={{ marginBottom: dm.sectionGap }}>
                <SH label={career.sectionLabels?.education || "Education"} clr={clr} font={font} dm={dm} />
                {career.education.filter(e => e.degree).map((edu) => (
                    <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <div>
                            <span style={{ fontFamily: font.heading, fontSize: '9.5pt', fontWeight: '600', color: '#111' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</span>
                            {edu.institution && <div style={{ fontFamily: font.body, fontSize: '8.5pt', color: '#555' }}>{edu.institution}</div>}
                        </div>
                        {edu.year && <span style={{ fontFamily: font.body, fontSize: '8pt', color: '#888', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '8px' }}>{edu.year}</span>}
                    </div>
                ))}
            </div>
        ),

        techEnvironment: () => {
            const defaultTech = "Microsoft 365 • Microsoft Azure • AWS • Cisco Networking • Fortinet Security • Active Directory • SD-WAN • LAN/WAN Infrastructure • Endpoint Security • Backup & Disaster Recovery • Network Monitoring Tools • Virtualization Platforms"
            const textToRender = career.techEnvironment || defaultTech
            if (vis.techEnvironment === false) return null
            return (
                <div key="techEnvironment" style={{ marginBottom: dm.sectionGap }}>
                    <SH label={career.sectionLabels?.techEnvironment || "Technology Environment"} clr={clr} font={font} dm={dm} />
                    <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#444', lineHeight: '1.6', margin: 0 }}>
                        {textToRender}
                    </p>
                </div>
            )
        },

        referees: () => vis.referees !== false && career.referees && (
            <div key="referees" style={{ marginBottom: dm.sectionGap }}>
                <SH label={career.sectionLabels?.referees || "Referees"} clr={clr} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2d2d2d', lineHeight: lh, margin: 0 }}>
                    {career.referees}
                </p>
            </div>
        ),
    }

    const PAGE_HEIGHT = 1103

    return (
        <div style={wrapStyle}>
            {preview && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: `${PAGE_HEIGHT}px`, left: 0, right: 0, borderBottom: '2px dashed #ff4444', opacity: 0.8, display: 'flex', justifyContent: 'center' }}>
                        <span style={{ position: 'absolute', top: -8, background: '#ff4444', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.5px' }}>✂️ A4 PAGE 1 ENDS HERE ✂️</span>
                    </div>
                    <div style={{ position: 'absolute', top: `${PAGE_HEIGHT * 2}px`, left: 0, right: 0, borderBottom: '2px dashed #ff4444', opacity: 0.8, display: 'flex', justifyContent: 'center' }}>
                        <span style={{ position: 'absolute', top: -8, background: '#ff4444', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.5px' }}>✂️ A4 PAGE 2 ENDS HERE ✂️</span>
                    </div>
                </div>
            )}
            <header style={{
                position: 'relative', overflow: 'hidden', padding: `28px ${mx} 20px`, zIndex: 2,
                background: isBoardMinimal ? '#fff' : `${clr}08`,
                borderBottom: isBoardMinimal ? `1px solid ${clr}20` : 'none'
            }}>
                {!isBoardMinimal && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: clr }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontFamily: font.heading, fontSize: dm.nameSz, fontWeight: dm.nameWt, color: '#000', margin: '0 0 5px 0', letterSpacing: dm.nameSpacing }}>
                            {career.profile?.name}
                        </h1>
                        <div style={{ width: '60px', height: '1.5px', backgroundColor: clr, marginBottom: '9px', opacity: 0.8 }} />
                        <p style={{ fontFamily: font.body, fontSize: '9.5pt', color: clr, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                            {career.profile?.title}
                        </p>
                    </div>
                    {career.profile?.photo && (
                        <img src={career.profile.photo} alt="" style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '4px', border: `1px solid ${clr}30` }} />
                    )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 8px', marginTop: '14px' }}>
                    {contactItems.map((item, i) => (
                        <span key={i} style={{ fontFamily: font.body, fontSize: '7.8pt', color: '#666', fontWeight: '300' }}>
                            {item}{i < contactItems.length - 1 && <span style={{ color: '#ccc', marginLeft: '8px', fontWeight: '300' }}>|</span>}
                        </span>
                    ))}
                </div>
            </header>
            <div style={{ padding: `20px ${mx} ${my}` }}>
                {order.map(id => renders[id] ? renders[id]() : null)}
            </div>
        </div>
    )
}

function SH({ label, clr, font, dm }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', marginTop: '4px' }}>
            <h2 style={{ fontFamily: font.body, fontSize: dm.labelSz, fontWeight: '700', color: '#111', textTransform: 'uppercase', letterSpacing: dm.labelLsp, whiteSpace: 'nowrap' }}>{label}</h2>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: '#e2e2e2' }} />
        </div>
    )
}
