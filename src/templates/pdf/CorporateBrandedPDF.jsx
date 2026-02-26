import { Document, Page, View, Text, Font, StyleSheet, Image } from '@react-pdf/renderer'
import { applyPositioning } from '../../modules/cv-designer/cvUtils'
import { cleanAndCapitalizeSkill } from '../../modules/cv-designer/textUtils'

Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff', fontWeight: 700 },
    ],
})

Font.registerHyphenationCallback((word) => [word])

const DM = {
    'corporate-branded': { nameSz: 22, nameWt: 700, nameSpacing: 0.4, labelSz: 8, labelLsp: 1.8, roleSz: 9.5, subSz: 9, bodySz: 9, dateSz: 8.5, sectionGap: 24, bandAlpha: 0.05 },
    'board-minimal': { nameSz: 23, nameWt: 700, nameSpacing: 0.2, labelSz: 8, labelLsp: 2.2, roleSz: 10, subSz: 9.5, bodySz: 9.5, dateSz: 9, sectionGap: 28, bandAlpha: 0 },
}

const makeStyles = (accentColor, marginSize, lineSpacing, designMode) => {
    const dm = DM[designMode] || DM['corporate-branded']
    const m = marginSize === 'tight' ? 28 : marginSize === 'spacious' ? 48 : 36
    const lh = lineSpacing === 'compact' ? 1.25 : lineSpacing === 'relaxed' ? 1.5 : 1.35
    const isBoard = designMode === 'board-minimal'

    return StyleSheet.create({
        page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: 0, paddingBottom: m, paddingLeft: 0, paddingRight: 0 },
        header: {
            paddingTop: 30, paddingBottom: 24, paddingHorizontal: m + 4,
            backgroundColor: isBoard ? '#ffffff' : accentColor,
            borderBottomWidth: 0.5, borderBottomColor: isBoard ? '#e2e2e2' : accentColor, borderBottomStyle: 'solid',
            opacity: 1,
        },
        headerTint: {
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isBoard ? '#ffffff' : accentColor, opacity: dm.bandAlpha
        },
        sideAccent: { position: 'absolute', top: 0, left: 0, width: 4, height: '100%', backgroundColor: accentColor },
        headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        name: { fontSize: dm.nameSz, fontWeight: 700, color: '#000000', letterSpacing: dm.nameSpacing || 0, marginBottom: 4 },
        title: { fontSize: dm.roleSz, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: 1 },
        photo: { width: 54, height: 54, borderRadius: 4, borderWidth: 0.5, borderStyle: 'solid', borderColor: accentColor },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
        contactItem: { fontSize: dm.dateSz, color: '#555555' },
        contactSep: { color: '#cccccc', marginHorizontal: 8 },
        body: { paddingHorizontal: m + 4, paddingTop: 24 },
        section: { marginBottom: dm.sectionGap },
        sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
        sectionLabel: { fontSize: dm.labelSz, fontWeight: 700, color: '#111111', textTransform: 'uppercase', letterSpacing: dm.labelLsp },
        sectionRule: { flex: 1, marginLeft: 10, height: 0.5, backgroundColor: '#e2e2e2' },
        summary: { fontSize: dm.bodySz, color: '#2d2d2d', lineHeight: lh, textAlign: 'justify', marginBottom: 8 },
        scale: { fontSize: dm.dateSz, color: '#666666', fontWeight: 500, letterSpacing: 0.2 },
        expBlock: { marginBottom: 14 },
        expRole: { fontSize: dm.roleSz, fontWeight: 700, color: '#000000' },
        expComp: { fontSize: dm.subSz, color: '#555555', marginLeft: 6 },
        expMeta: { fontSize: dm.dateSz, color: '#777777', fontStyle: 'italic' },
        techRow: { flexDirection: 'row', marginBottom: 6 },
        techLabel: { fontSize: dm.dateSz, fontWeight: 700, color: accentColor },
        techText: { fontSize: dm.dateSz, color: '#555555' },
        bullet: { flexDirection: 'row', marginBottom: 5 },
        bulletMark: { fontSize: dm.bodySz, color: accentColor, width: 14 },
        bulletText: { flex: 1, fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh },
        eduBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
        eduTitle: { fontSize: dm.roleSz, fontWeight: 600, color: '#111111' },
        eduInst: { fontSize: dm.subSz, color: '#555555', marginTop: 1 },
        eduYear: { fontSize: dm.dateSz, color: '#888888', fontStyle: 'italic' },
        certText: { fontSize: dm.bodySz, color: '#333333', lineHeight: 1.7 },
    })
}

export default function CorporateBrandedPDF({ career, accentColor, fontPair, marginSize, lineSpacing, designMode }) {
    if (!career) return <Document title="CV"><Page size="A4"><View><Text>Missing career data</Text></View></Page></Document>

    const s = makeStyles(accentColor || '#C9A84C', marginSize || 'normal', lineSpacing || 'normal', designMode || 'corporate-branded')
    const positioned = applyPositioning(career)
    const vis = career.sectionVisibility || {}
    const isBoard = designMode === 'board-minimal'

    const profile = career.profile || {}
    const contactItems = [
        profile.email,
        profile.phone,
        profile.location,
        profile.linkedin,
        profile.website,
        profile.github,
    ].filter(Boolean)

    const order = career.sectionOrder?.filter(s => s !== 'keyStats') || ['summary', 'skills', 'experiences', 'certifications', 'education']

    const renders = {
        summary: () => vis.summary !== false && positioned.summary && (
            <View key="summary" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Professional Summary</Text><View style={s.sectionRule} /></View>
                <View style={{ paddingRight: 10 }}>
                    <Text style={s.summary}>{String(positioned.summary)}</Text>
                    {positioned.executiveScale ? <Text style={s.scale}>{String(positioned.executiveScale)}</Text> : null}
                </View>
            </View>
        ),
        skills: () => vis.skills !== false && positioned.skills && (
            <View key="skills" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Core Competencies</Text><View style={s.sectionRule} /></View>
                <View style={{ flexDirection: 'column' }}>
                    {[
                        { label: 'Technical', items: positioned.skills.technical },
                        { label: 'Governance', items: positioned.skills.governance },
                        { label: 'Leadership', items: positioned.skills.leadership },
                    ].map(({ label, items }) => items && items.length > 0 && (
                        <View key={label} style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: dm.bodySz, fontWeight: 700, color: '#111111', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</Text>
                            {items.map((skill, i) => (
                                <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                    <Text style={s.bulletMark}>•</Text>
                                    <Text style={{ flex: 1, fontSize: dm.bodySz, color: '#444444', lineHeight: lh }}>{cleanAndCapitalizeSkill(skill)}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        ),
        experiences: () => vis.experiences !== false && positioned.experiences && (
            <View key="experiences" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Professional Experience</Text><View style={s.sectionRule} /></View>
                {positioned.experiences.filter(e => e.role).map((exp) => (
                    <View key={exp.id || Math.random()} style={s.expBlock}>
                        <View wrap={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
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
        referees: () => vis.referees !== false && career.referees && (
            <View key="referees" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Referees</Text><View style={s.sectionRule} /></View>
                <Text style={s.summary}>{String(career.referees)}</Text>
            </View>
        ),
    }

    return (
        <Document title={profile.name || 'CV'}>
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    {!isBoard && <View style={s.headerTint} />}
                    <View style={s.sideAccent} />
                    <View style={s.headerInner}>
                        <View>
                            <Text style={s.name}>{String(profile.name || '')}</Text>
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
