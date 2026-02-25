import { Document, Page, View, Text, Font, StyleSheet } from '@react-pdf/renderer'
import { applyPositioning } from '../../modules/cv-designer/cvUtils'

// ── Font Registration ────────────────────────────────────────────────────────
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
    'executive-minimal': { nameSz: 20, nameWt: 700, labelSz: 7.5, labelLsp: 1.6, bodySz: 9, lineGap: 18 },
    'global-executive': { nameSz: 21, nameWt: 700, labelSz: 7.5, labelLsp: 1.4, bodySz: 9.5, lineGap: 22 },
    'modern-infrastructure': { nameSz: 19, nameWt: 800, labelSz: 7, labelLsp: 2, bodySz: 8.5, lineGap: 16 },
}

const makeStyles = (accentColor, marginSize, lineSpacing, designMode) => {
    const dm = DM[designMode] || DM['executive-minimal']
    const m = marginSize === 'tight' ? 28 : marginSize === 'spacious' ? 48 : 36
    const lh = lineSpacing === 'compact' ? 1.25 : lineSpacing === 'relaxed' ? 1.5 : 1.35

    return StyleSheet.create({
        page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: m, paddingBottom: m, paddingLeft: m + 4, paddingRight: m + 4 },
        header: { marginBottom: 14, paddingBottom: 10 },
        name: { fontSize: dm.nameSz, fontWeight: 700, color: '#000000', letterSpacing: -0.3, marginBottom: 2 },
        title: { fontSize: 9.5, fontWeight: 600, color: accentColor, marginBottom: 8, letterSpacing: 0.2 },
        ruleHeader: { width: '100%', height: 0.75, backgroundColor: accentColor, marginBottom: 8, opacity: 0.7 },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap' },
        contactItem: { fontSize: 7.5, color: '#555555' },
        contactSep: { color: '#cccccc', marginHorizontal: 8 },
        section: { marginBottom: dm.lineGap },
        sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
        sectionLabel: { fontSize: dm.labelSz, fontWeight: 600, color: '#111111', textTransform: 'uppercase', letterSpacing: dm.labelLsp },
        sectionRule: { flex: 1, marginLeft: 10, height: 0.5, backgroundColor: '#d4d4d4' },
        summary: { fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh, textAlign: 'justify', marginBottom: 8 },
        scale: { fontSize: 7.5, color: '#666666', fontWeight: 500, letterSpacing: 0.2 },
        skillRow: { flexDirection: 'row', marginBottom: 4 },
        skillCat: { width: 80, fontSize: 6.5, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.7, marginTop: 2 },
        skillList: { flex: 1, fontSize: dm.bodySz, color: '#333333', lineHeight: 1.45 },
        expBlock: { marginBottom: 14 },
        expHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
        expRole: { fontSize: 10, fontWeight: 700, color: '#000000' },
        expComp: { fontSize: 9, color: '#555555', marginLeft: 6 },
        expMeta: { fontSize: 8, color: '#777777', fontStyle: 'italic' },
        expRule: { width: 24, height: 1, backgroundColor: accentColor, opacity: 0.4, marginVertical: 6 },
        bullet: { flexDirection: 'row', marginBottom: 3 },
        bulletMark: { fontSize: 9, color: '#888888', width: 12 },
        bulletText: { flex: 1, fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh },
        eduBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
        eduTitle: { fontSize: 9.5, fontWeight: 600, color: '#111111' },
        eduInst: { fontSize: 8.5, color: '#555555', marginTop: 1 },
        eduYear: { fontSize: 8, color: '#888888', fontStyle: 'italic' },
        certText: { fontSize: dm.bodySz, color: '#333333', lineHeight: 1.7 },
    })
}

export default function ExecutiveMinimalPDF({ career, accentColor, fontPair, marginSize, lineSpacing, designMode }) {
    if (!career) return <Document title="CV"><Page size="A4"><View><Text>Missing career data</Text></View></Page></Document>

    const s = makeStyles(accentColor || '#C9A84C', marginSize || 'normal', lineSpacing || 'normal', designMode || 'executive-minimal')
    const positioned = applyPositioning(career)
    const vis = career.sectionVisibility || {}
    const edPri = career.educationPriority || 'standard'

    let defaultOrder = ['summary', 'skills', 'experiences', 'certifications', 'education']
    if (edPri === 'mid') defaultOrder = ['summary', 'education', 'skills', 'experiences', 'certifications']
    if (edPri === 'academic') defaultOrder = ['education', 'summary', 'skills', 'experiences', 'certifications']
    const order = career.sectionOrder?.filter(s => s !== 'keyStats') || defaultOrder

    const profile = career.profile || {}
    const contactItems = [
        profile.email,
        profile.phone,
        profile.location,
        profile.linkedin,
        profile.website,
        profile.github,
    ].filter(Boolean)

    const renders = {
        summary: () => vis.summary !== false && positioned.summary && (
            <View key="summary" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Professional Summary</Text><View style={s.sectionRule} /></View>
                <Text style={s.summary}>{String(positioned.summary)}</Text>
                {positioned.executiveScale ? <Text style={s.scale}>{String(positioned.executiveScale)}</Text> : null}
            </View>
        ),
        skills: () => vis.skills !== false && positioned.skills && (
            <View key="skills" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Core Competencies</Text><View style={s.sectionRule} /></View>
                {[
                    { label: 'Technical', items: positioned.skills.technical },
                    { label: 'Governance', items: positioned.skills.governance },
                    { label: 'Leadership', items: positioned.skills.leadership },
                ].map(({ label, items }) => items && items.length > 0 && (
                    <View key={label} style={s.skillRow}>
                        <Text style={s.skillCat}>{label}</Text>
                        <Text style={s.skillList}>{items.join('  ·  ')}</Text>
                    </View>
                ))}
            </View>
        ),
        experiences: () => vis.experiences !== false && positioned.experiences && (
            <View key="experiences" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Professional Experience</Text><View style={s.sectionRule} /></View>
                {positioned.experiences.filter(e => e.role).map((exp) => (
                    <View key={exp.id || Math.random()} style={s.expBlock} wrap={false}>
                        <View style={s.expHead}>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                <Text style={s.expRole}>{String(exp.role || '')}</Text>
                                {exp.company ? <Text style={s.expComp}>— {String(exp.company)}</Text> : null}
                            </View>
                            <Text style={s.expMeta}>
                                {[exp.period, exp.location].filter(Boolean).join('  ·  ')}
                            </Text>
                        </View>
                        <View style={s.expRule} />
                        {(exp.achievements || []).map((ach, i) => (
                            <View key={i} style={s.bullet}>
                                <Text style={s.bulletMark}>–</Text>
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
                    <Text style={s.name}>{String(profile.name || 'Your Name')}</Text>
                    <Text style={s.title}>{String(profile.title || 'Professional Title')}</Text>
                    <View style={s.ruleHeader} />
                    <View style={s.contactRow}>
                        {contactItems.map((item, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={s.contactItem}>{String(item)}</Text>
                                {i < contactItems.length - 1 ? <Text style={s.contactSep}>|</Text> : null}
                            </View>
                        ))}
                    </View>
                </View>
                {order.map(id => renders[id] ? renders[id]() : null)}
            </Page>
        </Document>
    )
}
