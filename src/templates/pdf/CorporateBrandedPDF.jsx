import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import { applyPositioning } from '../../modules/cv-designer/cvUtils'
import { cleanAndCapitalizeSkill } from '../../modules/cv-designer/textUtils'
import { ensureFontsRegistered } from './pdfFonts'

ensureFontsRegistered()

const DM = {
    'corporate-branded': { nameSz: 22, nameWt: 700, nameSpacing: 0.4, labelSz: 8.5, labelLsp: 1.8, roleSz: 10.5, subSz: 9.5, bodySz: 9.5, dateSz: 8.5, sectionGap: 18, bandAlpha: 0.06 },
    'board-minimal': { nameSz: 23, nameWt: 700, nameSpacing: 0.2, labelSz: 9, labelLsp: 2.2, roleSz: 10.5, subSz: 9.5, bodySz: 10, dateSz: 9, sectionGap: 20, bandAlpha: 0 },
}

// ── Skill category groups ──
const SKILL_GROUPS = [
    { key: 'ictLeadership', label: 'ICT Strategy & Leadership' },
    { key: 'cloudInfrastructure', label: 'Cloud & Infrastructure' },
    { key: 'cybersecurity', label: 'Cybersecurity & Governance' },
    { key: 'businessOperations', label: 'Business & Operations' },
    { key: 'technical', label: 'Technical' },
    { key: 'governance', label: 'Governance' },
    { key: 'leadership', label: 'Leadership' },
]

function renderPdfSkills({ layout = 'columns2', skills, s, dm, skillLabels = {} }) {
    if (!skills) return null
    const active = SKILL_GROUPS.filter(g => skills[g.key]?.length > 0)
    if (active.length === 0) return null

    if (layout === 'badge') {
        const allItems = active.flatMap(g => skills[g.key].map(skill => cleanAndCapitalizeSkill(skill)))
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '4px 6px' }}>
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
                        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 7, color: s.skillCat.color, textTransform: 'uppercase', letterSpacing: 0.8, width: 110, marginTop: 1 }}>{skillLabels[key] || label}</Text>
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
                        <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: s.skillCat.color, marginRight: 4, marginTop: 1 }}>▸</Text>
                        <Text style={{ fontFamily: 'Inter', fontSize: s.skillItem.fontSize, color: '#444', lineHeight: 1.5 }}>
                            <Text style={{ fontWeight: 700, color: '#111', fontSize: 7, textTransform: 'uppercase' }}>{skillLabels[key] || label}: </Text>
                            {skills[key].map(skill => cleanAndCapitalizeSkill(skill)).join(', ')}
                        </Text>
                    </View>
                ))}
            </View>
        )
    }

    const isThreeCol = layout === 'columns3'
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {active.map(({ key, label }) => (
                <View key={key} style={{ width: isThreeCol ? '31%' : '48%', marginBottom: 8 }}>
                    <Text style={s.skillCat}>{skillLabels[key] || label}</Text>
                    {skills[key].map((skill, i) => (
                        <Text key={i} style={s.skillItem}>• {cleanAndCapitalizeSkill(skill)}</Text>
                    ))}
                </View>
            ))}
        </View>
    )
}

const makeStyles = (accentColor, marginSize, lineSpacing, designMode) => {
    const dm = DM[designMode] || DM['corporate-branded']
    const m = marginSize === 'tight' ? 32 : marginSize === 'spacious' ? 52 : 40
    const lh = lineSpacing === 'compact' ? 1.3 : lineSpacing === 'relaxed' ? 1.55 : 1.4
    const isBoard = designMode === 'board-minimal'

    return StyleSheet.create({
        page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: 0, paddingBottom: m, paddingLeft: 0, paddingRight: 0 },

        /* Header */
        header: {
            paddingTop: 28, paddingBottom: 18, paddingHorizontal: m + 4,
            backgroundColor: isBoard ? '#ffffff' : accentColor + '08',
            borderBottomWidth: 0.5, borderBottomColor: isBoard ? '#e0e0e0' : accentColor + '40', borderBottomStyle: 'solid',
        },
        headerTint: {
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isBoard ? '#ffffff' : accentColor, opacity: dm.bandAlpha,
        },
        sideAccent: { position: 'absolute', top: 0, left: 0, width: 4, height: '100%', backgroundColor: accentColor },
        headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        name: { fontFamily: 'Inter', fontWeight: 700, fontSize: dm.nameSz, color: '#0a0a0a', letterSpacing: dm.nameSpacing || 0, marginBottom: 4 },
        title: { fontFamily: 'Inter', fontWeight: 600, fontSize: dm.roleSz, color: accentColor, textTransform: 'uppercase', letterSpacing: 1 },
        photo: { width: 52, height: 52, borderRadius: 4, borderWidth: 0.5, borderStyle: 'solid', borderColor: accentColor },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
        contactItem: { fontFamily: 'Inter', fontWeight: 400, fontSize: 7.8, color: '#444444' },
        contactSep: { fontFamily: 'Inter', fontSize: 7.8, color: '#bbbbbb', marginHorizontal: 6 },

        /* Body */
        body: { paddingHorizontal: m + 4, paddingTop: 18 },

        /* Sections */
        section: { marginBottom: dm.sectionGap },
        sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
        sectionLabel: { fontFamily: 'Inter', fontWeight: 700, fontSize: dm.labelSz, color: '#111111', textTransform: 'uppercase', letterSpacing: dm.labelLsp },
        sectionRule: { flex: 1, marginLeft: 10, height: 0.5, backgroundColor: '#d0d0d0' },

        /* Summary */
        summary: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#1a1a1a', lineHeight: lh, textAlign: 'justify', paddingRight: 8 },

        /* Strategic Impact bullets */
        bullet: { flexDirection: 'row', marginBottom: 3, paddingRight: 6 },
        bulletMark: { fontFamily: 'Inter', fontSize: dm.bodySz, color: accentColor, width: 12 },
        bulletText: { flex: 1, fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#1a1a1a', lineHeight: lh },

        /* Skills — 2-column grid */
        skillsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
        skillCell: { width: '50%', marginBottom: 8, paddingRight: 12 },
        skillCat: { fontFamily: 'Inter', fontWeight: 700, fontSize: 7, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
        skillItem: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#333333', lineHeight: 1.45, marginBottom: 1.5 },

        /* Experience */
        expBlock: { marginBottom: 12 },
        expHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
        expRole: { fontFamily: 'Inter', fontWeight: 700, fontSize: dm.roleSz, color: '#0a0a0a' },
        expComp: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.subSz, color: '#444444', marginLeft: 5 },
        expMeta: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#666666', fontStyle: 'italic' },
        expDivider: { width: 24, height: 1, backgroundColor: accentColor, opacity: 0.4, marginTop: 3, marginBottom: 5 },

        /* Education */
        eduBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 },
        eduTitle: { fontFamily: 'Inter', fontWeight: 600, fontSize: dm.roleSz, color: '#111111' },
        eduInst: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.subSz, color: '#444444', marginTop: 1 },
        eduYear: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#777777', fontStyle: 'italic' },

        /* Certifications */
        certText: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#222222', lineHeight: lh },

        /* Tech Environment */
        techEnvText: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#333333', lineHeight: 1.6 },
    })
}

export default function CorporateBrandedPDF({ career, accentColor, fontPair, marginSize, lineSpacing, designMode }) {
    if (!career) return <Document title="CV" author="CareerWeapon" producer="CareerWeapon CV Engine"><Page size="A4"><View><Text>Missing career data</Text></View></Page></Document>

    const accent = accentColor || '#C9A84C'
    const s = makeStyles(accent, marginSize || 'normal', lineSpacing || 'normal', designMode || 'corporate-branded')
    const dm = DM[designMode] || DM['corporate-branded']
    const positioned = applyPositioning(career)
    const vis = career.sectionVisibility || {}
    const isBoard = designMode === 'board-minimal'

    const profile = career.profile || {}
    const sl = career.sectionLabels || {}
    const labels = {
        summary:         sl.summary         || 'PROFESSIONAL SUMMARY',
        strategicImpact: sl.strategicImpact || 'KEY ACHIEVEMENTS',
        skills:          sl.skills          || 'CORE COMPETENCIES',
        experiences:     sl.experiences     || 'PROFESSIONAL EXPERIENCE',
        certifications:  sl.certifications  || 'PROFESSIONAL CERTIFICATIONS',
        education:       sl.education       || 'EDUCATION',
        techEnvironment: sl.techEnvironment || 'TECHNOLOGY ENVIRONMENT',
    }
    const contactItems = [
        profile.email,
        profile.phone,
        profile.location,
        profile.linkedin,
        profile.website,
        profile.github,
    ].filter(Boolean)

    let order = career.sectionOrder?.filter(sec => sec !== 'keyStats' && sec !== 'keyAchievements')
        || ['summary', 'strategicImpact', 'skills', 'experiences', 'certifications', 'education', 'techEnvironment']

    if (!order.includes('strategicImpact')) order.splice(1, 0, 'strategicImpact')
    if (!order.includes('techEnvironment')) order.push('techEnvironment')
    order = [...new Set(order)]

    const renders = {
        summary: () => vis.summary !== false && positioned.summary && (
            <View key="summary" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>{labels.summary}</Text><View style={s.sectionRule} /></View>
                <Text style={s.summary}>{String(positioned.summary)}</Text>
            </View>
        ),

        strategicImpact: () => {
            const impactItems = (career.strategicImpact && career.strategicImpact.length > 0)
                ? career.strategicImpact
                : (career.keyAchievements && career.keyAchievements.length > 0 ? career.keyAchievements : [])

            if (vis.strategicImpact === false || impactItems.length === 0) return null
            return (
                <View key="strategicImpact" style={s.section}>
                    <View style={s.sectionHead}><Text style={s.sectionLabel}>{labels.strategicImpact}</Text><View style={s.sectionRule} /></View>
                    {impactItems.map((item, i) => (
                        <View key={i} style={s.bullet}>
                            <Text style={s.bulletMark}>•</Text>
                            <Text style={s.bulletText}>{String(item)}</Text>
                        </View>
                    ))}
                </View>
            )
        },

        // Legacy: hidden in new design
        keyAchievements: () => null,
        keyStats: () => null,

        skills: () => {
            const hasSkills = SKILL_GROUPS.some(g => positioned.skills?.[g.key]?.length > 0)
            if (vis.skills === false || !hasSkills) return null
            return (
                <View key="skills" style={s.section} wrap={false}>
                    <View style={s.sectionHead}><Text style={s.sectionLabel}>{labels.skills}</Text><View style={s.sectionRule} /></View>
                    {renderPdfSkills({ layout: career.skillsLayout || 'columns2', skills: positioned.skills, s, dm, skillLabels: career.skillLabels })}
                </View>
            )
        },

        experiences: () => vis.experiences !== false && positioned.experiences && (
            <View key="experiences" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>{labels.experiences}</Text><View style={s.sectionRule} /></View>
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
                            <View style={s.expDivider} />
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
                <View style={s.sectionHead}><Text style={s.sectionLabel}>{labels.certifications}</Text><View style={s.sectionRule} /></View>
                <Text style={s.certText}>
                    {positioned.certifications.filter(c => c.name).map((c, i, arr) => (
                        `${c.name}${c.year ? ` (${c.year})` : ''}${c.issuer ? `, ${c.issuer}` : ''}${i < arr.length - 1 ? '  ·  ' : ''}`
                    )).join('')}
                </Text>
            </View>
        ),

        education: () => vis.education !== false && positioned.education && (
            <View key="education" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>{labels.education}</Text><View style={s.sectionRule} /></View>
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
                    <View style={s.sectionHead}><Text style={s.sectionLabel}>{labels.techEnvironment}</Text><View style={s.sectionRule} /></View>
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
                    {!isBoard && <View style={s.headerTint} />}
                    <View style={s.sideAccent} />
                    <View style={s.headerInner}>
                        <View>
                            <Text style={s.name}>{String(profile.name || '')}</Text>
                            <View style={{ width: 50, height: 1.5, backgroundColor: accent, marginBottom: 7, opacity: 0.7 }} />
                            <Text style={s.title}>{String(profile.title || '')}</Text>
                        </View>
                        {profile.photo ? <Image src={profile.photo} style={s.photo} /> : null}
                    </View>
                    <View style={s.contactRow}>
                        {contactItems.map((item, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={s.contactItem}>{String(item)}</Text>
                                {i < contactItems.length - 1 ? <Text style={s.contactSep}>·</Text> : null}
                            </View>
                        ))}
                    </View>
                </View>
                <View style={s.body}>
                    {order.map(id => renders[id] ? renders[id]() : null)}
                </View>
            </Page>
        </Document>
    )
}
