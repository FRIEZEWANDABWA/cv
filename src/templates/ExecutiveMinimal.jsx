import { getFont, getLineHeightVal } from './templateHelpers'
import { cleanAndCapitalizeSkill } from '../modules/cv-designer/textUtils'

// ── Design mode typography ─────────────────────────────────────────────────────
const DM = {
    'executive-minimal':     { namePt: '26pt', nameWt: '700', nameSpacing: '2.5px', labelSz: '7pt', labelSpacing: '1px',   bodySz: '9pt',  roleSz: '10pt',  lineGap: '20px' },
    'global-executive':      { namePt: '28pt', nameWt: '700', nameSpacing: '2px',   labelSz: '7pt', labelSpacing: '1px',   bodySz: '9.5pt', roleSz: '10.5pt',lineGap: '22px' },
    'modern-infrastructure': { namePt: '24pt', nameWt: '800', nameSpacing: '3px',   labelSz: '7pt', labelSpacing: '1px',   bodySz: '8.5pt', roleSz: '9.5pt', lineGap: '18px' },
    'executive-standard':    { namePt: '26pt', nameWt: '700', nameSpacing: '2.5px', labelSz: '7pt', labelSpacing: '1px',   bodySz: '9pt',  roleSz: '10pt',  lineGap: '20px' },
}

// ── Palette — fixed executive system ──────────────────────────────────────────
const NAVY    = '#0B1F3A'   // Deep authority
const IVORY   = '#FAF9F6'   // Warm premium background
const CHARCOAL= '#2E2E2E'   // Softer than black, cleaner
const RULE    = '#E0DAD1'   // Warm light divider

// ── Skill groups ───────────────────────────────────────────────────────────────
const SKILL_GROUPS = [
    { key: 'ictLeadership',       label: 'ICT Strategy & Leadership' },
    { key: 'cloudInfrastructure', label: 'Cloud & Infrastructure' },
    { key: 'cybersecurity',       label: 'Cybersecurity & Governance' },
    { key: 'businessOperations',  label: 'Business & Operations' },
    { key: 'technical',           label: 'Technical' },
    { key: 'governance',          label: 'Governance' },
    { key: 'leadership',          label: 'Leadership' },
]

// ── Skill renderers ────────────────────────────────────────────────────────────
function SkillsColumns({ skills = {}, font, dm, gold, columns = 3, skillLabels = {} }) {
    const allKeys = [...new Set([...SKILL_GROUPS.map(g => g.key), ...Object.keys(skills)])]
    const active = allKeys.filter(k => skills[k]?.length > 0)
    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(columns, active.length || 1)}, 1fr)`, gap: '10px 20px' }}>
            {active.map(key => {
                const group = SKILL_GROUPS.find(g => g.key === key) || { label: key }
                return (
                    <div key={key}>
                        <p style={{ fontFamily: font.heading, fontSize: '7pt', color: NAVY, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', margin: '0 0 5px 0', paddingBottom: '3px', borderBottom: `0.8px solid ${gold}60` }}>
                            {skillLabels[key] || group.label}
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {skills[key].map((s, i) => (
                                <li key={i} style={{ fontFamily: font.body, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: '1.5', marginBottom: '2px' }}>
                                    · {cleanAndCapitalizeSkill(s)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            })}
        </div>
    )
}

function SkillsCompact({ skills = {}, font, dm, gold, skillLabels = {} }) {
    const allKeys = [...new Set([...SKILL_GROUPS.map(g => g.key), ...Object.keys(skills)])]
    const active = allKeys.filter(k => skills[k]?.length > 0)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {active.map(key => {
                const group = SKILL_GROUPS.find(g => g.key === key) || { label: key }
                return (
                    <div key={key} style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontFamily: font.heading, fontSize: '7pt', color: NAVY, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', width: '130px', flexShrink: 0 }}>
                            {skillLabels[key] || group.label}
                        </span>
                        <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: '1.5', margin: 0, flex: 1 }}>
                            {skills[key].map(s => cleanAndCapitalizeSkill(s)).join('  ·  ')}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}

function SkillsBadge({ skills = {}, font, dm, gold }) {
    const all = [...new Set([...SKILL_GROUPS.map(g => g.key), ...Object.keys(skills)])].flatMap(k => (skills[k] || []).map(s => cleanAndCapitalizeSkill(s)))
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>
            {all.map((s, i) => (
                <span key={i} style={{ fontFamily: font.body, fontSize: '8pt', color: NAVY, background: `${gold}14`, border: `0.5px solid ${gold}40`, borderRadius: '2px', padding: '2px 8px' }}>{s}</span>
            ))}
        </div>
    )
}

function SkillsInline({ skills = {}, font, dm, gold, skillLabels = {} }) {
    const allKeys = [...new Set([...SKILL_GROUPS.map(g => g.key), ...Object.keys(skills)])]
    const active = allKeys.filter(k => skills[k]?.length > 0)
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 24px' }}>
            {active.map(key => {
                const group = SKILL_GROUPS.find(g => g.key === key) || { label: key }
                return (
                    <div key={key} style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                        <span style={{ color: gold, fontSize: '7pt', flexShrink: 0 }}>▸</span>
                        <span style={{ fontFamily: font.body, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: '1.5' }}>
                            <span style={{ fontWeight: '700', color: NAVY, fontSize: '7pt', fontFamily: font.heading, textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: '4px' }}>{skillLabels[key] || group.label}:</span>
                            {skills[key].map(s => cleanAndCapitalizeSkill(s)).join(', ')}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

const SKILLS_RENDERERS = {
    columns3: (p) => <SkillsColumns {...p} columns={3} />,
    columns2: (p) => <SkillsColumns {...p} columns={2} />,
    compact:  (p) => <SkillsCompact {...p} />,
    badge:    (p) => <SkillsBadge {...p} />,
    inline:   (p) => <SkillsInline {...p} />,
}

// ── Certifications ─────────────────────────────────────────────────────────────
function CertGrid({ certs, font, dm, gold }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 28px' }}>
            {certs.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    {c.year && (
                        <div style={{ background: NAVY, borderRadius: '2px', padding: '2px 5px', flexShrink: 0, marginTop: '2px' }}>
                            <span style={{ fontFamily: font.heading, fontSize: '6pt', color: '#fff', fontWeight: '700', letterSpacing: '0.3px' }}>{c.year}</span>
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: NAVY, fontWeight: '600', margin: 0, lineHeight: '1.3' }}>{c.name}</p>
                        {c.issuer && <p style={{ fontFamily: font.body, fontSize: '7pt', color: '#7a7060', margin: 0, marginTop: '1px' }}>{c.issuer}</p>}
                    </div>
                </div>
            ))}
        </div>
    )
}

function CertLine({ certs, font, dm }) {
    return (
        <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: '1.65', margin: 0 }}>
            {certs.map((c, i, arr) => (
                <span key={c.id}>
                    {c.name}{c.year ? ` (${c.year})` : ''}{c.issuer ? `, ${c.issuer}` : ''}
                    {i < arr.length - 1 ? '  ·  ' : ''}
                </span>
            ))}
        </p>
    )
}

function CertList({ certs, font, dm, gold }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {certs.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                    <span style={{ color: gold, flexShrink: 0 }}>•</span>
                    <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: CHARCOAL, margin: 0, lineHeight: '1.35' }}>
                        <span style={{ fontWeight: '600', color: NAVY }}>{c.name}</span>
                        {c.issuer && <span style={{ color: '#6a6558', marginLeft: '6px' }}>— {c.issuer}</span>}
                        {c.year && <span style={{ color: '#9a8f80', fontStyle: 'italic', marginLeft: '8px' }}>{c.year}</span>}
                    </p>
                </div>
            ))}
        </div>
    )
}

// ── Section heading — navy label + warm rule ───────────────────────────────────
function SH({ label, gold, font, dm }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '4px', height: '4px', background: gold, borderRadius: '1px', flexShrink: 0 }} />
            <h2 style={{ fontFamily: font.heading, fontSize: dm.labelSz, fontWeight: '700', color: NAVY, margin: 0, textTransform: 'uppercase', letterSpacing: dm.labelSpacing, flexShrink: 0 }}>
                {label}
            </h2>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: RULE }} />
        </div>
    )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ExecutiveMinimal({ career, accentColor, fontPair, marginSize, lineSpacing, designMode, preview }) {
    const font = getFont(fontPair)
    const lh   = getLineHeightVal(lineSpacing)
    // Override: always use the curated muted gold as the strategic spine color
    // User-selected accent drives the spine/highlight; we still respect their choice
    const gold = accentColor || '#B08D57'
    const dm   = DM[designMode] || DM['executive-minimal']
    const vis  = career.sectionVisibility || {}

    const mx = marginSize === 'tight' ? '28px' : marginSize === 'spacious' ? '52px' : '40px'
    const my = marginSize === 'tight' ? '22px' : marginSize === 'spacious' ? '44px' : '32px'

    // Section order
    const edPri = career.educationPriority || 'standard'
    let defaultOrder = ['summary', 'strategicImpact', 'skills', 'experiences', 'certifications', 'education', 'techEnvironment', 'referees']
    if (edPri === 'mid')      defaultOrder = ['summary', 'strategicImpact', 'education', 'skills', 'experiences', 'certifications', 'techEnvironment', 'referees']
    if (edPri === 'academic') defaultOrder = ['education', 'summary', 'strategicImpact', 'skills', 'experiences', 'certifications', 'techEnvironment', 'referees']
    let order = career.sectionOrder?.filter(s => s !== 'keyStats') || defaultOrder
    if (!order.includes('strategicImpact')) order.splice(1, 0, 'strategicImpact')
    if (!order.includes('techEnvironment')) order.push('techEnvironment')
    if (!order.includes('referees')) order.push('referees')
    order = [...new Set(order)]

    const skillsRenderer = SKILLS_RENDERERS[career.skillsLayout || 'columns3'] || SKILLS_RENDERERS.columns3

    // Contact row
    const contactItems = [
        career.profile?.email,
        career.profile?.phone,
        career.profile?.location,
        career.profile?.linkedin,
        career.profile?.website,
        career.profile?.github,
    ].filter(Boolean)

    // ── Expertise pillars — job-agnostic, extracted from title pipe-separated ──
    const titlePillars = (career.profile?.title || '')
        .split('|')
        .map(s => s.trim())
        .filter(Boolean)
        .slice(1) // drop first item (usually the role level)

    const softMetrics = (career.keyMetrics || []).filter(Boolean)
    const pillars = softMetrics.length > 0 ? softMetrics : titlePillars

    // ── Stats strip (header bottom band) ──────────────────────────────────────
    const statsStrip = (career.statsStrip || []).filter(Boolean)

    // ── Positioning statement ─────────────────────────────────────────────────
    const posStatement = career.positioningStatement || ''

    // ── SVG dot grid for header texture ──────────────────────────────────────
    const DOT_GRID = `url("data:image/svg+xml,%3Csvg width='22' height='22' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='1.15' fill='rgba(255%2C255%2C255%2C0.1)'/%3E%3C/svg%3E")`

    const PAGE_HEIGHT = 1103

    const wrapStyle = preview
        ? { background: IVORY, boxShadow: '0 4px 48px rgba(11,31,58,0.18)', width: '100%', minHeight: '1122px', position: 'relative', overflow: 'hidden' }
        : { background: IVORY, width: '100%' }

    // ── Section renderers ──────────────────────────────────────────────────────
    const renders = {
        summary: () => vis.summary !== false && career.summary?.trim() && (
            <div key="summary" style={{ marginBottom: dm.lineGap }}>
                <SH label={career.sectionLabels?.summary || 'Professional Summary'} gold={gold} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: lh, margin: 0, textAlign: 'justify' }}>
                    {career.summary}
                </p>
                {career.executiveScale && (
                    <p style={{ fontFamily: font.body, fontSize: '7.5pt', color: '#7a7060', margin: '6px 0 0 0', letterSpacing: '0.2px' }}>
                        {career.executiveScale}
                    </p>
                )}
            </div>
        ),

        strategicImpact: () => {
            const items = career.strategicImpact?.length > 0
                ? career.strategicImpact
                : (career.keyAchievements?.length > 0 ? career.keyAchievements : [])
            if (vis.strategicImpact === false || items.length === 0) return null
            return (
                <div key="strategicImpact" style={{ marginBottom: dm.lineGap }}>
                    <SH label={career.sectionLabels?.strategicImpact || 'Career Highlights'} gold={gold} font={font} dm={dm} />
                    {/* Left gold channel spine — connects all achievements */}
                    <div style={{ borderLeft: `2px solid ${gold}55`, paddingLeft: '14px' }}>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < items.length - 1 ? '8px' : 0, alignItems: 'flex-start' }}>
                                <span style={{ fontFamily: font.heading, fontSize: '9pt', fontWeight: '700', color: gold, flexShrink: 0, lineHeight: lh, minWidth: '20px', letterSpacing: '-0.5px' }}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: lh, margin: 0 }}>
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },

        skills: () => {
            const hasSkills = Object.keys(career.skills || {}).some(k => career.skills[k]?.length > 0)
            if (vis.skills === false || !hasSkills) return null
            return (
                <div key="skills" style={{ marginBottom: dm.lineGap }}>
                    <SH label={career.sectionLabels?.skills || 'Core Competencies'} gold={gold} font={font} dm={dm} />
                    {skillsRenderer({ skills: career.skills, font, dm, gold, skillLabels: career.skillLabels })}
                </div>
            )
        },

        experiences: () => vis.experiences !== false && career.experiences?.filter(e => e.role).length > 0 && (
            <div key="experiences" style={{ marginBottom: dm.lineGap }}>
                <SH label={career.sectionLabels?.experiences || 'Professional Experience'} gold={gold} font={font} dm={dm} />
                {career.experiences.filter(e => e.role).map((exp) => (
                    <div key={exp.id} style={{ marginBottom: '16px' }}>
                        {/* Warm ivory header band — not grey, warm tinted */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                            background: '#F0EDE8',
                            padding: '7px 10px',
                            borderLeft: `3px solid ${gold}`,
                            marginBottom: '7px',
                        }}>
                            <div>
                                <span style={{ fontFamily: font.heading, fontSize: dm.roleSz, fontWeight: '700', color: NAVY }}>{exp.role}</span>
                                {exp.company && (
                                    <div style={{ fontFamily: font.body, fontSize: '8.5pt', color: '#5a5040', marginTop: '2px' }}>
                                        {exp.company}{exp.location ? `  ·  ${exp.location}` : ''}
                                    </div>
                                )}
                            </div>
                            <span style={{ fontFamily: font.body, fontSize: '8pt', color: gold, flexShrink: 0, marginLeft: '12px', fontStyle: 'italic', marginTop: '1px' }}>
                                {exp.period}
                            </span>
                        </div>

                        {/* Scope — client/mandate context */}
                        {exp.scope && (
                            <p style={{ fontFamily: font.body, fontSize: '8.5pt', color: '#5a5040', lineHeight: lh, margin: '0 0 7px 0', fontStyle: 'italic', paddingLeft: '10px', borderLeft: `1px solid ${RULE}` }}>
                                {exp.scope}
                            </p>
                        )}

                        {/* Flagship bullet — ATS-clean: visual highlight via border+bg only, no unicode symbol in text */}
                        {exp.flagshipBullet && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: `${gold}10`, borderLeft: `3px solid ${gold}`, borderRadius: '1px', padding: '6px 10px', marginBottom: '7px' }}>
                                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: NAVY, fontWeight: '600', lineHeight: lh, margin: 0 }}>
                                    {exp.flagshipBullet}
                                </p>
                            </div>
                        )}

                        {/* Tech stack */}
                        {exp.technologies && (
                            <div style={{ marginBottom: '6px', paddingLeft: '2px' }}>
                                <span style={{ fontFamily: font.heading, fontSize: '7.5pt', color: gold, fontWeight: '700' }}>Tech Stack: </span>
                                <span style={{ fontFamily: font.body, fontSize: '7.5pt', color: '#6a6558' }}>
                                    {exp.technologies.split(',').map(t => cleanAndCapitalizeSkill(t.trim())).join('  ·  ')}
                                </span>
                            </div>
                        )}

                        {/* Achievement bullets — dash style */}
                        {(exp.achievements || []).map((ach, i) => (
                            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '4px', alignItems: 'flex-start' }}>
                                <span style={{ fontFamily: font.body, fontSize: '9pt', color: gold, flexShrink: 0, lineHeight: lh, opacity: 0.7, marginTop: '0.5px' }}>–</span>
                                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: lh, margin: 0 }}>
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
            const layout = career.certificationsLayout || 'grid'
            return (
                <div key="certifications" style={{ marginBottom: dm.lineGap }}>
                    <SH label={career.sectionLabels?.certifications || 'Professional Certifications'} gold={gold} font={font} dm={dm} />
                    {layout === 'grid'  && <CertGrid  certs={certs} font={font} dm={dm} gold={gold} />}
                    {layout === 'line'  && <CertLine  certs={certs} font={font} dm={dm} />}
                    {layout === 'list'  && <CertList  certs={certs} font={font} dm={dm} gold={gold} />}
                    {!['grid','line','list'].includes(layout) && <CertGrid certs={certs} font={font} dm={dm} gold={gold} />}
                </div>
            )
        },

        education: () => vis.education !== false && career.education?.filter(e => e.degree).length > 0 && (
            <div key="education" style={{ marginBottom: dm.lineGap }}>
                <SH label={career.sectionLabels?.education || 'Education'} gold={gold} font={font} dm={dm} />
                {career.education.filter(e => e.degree).map((edu) => (
                    <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', paddingLeft: '8px', borderLeft: `2px solid ${gold}30` }}>
                        <div>
                            <span style={{ fontFamily: font.heading, fontSize: dm.roleSz, fontWeight: '600', color: NAVY }}>
                                {edu.degree}{edu.field ? `, ${edu.field}` : ''}
                            </span>
                            {edu.institution && (
                                <div style={{ fontFamily: font.body, fontSize: '8pt', color: '#6a6558', marginTop: '1px' }}>{edu.institution}</div>
                            )}
                        </div>
                        {edu.year && (
                            <span style={{ fontFamily: font.body, fontSize: '8pt', color: gold, flexShrink: 0, marginLeft: '12px', fontStyle: 'italic' }}>{edu.year}</span>
                        )}
                    </div>
                ))}
            </div>
        ),

        techEnvironment: () => {
            if (vis.techEnvironment === false) return null
            const defaultTech = 'Microsoft 365 · Microsoft Azure · AWS · Cisco Networking · Fortinet Security · Active Directory · SD-WAN · LAN/WAN Infrastructure · Endpoint Security · Backup & DR · Network Monitoring · Virtualization'
            return (
                <div key="techEnvironment" style={{ marginBottom: dm.lineGap }}>
                    <SH label={career.sectionLabels?.techEnvironment || 'Technical Skills'} gold={gold} font={font} dm={dm} />
                    <p style={{ fontFamily: font.body, fontSize: '8.5pt', color: CHARCOAL, lineHeight: '1.75', margin: 0 }}>
                        {career.techEnvironment || defaultTech}
                    </p>
                </div>
            )
        },

        keyStats: () => null,
        keyAchievements: () => null,

        referees: () => vis.referees !== false && career.referees && (
            <div key="referees" style={{ marginBottom: dm.lineGap }}>
                <SH label={career.sectionLabels?.referees || 'Referees'} gold={gold} font={font} dm={dm} />
                <p style={{ fontFamily: font.body, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: lh, margin: 0 }}>{career.referees}</p>
            </div>
        ),
    }

    return (
        <div style={wrapStyle}>

            {/* Left gold accent spine — runs full document height */}
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: gold, zIndex: 5 }} />

            {/* A4 page break markers (preview only) */}
            {preview && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}>
                    {[1, 2].map(n => (
                        <div key={n} style={{ position: 'absolute', top: `${PAGE_HEIGHT * n}px`, left: 0, right: 0, borderBottom: '1.5px dashed #e05555', opacity: 0.7, display: 'flex', justifyContent: 'center' }}>
                            <span style={{ position: 'absolute', top: -8, background: '#e05555', color: '#fff', fontSize: '8px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.5px' }}>
                                ✂ PAGE {n} BREAK ✂
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* ══ HEADER — Deep Navy + dot grid texture ══ */}
            <div style={{
                background: NAVY,
                backgroundImage: DOT_GRID,
                backgroundRepeat: 'repeat',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Name block — padded */}
                <div style={{ paddingTop: my, paddingLeft: `calc(${mx} + 3px)`, paddingRight: mx, paddingBottom: '10px' }}>
                    {/* Name — Georgia serif for elite contrast */}
                    <h1 style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: dm.namePt,
                        fontWeight: dm.nameWt,
                        color: '#FFFFFF',
                        margin: '0',
                        letterSpacing: dm.nameSpacing,
                        textTransform: 'uppercase',
                        lineHeight: 1.05,
                        textShadow: '0 2px 20px rgba(0,0,0,0.35)',
                    }}>
                        {career.profile?.name || 'Your Name'}
                    </h1>
                </div>

                {/* Full-width gold rule — from spine (3px) to right edge */}
                <div style={{ height: '2px', background: `linear-gradient(to right, ${gold}, ${gold}CC)`, marginLeft: '3px', marginRight: 0 }} />

                {/* Pillars + positioning + contact — padded */}
                <div style={{ paddingLeft: `calc(${mx} + 3px)`, paddingRight: mx, paddingTop: '11px', paddingBottom: statsStrip.length ? '12px' : parseFloat(my) - 4 + 'px' }}>

                    {/* Expertise pillars — domain authority row */}
                    {pillars.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: posStatement ? '6px' : '10px', gap: 0 }}>
                            {pillars.map((p, i) => (
                                <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    <span style={{ fontFamily: font.body, fontSize: '8pt', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.8px', fontWeight: '400', textTransform: 'uppercase', fontSize: '7pt' }}>
                                        {p}
                                    </span>
                                    {i < pillars.length - 1 && (
                                        <span style={{ color: `${gold}80`, margin: '0 9px', fontSize: '6pt' }}>◆</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Positioning statement — the line that earns the second look */}
                    {posStatement && (
                        <p style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: '8.5pt',
                            color: 'rgba(255,255,255,0.88)',
                            fontStyle: 'italic',
                            margin: '0 0 12px 0',
                            lineHeight: 1.4,
                            letterSpacing: '0.1px',
                        }}>
                            {posStatement}
                        </p>
                    )}

                    {/* Separator */}
                    <div style={{ height: '0.4px', background: 'rgba(255,255,255,0.12)', marginBottom: '9px' }} />

                    {/* Contact block — structured 3-line identity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {/* Line 1: Location | Phone | Email */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            {[career.profile?.location, career.profile?.phone, career.profile?.email].filter(Boolean).map((item, i, arr) => (
                                <span key={i} style={{ fontFamily: font.body, fontSize: '7pt', color: 'rgba(255,255,255,0.6)', fontWeight: '300' }}>
                                    {item}
                                    {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.22)', margin: '0 7px' }}>|</span>}
                                </span>
                            ))}
                        </div>
                        {/* Line 2: LinkedIn */}
                        {career.profile?.linkedin && (
                            <div style={{ fontFamily: font.body, fontSize: '7pt', color: 'rgba(255,255,255,0.55)', fontWeight: '300' }}>
                                <span style={{ color: `${gold}BB`, fontWeight: '600', marginRight: '4px' }}>LinkedIn:</span>
                                {career.profile.linkedin}
                            </div>
                        )}
                        {/* Line 3: Portfolio | GitHub */}
                        {(career.profile?.website || career.profile?.github) && (
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                {career.profile?.website && (
                                    <span style={{ fontFamily: font.body, fontSize: '7pt', color: 'rgba(255,255,255,0.55)', fontWeight: '300' }}>
                                        <span style={{ color: `${gold}BB`, fontWeight: '600', marginRight: '4px' }}>Portfolio:</span>
                                        {career.profile.website}
                                    </span>
                                )}
                                {career.profile?.website && career.profile?.github && (
                                    <span style={{ color: 'rgba(255,255,255,0.22)', margin: '0 7px' }}>|</span>
                                )}
                                {career.profile?.github && (
                                    <span style={{ fontFamily: font.body, fontSize: '7pt', color: 'rgba(255,255,255,0.55)', fontWeight: '300' }}>
                                        <span style={{ color: `${gold}BB`, fontWeight: '600', marginRight: '4px' }}>GitHub:</span>
                                        {career.profile.github}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats strip — bottom band of header, the ROI headline */}
                {statsStrip.length > 0 && (
                    <div style={{
                        background: 'rgba(0,0,0,0.28)',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        paddingLeft: `calc(${mx} + 3px)`,
                        paddingRight: mx,
                        borderTop: `0.5px solid rgba(255,255,255,0.08)`,
                        marginTop: '2px',
                    }}>
                        {statsStrip.map((stat, i) => (
                            <span key={i} style={{
                                fontFamily: font.heading,
                                fontSize: '8pt',
                                fontWeight: '700',
                                color: gold,
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                            }}>
                                {stat}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* ══ Thin gold full-width bridge strip ══ */}
            <div style={{ height: '1.5px', background: `linear-gradient(to right, ${gold}CC, ${gold}22)`, marginLeft: '3px' }} />

            {/* ══ BODY — Ivory, charcoal text, warm executive feel ══ */}
            <div style={{
                paddingTop: '22px',
                paddingLeft: `calc(${mx} + 3px)`,
                paddingRight: mx,
                paddingBottom: my,
            }}>
                {order.map(id => renders[id] ? renders[id]() : null)}
            </div>
        </div>
    )
}
