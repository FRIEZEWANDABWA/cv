import { Document, Page, View, Text, Font, StyleSheet, Image } from '@react-pdf/renderer'
import { applyPositioning } from '../../modules/cv-designer/cvUtils'

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
    'corporate-branded': { nameSz: 20, nameWt: 700, labelSz: 7.5, labelLsp: 1.2, bodySz: 9, sectionGap: 18, bandAlpha: 0.05 },
    'board-minimal': { nameSz: 21, nameWt: 700, labelSz: 7.5, labelLsp: 1.6, bodySz: 9.5, sectionGap: 22, bandAlpha: 0 },
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
            opacity: isBoard ? 1 : 1, // Actually we use alpha in hex if needed, but here we'll just tint
        },
        headerTint: { // Re-simulating the alpha because @react-pdf alpha in bg is tricky
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isBoard ? '#ffffff' : accentColor, opacity: dm.bandAlpha
        },
        sideAccent: { position: 'absolute', top: 0, left: 0, width: 4, height: '100%', backgroundColor: accentColor },
        headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        name: { fontSize: dm.nameSz, fontWeight: 700, color: '#000000', letterSpacing: -0.3, marginBottom: 4 },
        title: { fontSize: 9.5, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: 1 },
        photo: { width: 54, height: 54, borderRadius: 4, border: `0.5px solid ${accentColor}` },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
        contactItem: { fontSize: 7.5, color: '#333333' },
        contactSep: { color: '#cccccc', marginHorizontal: 8 },
        body: { paddingHorizontal: m + 4, paddingTop: 24 },
        section: { marginBottom: dm.sectionGap },
        sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
        sectionLabel: { fontSize: dm.labelSz, fontWeight: 700, color: '#111111', textTransform: 'uppercase', letterSpacing: dm.labelLsp },
        sectionRule: { flex: 1, marginLeft: 10, height: 0.5, backgroundColor: '#e2e2e2' },
        summary: { fontSize: dm.bodySz, color: '#2d2d2d', lineHeight: lh, textAlign: 'justify', marginBottom: 8 },
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

export default function CorporateBrandedPDF({ career, accentColor, fontPair, marginSize, lineSpacing, designMode }) {
    const s = makeStyles(accentColor || '#C9A84C', marginSize || 'normal', lineSpacing || 'normal', designMode || 'corporate-branded')
    const positioned = applyPositioning(career)
    const vis = career.sectionVisibility || {}
    const isBoard = designMode === 'board-minimal'

    const contactItems = [
        career.profile?.email,
        career.profile?.phone,
        career.profile?.location,
        career.profile?.linkedin,
        career.profile?.website,
        career.profile?.github,
    ].filter(Boolean)

    const order = career.sectionOrder?.filter(s => s !== 'keyStats') || ['summary', 'skills', 'experiences', 'certifications', 'education']

    const renders = {
        summary: () => vis.summary !== false && (
            <View key="summary" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Professional Summary</Text><View style={s.sectionRule} /></View>
                <Text style={s.summary}>{positioned.summary}</Text>
                {positioned.executiveScale ? <Text style={s.scale}>{positioned.executiveScale}</Text> : null}
            </View>
        ),
        skills: () => vis.skills !== false && (
            <View key="skills" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Core Competencies</Text><View style={s.sectionRule} /></View>
                {[
                    { label: 'Technical', items: positioned.skills?.technical },
                    { label: 'Governance', items: positioned.skills?.governance },
                    { label: 'Leadership', items: positioned.skills?.leadership },
                ].map(({ label, items }) => items?.length > 0 && (
                    <View key={label} style={s.skillRow}>
                        <Text style={s.skillCat}>{label}</Text>
                        <Text style={s.skillList}>{items.join('  ·  ')}</Text>
                    </View>
                ))}
            </View>
        ),
        experiences: () => vis.experiences !== false && (
            <View key="experiences" style={s.section}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Professional Experience</Text><View style={s.sectionRule} /></View>
                {positioned.experiences.filter(e => e.role).map((exp) => (
                    <View key={exp.id} style={s.expBlock} wrap={false}>
                        <View style={s.expHead}>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                <Text style={s.expRole}>{exp.role}</Text>
                                {exp.company ? <Text style={s.expComp}>— {exp.company}</Text> : null}
                            </View>
                            <Text style={s.expMeta}>{exp.period}{exp.location ? `  ·  ${exp.location}` : ''}</Text>
                        </View>
                        <View style={s.expRule} />
                        {exp.achievements.map((ach, i) => (
                            <View key={i} style={s.bullet}>
                                <Text style={s.bulletMark}>–</Text>
                                <Text style={s.bulletText}>{ach.text}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        ),
        certifications: () => vis.certifications !== false && (
            <View key="certifications" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Certifications</Text><View style={s.sectionRule} /></View>
                <Text style={s.certText}>
                    {positioned.certifications.filter(c => c.name).map((c, i, arr) => (
                        `${c.name}${c.year ? ` (${c.year})` : ''}${c.issuer ? `, ${c.issuer}` : ''}${i < arr.length - 1 ? '  ·  ' : ''}`
                    )).join('')}
                </Text>
            </View>
        ),
        education: () => vis.education !== false && (
            <View key="education" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Education</Text><View style={s.sectionRule} /></View>
                {positioned.education.filter(e => e.degree).map((edu) => (
                    <View key={edu.id} style={s.eduBlock}>
                        <View>
                            <Text style={s.eduTitle}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</Text>
                            {edu.institution ? <Text style={s.eduInst}>{edu.institution}</Text> : null}
                        </View>
                        {edu.year ? <Text style={s.eduYear}>{edu.year}</Text> : null}
                    </View>
                ))}
            </View>
        ),
    }

    return (
        <Document title={career.profile?.name || 'CV'}>
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    {!isBoard && <View style={s.headerTint} />}
                    <View style={s.sideAccent} />
                    <View style={s.headerInner}>
                        <View>
                            <Text style={s.name}>{career.profile?.name}</Text>
                            <Text style={s.title}>{career.profile?.title}</Text>
                        </View>
                        {career.profile?.photo ? <Image src={career.profile.photo} style={s.photo} /> : null}
                    </View>
                    <View style={s.contactRow}>
                        {contactItems.map((item, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={s.contactItem}>{item}</Text>
                                {i < contactItems.length - 1 ? <Text style={s.contactSep}>|</Text> : null}
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
