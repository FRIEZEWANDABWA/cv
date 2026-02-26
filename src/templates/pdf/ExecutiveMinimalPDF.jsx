import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { applyPositioning } from '../../modules/cv-designer/cvUtils'
import { cleanAndCapitalizeSkill } from '../../modules/cv-designer/textUtils'

// Direct built-in PDF fonts for ultra-reliability and standard executive compliance
// Times-Roman mimics Cambria
// Helvetica mimics Calibri

const s = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        paddingTop: 54, // 0.75 inch
        paddingBottom: 54,
        paddingLeft: 54,
        paddingRight: 54
    },
    header: { marginBottom: 16 },
    name: {
        fontFamily: 'Times-Roman',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2A44',
        marginBottom: 2
    },
    title: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 11,
        color: '#1F2A44',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap' },
    contactItem: { fontSize: 9, color: '#333333' },
    contactSep: { color: '#999999', marginHorizontal: 6 },
    section: { marginBottom: 14 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    sectionLabel: {
        fontFamily: 'Times-Roman',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2A44',
        textTransform: 'uppercase'
    },
    sectionRule: { flex: 1, marginLeft: 8, height: 0.5, backgroundColor: '#1F2A44', opacity: 0.3 },
    summary: {
        fontFamily: 'Helvetica',
        fontSize: 11,
        color: '#000000',
        lineHeight: 1.15,
        textAlign: 'justify'
    },
    skillRow: { flexDirection: 'row', marginBottom: 4 },
    skillCat: {
        width: 100,
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        color: '#1F2A44',
        marginTop: 1
    },
    skillList: {
        flex: 1,
        fontFamily: 'Helvetica',
        fontSize: 11,
        color: '#000000',
        lineHeight: 1.15
    },
    expBlock: { marginBottom: 10 },
    expHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
    expRole: { fontFamily: 'Times-Roman', fontSize: 11, fontWeight: 'bold', color: '#1F2A44' },
    expComp: { fontFamily: 'Helvetica-Oblique', fontSize: 10, color: '#333333', marginLeft: 4 },
    expMeta: { fontFamily: 'Helvetica', fontSize: 10, color: '#555555' },
    techRow: { flexDirection: 'row', marginBottom: 6 },
    techLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#1F2A44' },
    techText: { fontFamily: 'Helvetica', fontSize: 9, color: '#555555' },
    bullet: { flexDirection: 'row', marginBottom: 3 },
    bulletMark: { fontSize: 11, color: '#000000', width: 12 },
    bulletText: { flex: 1, fontFamily: 'Helvetica', fontSize: 11, color: '#000000', lineHeight: 1.15 },
    eduBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
    eduTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#000000' },
    eduInst: { fontFamily: 'Helvetica', fontSize: 11, color: '#333333', marginTop: 1 },
    eduYear: { fontFamily: 'Helvetica', fontSize: 10, color: '#555555' },
    certText: { fontFamily: 'Helvetica', fontSize: 11, color: '#000000', lineHeight: 1.15 },
})

export default function ExecutiveMinimalPDF({ career }) {
    if (!career) return <Document title="CV"><Page size="A4"><View><Text>Missing data</Text></View></Page></Document>

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
                        <Text style={s.skillList}>{items.map(s => cleanAndCapitalizeSkill(s)).join('  ·  ')}</Text>
                    </View>
                ))}
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
                    <Text style={s.name}>{String(profile.name || 'FRIEZE KERE WANDABWA').toUpperCase()}</Text>
                    <Text style={s.title}>{String(profile.title || 'Senior IT Executive')}</Text>
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
