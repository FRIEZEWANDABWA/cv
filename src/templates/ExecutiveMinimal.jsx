import { getFont, getLineHeightVal, formatBullets } from './templateHelpers'
import { cleanAndCapitalizeSkill } from '../modules/cv-designer/textUtils'

// ── Design mode typography map ────────────────────────────────────────────────
const DM = {
    'executive-minimal': { namePt: '22pt', nameWt: '700', nameSpacing: '0.5px', labelSz: '8pt', labelSpacing: '2px', bodySz: '9pt', lineGap: '24px' },
    'global-executive': { namePt: '23pt', nameWt: '700', nameSpacing: '0.3px', labelSz: '8pt', labelSpacing: '1.8px', bodySz: '9.5pt', lineGap: '26px' },
    'modern-infrastructure': { namePt: '21pt', nameWt: '800', nameSpacing: '0.7px', labelSz: '7.5pt', labelSpacing: '2.5px', bodySz: '8.5pt', lineGap: '20px' },
    'executive-standard': { namePt: '24pt', nameWt: '700', nameSpacing: '0px', labelSz: '13pt', labelSpacing: '1px', bodySz: '11pt', lineGap: '28px' },
}

// ── Skill groups — supports both legacy and new 4-category schema ─────────────
const SKILL_GROUPS_ALL = [
    { key: 'ictLeadership', label: 'ICT Strategy & Leadership' },
    { key: 'cloudInfrastructure', label: 'Cloud & Infrastructure' },
    { key: 'cybersecurity', label: 'Cybersecurity & Governance' },
    { key: 'businessOperations', label: 'Business & Operations' },
    { key: 'technical', label: 'Technical' },
    { key: 'governance', label: 'Governance' },
    { key: 'leadership', label: 'Leadership' },
]

// ── Skills layout renderers (shared) ───────────────────────────────────────
function renderSkillsColumns({ skills = {}, font, dm, clr, columns = 3, skillLabels = {} }) {
    const allKeys = [...new Set([...SKILL_GROUPS_ALL.map(g => g.key), ...Object.keys(skills)])]
    const active = allKeys.filter(k => skills[k]?.length > 0)
    const colTemplate = `repeat(${Math.min(columns, active.length || 1)}, 1fr)`
    return (
        <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: '12px 24px' }}>
            {active.map((key) => {
                const group = SKILL_GROUPS_ALL.find(g => g.key === key) || { key, label: key }
                return (
                    <div key={key}>
                        <p style={{ fontFamily: font.body, fontSize: '8pt', color: clr, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' }}>{skillLabels[key] || group.label}</p>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                            {skills[key].map((s, i) => (
                                <li key={i} style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#444', lineHeight: '1.55', margin: '0 0 3px 0' }}>• {cleanAndCapitalizeSkill(s)}</li>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {active.map((key) => {
                const group = SKILL_GROUPS_ALL.find(g => g.key === key) || { key, label: key }
                return (
                    <div key={key} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: font.body, fontSize: '7.5pt', color: clr, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px', width: '135px', flexShrink: 0, paddingTop: '1px' }}>{skillLabels[key] || group.label}</span>
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
                <span key={i} style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', background: `${clr}10`, border: `0.5px solid ${clr}35`, borderRadius: '3px', padding: '2px 8px', lineHeight: '1.5' }}>{s}</span>
            ))}
        </div>
    )
}

function renderSkillsInline({ skills = {}, font, dm, clr, skillLabels = {} }) {
    const allKeys = [...new Set([...SKILL_GROUPS_ALL.map(g => g.key), ...Object.keys(skills)])]
    const active = allKeys.filter(k => skills[k]?.length > 0)
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '6px 28px' }}>
            {active.map((key) => {
                const group = SKILL_GROUPS_ALL.find(g => g.key === key) || { key, label: key }
                return (
                    <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ fontFamily: font.body, fontSize: '7pt', color: clr, fontWeight: '700', flexShrink: 0 }}>▸</span>
                        <div>
                            <span style={{ fontFamily: font.body, fontSize: '7.5pt', color: '#111', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: '4px' }}>{skillLabels[key] || group.label}:</span>
                            <span style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#444', lineHeight: '1.5' }}>{skills[key].map(s => cleanAndCapitalizeSkill(s)).join(', ')}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const SKILLS_LAYOUTS = {
    columns3: (p) => renderSkillsColumns({ ...p, columns: 3 }),
    columns2: (p) => renderSkillsColumns({ ...p, columns: 2 }),
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
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4px 32px' }}>
            {certs.map((cert) => (
                <div key={cert.id} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '10pt', color: clr, flexShrink: 0 }}>•</span>
                    <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', margin: 0, lineHeight: '1.2' }}>
                        <span style={{ fontWeight: '600' }}>{cert.name}</span>
                        {cert.issuer && <span style={{ color: '#666', fontSize: '0.9em' }}> — {cert.issuer}</span>}
                        {cert.year && <span style={{ color: '#888', fontSize: '0.85em', marginLeft: '6px' }}>({cert.year})</span>}
                    </p>
                </div>
            ))}
        </div>
    ),
    list: ({ certs, font, dm, clr }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

export default function ExecutiveMinimal({ career, accentColor, fontPair, marginSize, lineSpacing, designMode, preview }) {
    const font = getFont(fontPair)
    const lh = getLineHeightVal(lineSpacing)
    const clr = accentColor || '#C9A84C'
    const dm = DM[designMode] || DM['executive-minimal']
    const vis = career.sectionVisibility || {}

    // Margins
    const mx = marginSize === 'tight' ? '26px' : marginSize === 'spacious' ? '54px' : '42px'
    const my = marginSize === 'tight' ? '22px' : marginSize === 'spacious' ? '46px' : '34px'

    // Education priority and order fallback
    const edPri = career.educationPriority || 'standard'
    let defaultOrder = ['summary', 'strategicImpact', 'skills', 'experiences', 'certifications', 'education', 'techEnvironment']
    if (edPri === 'mid') defaultOrder = ['summary', 'strategicImpact', 'education', 'skills', 'experiences', 'certifications', 'techEnvironment']
    if (edPri === 'academic') defaultOrder = ['education', 'summary', 'strategicImpact', 'skills', 'experiences', 'certifications', 'techEnvironment']

    // Fallback: If local cache omits new sections, inject them automatically.
    let order = career.sectionOrder?.filter(s => s !== 'keyStats') || defaultOrder
    if (!order.includes('strategicImpact')) order.splice(1, 0, 'strategicImpact')
    if (!order.includes('techEnvironment')) order.push('techEnvironment')

    // Clean up to ensure no dupes
    order = [...new Set(order)]

    // Active skills layout
    const skillsLayout = career.skillsLayout || 'columns3'
    const skillsRenderer = SKILLS_LAYOUTS[skillsLayout] || SKILLS_LAYOUTS.columns3

    // Contact pipe row
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

    const BODY_STYLE = { fontFamily: font.body, fontSize: dm.bodySz, color: '#444', lineHeight: '1.6', margin: 0 }

    const renders = {

        summary: () => vis.summary !== false && career.summary?.trim() && (
            <div key="summary" style={{ marginBottom: dm.lineGap }}>
                <SH label={career.sectionLabels?.summary || "Professional Summary"} clr={clr} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh, margin: '0 0 8px 0', textAlign: 'justify' }}>
                    {career.summary}
                </p>
                {career.executiveScale && (
                    <p style={{ fontFamily: font.body, fontSize: '7.5pt', color: '#777', margin: 0, letterSpacing: '0.2px' }}>
                        {career.executiveScale}
                    </p>
                )}
            </div>
        ),

        strategicImpact: () => {
            const impactItems = (career.strategicImpact && career.strategicImpact.length > 0)
                ? career.strategicImpact
                : (career.keyAchievements && career.keyAchievements.length > 0 ? career.keyAchievements : [])

            if (vis.strategicImpact === false || impactItems.length === 0) return null

            return (
                <div key="strategicImpact" style={{ marginBottom: dm.lineGap }}>
                    <SH label={career.sectionLabels?.strategicImpact || "Strategic IT Leadership Impact"} clr={clr} font={font} dm={dm} />
                    {impactItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'flex-start' }}>
                            <span style={{ fontFamily: font.body, fontSize: '9pt', color: clr, flexShrink: 0, lineHeight: lh }}>•</span>
                            <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh, margin: 0 }}>{item}</p>
                        </div>
                    ))}
                </div>
            )
        },

        skills: () => {
            const hasSkills = Object.keys(career.skills || {}).some(k => career.skills[k]?.length > 0)
            if (vis.skills === false || !hasSkills) return null
            return (
                <div key="skills" style={{ marginBottom: dm.lineGap }}>
                    <SH label={career.sectionLabels?.skills || "Core Competencies"} clr={clr} font={font} dm={dm} />
                    {skillsRenderer({ skills: career.skills, font, dm, clr, skillLabels: career.skillLabels })}
                </div>
            )
        },

        experiences: () => vis.experiences !== false && career.experiences?.filter(e => e.role).length > 0 && (
            <div key="experiences" style={{ marginBottom: dm.lineGap }}>
                <SH label={career.sectionLabels?.experiences || "Professional Experience"} clr={clr} font={font} dm={dm} />
                {career.experiences.filter(e => e.role).map((exp) => (
                    <div key={exp.id} style={{ marginBottom: '14px' }}>
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
                        <div style={{ width: '24px', height: '1px', backgroundColor: clr, opacity: 0.4, margin: '5px 0 7px 0' }} />
                        {exp.technologies && (
                            <div style={{ marginBottom: '6px' }}>
                                <span style={{ fontFamily: font.body, fontSize: '8pt', color: clr, fontWeight: '600' }}>Technologies: </span>
                                <span style={{ fontFamily: font.body, fontSize: '8pt', color: '#555' }}>
                                    {exp.technologies.split(',').map(t => cleanAndCapitalizeSkill(t.trim())).join(', ')}
                                </span>
                            </div>
                        )}
                        {(exp.achievements || []).map((ach, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '5px', alignItems: 'flex-start' }}>
                                <span style={{ fontFamily: font.body, fontSize: '10pt', color: clr, flexShrink: 0, lineHeight: lh }}>•</span>
                                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: lh, margin: 0 }}>
                                    {ach.text}
                                </p>
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
                <div key="certifications" style={{ marginBottom: dm.lineGap }}>
                    <SH label={career.sectionLabels?.certifications || "Certifications"} clr={clr} font={font} dm={dm} />
                    {renderer({ certs, font, dm, clr, lh })}
                </div>
            )
        },

        education: () => vis.education !== false && career.education?.filter(e => e.degree).length > 0 && (
            <div key="education" style={{ marginBottom: dm.lineGap }}>
                <SH label={career.sectionLabels?.education || "Education"} clr={clr} font={font} dm={dm} />
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

        techEnvironment: () => {
            const defaultTech = "Microsoft 365 • Microsoft Azure • AWS • Cisco Networking • Fortinet Security • Active Directory • SD-WAN • LAN/WAN Infrastructure • Endpoint Security • Backup & Disaster Recovery • Network Monitoring Tools • Virtualization Platforms"
            const textToRender = career.techEnvironment || defaultTech
            if (vis.techEnvironment === false) return null
            return (
                <div key="techEnvironment" style={{ marginBottom: dm.lineGap }}>
                    <SH label={career.sectionLabels?.techEnvironment || "Technology Environment"} clr={clr} font={font} dm={dm} />
                    <p style={BODY_STYLE}>{textToRender}</p>
                </div>
            )
        },

        keyStats: () => null,

        keyAchievements: () => vis.keyAchievements !== false && career.keyAchievements && career.keyAchievements.length > 0 && (
            <div key="keyAchievements" style={{ marginBottom: dm.lineGap }}>
                <SH label={career.sectionLabels?.keyAchievements || "Key Achievements"} clr={clr} font={font} dm={dm} />
                {career.keyAchievements.map((ach, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '6px', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: font.body, fontSize: '10pt', color: clr, flexShrink: 0, lineHeight: lh }}>•</span>
                        <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#333', lineHeight: lh, margin: 0 }}>
                            {ach}
                        </p>
                    </div>
                ))}
            </div>
        ),

        referees: () => vis.referees !== false && career.referees && (
            <div key="referees" style={{ marginBottom: dm.lineGap }}>
                <SH label={career.sectionLabels?.referees || "Referees"} clr={clr} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh, margin: '0 0 8px 0' }}>
                    {career.referees}
                </p>
            </div>
        ),
    }

    // A4 aspect ratio helper (width * 1.414 = height). For 780px max-width, it's roughly 1103px.
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
            {/* ── Header ── */}
            <div style={{ padding: `${my} ${mx} 20px`, position: 'relative', zIndex: 2 }}>
                <h1 style={{ fontFamily: font.heading, fontSize: dm.namePt, fontWeight: dm.nameWt, color: '#080808', margin: '0 0 6px 0', letterSpacing: dm.nameSpacing }}>
                    {career.profile?.name || 'Your Name'}
                </h1>
                <div style={{ width: '100%', height: '0.5px', backgroundColor: clr, marginBottom: '10px', opacity: 0.4 }} />
                <p style={{ fontFamily: font.body, fontSize: '9.5pt', color: clr, fontWeight: '600', margin: '0 0 10px 0', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    {career.profile?.title || 'Professional Title'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {contactItems.map((item, i) => (
                        <span key={i} style={{ fontFamily: font.body, fontSize: '8pt', color: '#666', fontWeight: '300' }}>
                            {item}
                            {i < contactItems.length - 1 && (
                                <span style={{ color: '#ddd', margin: '0 10px', fontWeight: '300' }}>|</span>
                            )}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: `0 ${mx} ${my}` }}>
                {order.map(id => {
                    const fn = renders[id]
                    return fn ? fn() : null
                })}
            </div>
        </div>
    )
}

// ── Section heading ────────────────────────────────────────────────────────────
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
