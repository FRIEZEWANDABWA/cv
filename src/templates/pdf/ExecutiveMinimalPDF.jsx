import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { applyPositioning } from '../../modules/cv-designer/cvUtils'
import { cleanAndCapitalizeSkill } from '../../modules/cv-designer/textUtils'
import { ensureFontsRegistered } from './pdfFonts'

ensureFontsRegistered()

const DM = {
    'executive-minimal': { nameSz: 20, nameWt: 700, nameSpacing: 1.2, labelSz: 9, labelLsp: 2, roleSz: 10.5, subSz: 9.5, bodySz: 10, dateSz: 9, sectionGap: 22, accent: '#1F2A44' },
    'global-executive': { nameSz: 21, nameWt: 700, nameSpacing: 0.8, labelSz: 9, labelLsp: 2.2, roleSz: 10.5, subSz: 9.5, bodySz: 10, dateSz: 9, sectionGap: 24, accent: '#1F2A44' },
    'modern-infrastructure': { nameSz: 19, nameWt: 700, nameSpacing: 1.5, labelSz: 8.5, labelLsp: 2, roleSz: 10, subSz: 9, bodySz: 9.5, dateSz: 8.5, sectionGap: 20, accent: '#1F2A44' },
}

const makeStyles = (marginSize, lineSpacing, designMode) => {
    const dm = DM[designMode] || DM['executive-minimal']
    const mx = marginSize === 'tight' ? 40 : marginSize === 'spacious' ? 64 : 54
    const my = marginSize === 'tight' ? 36 : marginSize === 'spacious' ? 60 : 48
    const lh = lineSpacing === 'compact' ? 1.3 : lineSpacing === 'relaxed' ? 1.55 : 1.4

    return StyleSheet.create({
        page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: my, paddingBottom: my, paddingHorizontal: mx },

        /* Header */
        header: { marginBottom: 22, paddingBottom: 14, borderBottomWidth: 0.75, borderBottomColor: dm.accent, borderBottomStyle: 'solid' },
        name: { fontFamily: 'Inter', fontWeight: 700, fontSize: dm.nameSz, color: '#0a0a0a', letterSpacing: dm.nameSpacing, marginBottom: 5, textTransform: 'uppercase' },
        title: { fontFamily: 'Inter', fontWeight: 600, fontSize: dm.roleSz, color: dm.accent, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap' },
        contactItem: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#444444' },
        contactSep: { fontFamily: 'Inter', fontSize: dm.dateSz, color: '#bbbbbb', marginHorizontal: 8 },

        /* Sections */
        section: { marginBottom: dm.sectionGap },
        sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
        sectionLabel: { fontFamily: 'Inter', fontWeight: 700, fontSize: dm.labelSz, color: '#111111', textTransform: 'uppercase', letterSpacing: dm.labelLsp },
        sectionRule: { flex: 1, marginLeft: 10, height: 0.5, backgroundColor: dm.accent, opacity: 0.25 },

        /* Summary */
        summary: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#1a1a1a', lineHeight: lh, textAlign: 'justify' },
        scale: { fontFamily: 'Inter', fontWeight: 500, fontSize: dm.dateSz, color: '#555555', marginTop: 6, letterSpacing: 0.2 },

        /* Skills */
        skillCat: { fontFamily: 'Inter', fontWeight: 600, fontSize: 8.5, color: dm.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, borderBottomWidth: 0.5, borderBottomColor: dm.accent, opacity: 0.8, paddingBottom: 3 },
        skillItem: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#2a2a2a', marginBottom: 3, lineHeight: 1.35 },

        /* Experience */
        expBlock: { marginBottom: 14 },
        expHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 },
        expRole: { fontFamily: 'Inter', fontWeight: 700, fontSize: dm.roleSz, color: dm.accent },
        expComp: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.subSz, color: '#333333', marginLeft: 5 },
        expMeta: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#666666', fontStyle: 'italic' },
        techRow: { flexDirection: 'row', marginBottom: 6, marginTop: 2 },
        techLabel: { fontFamily: 'Inter', fontWeight: 600, fontSize: dm.dateSz, color: dm.accent },
        techText: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#555555' },
        bullet: { flexDirection: 'row', marginBottom: 4, paddingRight: 8 },
        bulletMark: { fontFamily: 'Inter', fontSize: dm.bodySz, color: dm.accent, width: 14, marginTop: 0 },
        bulletText: { flex: 1, fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#1a1a1a', lineHeight: lh },

        /* Education */
        eduBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
        eduTitle: { fontFamily: 'Inter', fontWeight: 600, fontSize: dm.roleSz, color: '#111111' },
        eduInst: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.subSz, color: '#444444', marginTop: 2 },
        eduYear: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#666666', fontStyle: 'italic' },

        /* Certifications */
        certText: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#222222', lineHeight: lh },

        /* Tech Env */
        techEnvText: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#333333', lineHeight: 1.6 },
    })
}

// ── Skills Renderers for PDF ────────────────────────────────────────────────
const SKILL_GROUPS = [
    { key: 'ictLeadership', label: 'ICT Strategy & Leadership' },
    { key: 'cloudInfrastructure', label: 'Cloud & Infrastructure' },
    { key: 'cybersecurity', label: 'Cybersecurity & Governance' },
    { key: 'businessOperations', label: 'Business & Operations' },
    { key: 'technical', label: 'Technical' },
    { key: 'governance', label: 'Governance' },
    { key: 'leadership', label: 'Leadership' },
]

function renderPdfSkills({ layout = 'columns3', skills, s, skillLabels = {} }) {
    if (!skills) return null
    const active = SKILL_GROUPS.filter(g => skills[g.key]?.length > 0)
    if (active.length === 0) return null

    if (layout === 'badge') {
        const allItems = active.flatMap(g => skills[g.key].map(skill => cleanAndCapitalizeSkill(skill)))
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '4px' }}>
                {allItems.map((skill, i) => (
                    <Text key={i} style={{ fontFamily: 'Inter', fontSize: s.skillItem.fontSize, color: '#333', backgroundColor: `${s.skillCat.color}15`, padding: '2px 6px', borderRadius: 3 }}>
                        {skill}
                    </Text>
                ))}
            </View>
        )
    }

    if (layout === 'compact') {
        return (
            <View style={{ flexDirection: 'column', gap: 6 }}>
                {active.map(({ key, label }) => (
                    <View key={key} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 7.5, color: s.skillCat.color, textTransform: 'uppercase', letterSpacing: 0.8, width: 110 }}>{skillLabels[key] || label}</Text>
                        <Text style={[s.skillItem, { flex: 1, marginBottom: 0 }]}>
                            {skills[key].map(skill => cleanAndCapitalizeSkill(skill)).join('  ·  ')}
                        </Text>
                    </View>
                ))}
            </View>
        )
    }

    if (layout === 'inline') {
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '4px 18px' }}>
                {active.map(({ key, label }) => (
                    <View key={key} style={{ flexDirection: 'row', alignItems: 'flex-start', width: '47%' }}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 7, color: s.skillCat.color, marginRight: 4, marginTop: 1 }}>▸</Text>
                        <Text style={{ fontFamily: 'Inter', fontSize: s.skillItem.fontSize, color: '#444', lineHeight: 1.5 }}>
                            <Text style={{ fontWeight: 700, color: '#111', fontSize: 7.5, textTransform: 'uppercase' }}>{skillLabels[key] || label}: </Text>
                            {skills[key].map(skill => cleanAndCapitalizeSkill(skill)).join(', ')}
                        </Text>
                    </View>
                ))}
            </View>
        )
    }

    // Default: columns2 or columns3
    const isTwoCol = layout === 'columns2'
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {active.map(({ key, label }) => (
                <View key={key} style={{ width: isTwoCol ? '47%' : '31%', marginBottom: 10 }}>
                    <Text style={s.skillCat}>{skillLabels[key] || label}</Text>
                    {skills[key].map((skill, i) => (
                        <Text key={i} style={s.skillItem}>• {cleanAndCapitalizeSkill(skill)}</Text>
                    ))}
                </View>
            ))}
        </View>
    )
}

export default function ExecutiveMinimalPDF({ career, marginSize, lineSpacing, designMode }) {
    if (!career) return <Document title="CV" author="CareerWeapon" producer="CareerWeapon CV Engine"><Page size="A4"><View><Text>Missing data</Text></View></Page></Document>

    const s = makeStyles(marginSize || 'normal', lineSpacing || 'normal', designMode || 'executive-minimal')
    const dm = DM[designMode] || DM['executive-minimal']
    const positioned = applyPositioning(career)
    const vis = career.sectionVisibility || {}
    let order = career.sectionOrder?.filter(sec => sec !== 'keyStats') || ['summary', 'strategicImpact', 'skills', 'experiences', 'education', 'certifications', 'techEnvironment']
    if (!order.includes('strategicImpact')) order.splice(1, 0, 'strategicImpact')
    if (!order.includes('techEnvironment')) order.push('techEnvironment')
    order = [...new Set(order)]
    const profile = career.profile || {}
    const contactItems = [
        profile.email,
        profile.phone,
        profile.location,
        profile.linkedin,
        profile.website,
    ].filter(Boolean)

    const renders = {
        summary: () => vis.summary !== false && positioned.summary && (
            <View key="summary" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Professional Summary</Text><View style={s.sectionRule} /></View>
                <Text style={s.summary}>{String(positioned.summary)}</Text>
                {positioned.executiveScale ? <Text style={s.scale}>{String(positioned.executiveScale)}</Text> : null}
            </View>
        ),
        keyAchievements: () => vis.keyAchievements !== false && career.keyAchievements && career.keyAchievements.length > 0 && (
            <View key="keyAchievements" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Key Achievements</Text><View style={s.sectionRule} /></View>
                {career.keyAchievements.map((ach, i) => (
                    <View key={i} style={s.bullet}>
                        <Text style={s.bulletMark}>•</Text>
                        <Text style={s.bulletText}>{String(ach)}</Text>
                    </View>
                ))}
            </View>
        ),
        strategicImpact: () => {
            const impactItems = (career.strategicImpact && career.strategicImpact.length > 0)
                ? career.strategicImpact
                : (career.keyAchievements && career.keyAchievements.length > 0 ? career.keyAchievements : [])

            if (vis.strategicImpact === false || impactItems.length === 0) return null

            return (
                <View key="strategicImpact" style={s.section}>
                    <View style={s.sectionHead}><Text style={s.sectionLabel}>Strategic IT Leadership Impact</Text><View style={s.sectionRule} /></View>
                    {impactItems.map((item, i) => (
                        <View key={i} style={s.bullet}>
                            <Text style={s.bulletMark}>•</Text>
                            <Text style={s.bulletText}>{String(item)}</Text>
                        </View>
                    ))}
                </View>
            )
        },
        skills: () => {
            const hasSkills = SKILL_GROUPS.some(g => positioned.skills?.[g.key]?.length > 0)
            if (vis.skills === false || !hasSkills) return null
            return (
                <View key="skills" style={s.section} wrap={false}>
                    <View style={s.sectionHead}><Text style={s.sectionLabel}>Core Competencies</Text><View style={s.sectionRule} /></View>
                    {renderPdfSkills({ layout: career.skillsLayout || 'columns3', skills: positioned.skills, s, skillLabels: career.skillLabels })}
                </View>
            )
        },
        experiences: () => vis.experiences !== false && positioned.experiences && (
            <View key="experiences" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Professional Experience</Text><View style={s.sectionRule} /></View>
                {positioned.experiences.filter(e => e.role).map((exp) => (
                    <View key={exp.id || Math.random()} style={s.expBlock}>
                        <View wrap={false}>
                            <View style={s.expHead}>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={s.expRole}>{String(exp.role || '')}</Text>
                                    {exp.company ? <Text style={s.expComp}>— {String(exp.company)}</Text> : null}
                                </View>
                                <Text style={s.expMeta}>
                                    {[exp.period, exp.location].filter(Boolean).join('  ·  ')}
                                </Text>
                            </View>
                            {exp.technologies ? (
                                <View style={s.techRow}>
                                    <Text style={s.techLabel}>Technologies: </Text>
                                    <Text style={s.techText}>{exp.technologies.split(',').map(t => cleanAndCapitalizeSkill(t.trim())).join(', ')}</Text>
                                </View>
                            ) : null}
                            {(exp.achievements || []).slice(0, 1).map((ach, i) => (
                                <View key={i} style={s.bullet}>
                                    <Text style={s.bulletMark}>•</Text>
                                    <Text style={s.bulletText}>{String(ach.text || '')}</Text>
                                </View>
                            ))}
                        </View>
                        {(exp.achievements || []).slice(1).map((ach, i) => (
                            <View key={i + 1} style={s.bullet} wrap={false}>
                                <Text style={s.bulletMark}>•</Text>
                                <Text style={s.bulletText}>{String(ach.text || '')}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        ),
        certifications: () => vis.certifications !== false && positioned.certifications && (
            <View key="certifications" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Certifications</Text><View style={s.sectionRule} /></View>
                <Text style={s.certText}>
                    {positioned.certifications.filter(c => c.name).map((c, i, arr) => (
                        `${c.name}${c.year ? ` (${c.year})` : ''}${c.issuer ? `, ${c.issuer}` : ''}${i < arr.length - 1 ? '  ·  ' : ''}`
                    )).join('')}
                </Text>
            </View>
        ),
        education: () => vis.education !== false && positioned.education && (
            <View key="education" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Education</Text><View style={s.sectionRule} /></View>
                {positioned.education.filter(e => e.degree).map((edu) => (
                    <View key={edu.id || Math.random()} style={s.eduBlock}>
                        <View>
                            <Text style={s.eduTitle}>{String(edu.degree || '')}{edu.field ? `, ${String(edu.field)}` : ''}</Text>
                            {edu.institution ? <Text style={s.eduInst}>{String(edu.institution)}</Text> : null}
                        </View>
                        {edu.year ? <Text style={s.eduYear}>{String(edu.year)}</Text> : null}
                    </View>
                ))}
            </View>
        ),
        techEnvironment: () => {
            const defaultTech = "Microsoft 365 • Microsoft Azure • AWS • Cisco Networking • Fortinet Security • Active Directory • SD-WAN • LAN/WAN Infrastructure • Endpoint Security • Backup & Disaster Recovery • Network Monitoring Tools • Virtualization Platforms"
            const textToRender = career.techEnvironment || defaultTech
            if (vis.techEnvironment === false) return null
            return (
                <View key="techEnvironment" style={s.section} wrap={false}>
                    <Text style={s.sectionTitle}>Technology Environment</Text>
                    <Text style={s.techEnvText}>{String(textToRender)}</Text>
                </View>
            )
        },
        referees: () => vis.referees !== false && career.referees && (
            <View key="referees" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Referees</Text><View style={s.sectionRule} /></View>
                <Text style={s.summary}>{String(career.referees)}</Text>
            </View>
        ),
    }

    const docName = profile.name || 'CV'
    const docTitle = profile.title || ''
    const skillKeywords = Object.values(career.skills || {}).flat().slice(0, 10).join(', ')

    return (
        <Document
            title={docTitle ? `${docName} — ${docTitle}` : docName}
            author={docName}
            subject={docTitle}
            keywords={skillKeywords}
            creator={docName}
            producer="CareerWeapon CV Engine"
        >
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.name}>{String(profile.name || 'Your Name').toUpperCase()}</Text>
                    <Text style={s.title}>{String(profile.title || 'Senior Executive')}</Text>
                    <View style={s.contactRow}>
                        {contactItems.map((item, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={s.contactItem}>{String(item)}</Text>
                                {i < contactItems.length - 1 ? <Text style={s.contactSep}>·</Text> : null}
                            </View>
                        ))}
                    </View>
                </View>
                {order.map(id => renders[id] ? renders[id]() : null)}
            </Page>
        </Document>
    )
}
