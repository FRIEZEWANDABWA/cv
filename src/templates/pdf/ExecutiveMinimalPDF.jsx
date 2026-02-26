import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { applyPositioning } from '../../modules/cv-designer/cvUtils'
import { cleanAndCapitalizeSkill } from '../../modules/cv-designer/textUtils'

// Direct built-in PDF fonts for ultra-reliability and standard executive compliance
// Times-Roman mimics Cambria
// Helvetica mimics Calibri

const DM = {
    'executive-minimal': { nameSz: 22, nameWt: 'bold', nameSpacing: 0.5, labelSz: 8, labelLsp: 2, roleSz: 9.5, subSz: 9, bodySz: 9, dateSz: 8.5, sectionGap: 20 },
    'global-executive': { nameSz: 23, nameWt: 'bold', nameSpacing: 0.3, labelSz: 8, labelLsp: 1.8, roleSz: 10, subSz: 9.5, bodySz: 9.5, dateSz: 9, sectionGap: 22 },
    'modern-infrastructure': { nameSz: 21, nameWt: 'heavy', nameSpacing: 0.7, labelSz: 7.5, labelLsp: 2.5, roleSz: 9, subSz: 8.5, bodySz: 8.5, dateSz: 8, sectionGap: 18 },
}

const makeStyles = (marginSize, lineSpacing, designMode) => {
    const dm = DM[designMode] || DM['executive-minimal']
    const mx = marginSize === 'tight' ? 36 : marginSize === 'spacious' ? 68 : 54
    const my = marginSize === 'tight' ? 36 : marginSize === 'spacious' ? 68 : 54
    const lh = lineSpacing === 'compact' ? 1.15 : lineSpacing === 'relaxed' ? 1.4 : 1.25

    return StyleSheet.create({
        page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingTop: my, paddingBottom: my, paddingHorizontal: mx },
        header: { marginBottom: 20, borderBottomWidth: 0.5, borderBottomColor: '#1F2A44', borderBottomStyle: 'solid', paddingBottom: 12 },
        name: { fontFamily: dm.nameWt === 'heavy' ? 'Helvetica-Bold' : 'Times-Bold', fontSize: dm.nameSz, color: '#111111', marginBottom: 4, letterSpacing: dm.nameSpacing },
        title: { fontFamily: 'Helvetica-Bold', fontSize: dm.roleSz, color: '#1F2A44', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap' },
        contactItem: { fontSize: dm.dateSz, color: '#555555' },
        contactSep: { color: '#cccccc', marginHorizontal: 8 },
        section: { marginBottom: dm.sectionGap },
        sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
        sectionLabel: { fontFamily: 'Times-Bold', fontSize: dm.labelSz, color: '#111111', textTransform: 'uppercase', letterSpacing: dm.labelLsp },
        sectionRule: { flex: 1, marginLeft: 8, height: 0.5, backgroundColor: '#1F2A44', opacity: 0.3 },
        summary: { fontFamily: 'Helvetica', fontSize: dm.bodySz, color: '#2a2a2a', lineHeight: lh, textAlign: 'justify', paddingRight: 10 },
        scale: { fontFamily: 'Helvetica', fontSize: dm.dateSz, color: '#666666', marginTop: 4, letterSpacing: 0.2 },
        expBlock: { marginBottom: 12 },
        expHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
        expRole: { fontFamily: 'Times-Bold', fontSize: dm.roleSz, color: '#1F2A44' },
        expComp: { fontFamily: 'Helvetica', fontSize: dm.subSz, color: '#444444', marginLeft: 4 },
        expMeta: { fontFamily: 'Helvetica-Oblique', fontSize: dm.dateSz, color: '#666666' },
        techRow: { flexDirection: 'row', marginBottom: 6 },
        techLabel: { fontFamily: 'Helvetica-Bold', fontSize: dm.dateSz, color: '#1F2A44' },
        techText: { fontFamily: 'Helvetica', fontSize: dm.dateSz, color: '#555555' },
        bullet: { flexDirection: 'row', marginBottom: 4, paddingRight: 6 },
        bulletMark: { fontSize: dm.bodySz, color: '#1F2A44', width: 14 },
        bulletText: { flex: 1, fontFamily: 'Helvetica', fontSize: dm.bodySz, color: '#333333', lineHeight: lh },
        eduBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
        eduTitle: { fontFamily: 'Helvetica-Bold', fontSize: dm.roleSz, color: '#111111' },
        eduInst: { fontFamily: 'Helvetica', fontSize: dm.subSz, color: '#333333', marginTop: 1 },
        eduYear: { fontFamily: 'Helvetica-Oblique', fontSize: dm.dateSz, color: '#666666' },
        certText: { fontFamily: 'Helvetica', fontSize: dm.bodySz, color: '#333333', lineHeight: lh },
        skillCat: { fontFamily: 'Helvetica-Bold', fontSize: dm.bodySz, color: '#111111', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
        skillText: { fontFamily: 'Helvetica', fontSize: dm.bodySz, color: '#444444', lineHeight: lh }
    })
}

export default function ExecutiveMinimalPDF({ career, marginSize, lineSpacing, designMode }) {
    if (!career) return <Document title="CV"><Page size="A4"><View><Text>Missing data</Text></View></Page></Document>

    const s = makeStyles(marginSize, lineSpacing, designMode)

    const positioned = applyPositioning(career)
    const vis = career.sectionVisibility || {}
    const order = career.sectionOrder?.filter(s => s !== 'keyStats') || ['summary', 'skills', 'experiences', 'education', 'certifications']

    const profile = career.profile || {}
    const contactItems = [
        profile.location,
        profile.phone,
        profile.email,
        profile.linkedin,
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
            <View key="skills" style={s.section} wrap={false}>
                <View style={s.sectionHead}><Text style={s.sectionLabel}>Core Competencies</Text><View style={s.sectionRule} /></View>
                <View style={{ flexDirection: 'column' }}>
                    {[
                        { label: 'Technical', items: positioned.skills.technical },
                        { label: 'Governance', items: positioned.skills.governance },
                        { label: 'Leadership', items: positioned.skills.leadership },
                    ].map(({ label, items }) => items && items.length > 0 && (
                        <View key={label} style={{ marginBottom: 12 }}>
                            <Text style={s.skillCat}>{label}</Text>
                            {items.map((skill, i) => (
                                <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                    <Text style={s.bulletMark}>•</Text>
                                    <Text style={s.skillText}>{cleanAndCapitalizeSkill(skill)}</Text>
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
                            {/* Force the first bullet to stay with the header, let the rest flow */}
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
    }

    return (
        <Document title={profile.name || 'CV'}>
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
