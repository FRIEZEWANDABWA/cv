import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import { applyPositioning } from '../../modules/cv-designer/cvUtils'
import { cleanAndCapitalizeSkill } from '../../modules/cv-designer/textUtils'
import { ensureFontsRegistered } from './pdfFonts'

ensureFontsRegistered()

const DM = {
    'corporate-branded': { nameSz: 22, nameWt: 700, nameSpacing: 0.4, labelSz: 8.5, labelLsp: 1.8, roleSz: 10.5, subSz: 9.5, bodySz: 9.5, dateSz: 8.5, sectionGap: 22, bandAlpha: 0.06 },
    'board-minimal': { nameSz: 23, nameWt: 700, nameSpacing: 0.2, labelSz: 9, labelLsp: 2.2, roleSz: 10.5, subSz: 9.5, bodySz: 10, dateSz: 9, sectionGap: 24, bandAlpha: 0 },
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
            paddingTop: 30, paddingBottom: 22, paddingHorizontal: m + 4,
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
        contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 },
        contactItem: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#444444' },
        contactSep: { fontFamily: 'Inter', fontSize: dm.dateSz, color: '#bbbbbb', marginHorizontal: 8 },

        /* Body */
        body: { paddingHorizontal: m + 4, paddingTop: 22 },

        /* Sections */
        section: { marginBottom: dm.sectionGap },
        sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
        sectionLabel: { fontFamily: 'Inter', fontWeight: 700, fontSize: dm.labelSz, color: '#111111', textTransform: 'uppercase', letterSpacing: dm.labelLsp },
        sectionRule: { flex: 1, marginLeft: 10, height: 0.5, backgroundColor: '#d0d0d0' },

        /* Summary */
        summary: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#1a1a1a', lineHeight: lh, textAlign: 'justify', paddingRight: 8 },
        scale: { fontFamily: 'Inter', fontWeight: 500, fontSize: dm.dateSz, color: '#555555', marginTop: 6, letterSpacing: 0.2 },

        /* Skills */
        skillRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
        skillCat: { width: 85, fontFamily: 'Inter', fontWeight: 600, fontSize: 7.5, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
        skillList: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
        skillItem: { width: '48%', fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#333333', lineHeight: 1.45, marginBottom: 2 },

        /* Experience */
        expBlock: { marginBottom: 14 },
        expHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 },
        expRole: { fontFamily: 'Inter', fontWeight: 700, fontSize: dm.roleSz, color: '#0a0a0a' },
        expComp: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.subSz, color: '#444444', marginLeft: 5 },
        expMeta: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#666666', fontStyle: 'italic' },
        techRow: { flexDirection: 'row', marginBottom: 6, marginTop: 2 },
        techLabel: { fontFamily: 'Inter', fontWeight: 600, fontSize: dm.dateSz, color: accentColor },
        techText: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#555555' },
        bullet: { flexDirection: 'row', marginBottom: 4, paddingRight: 6 },
        bulletMark: { fontFamily: 'Inter', fontSize: dm.bodySz, color: accentColor, width: 14 },
        bulletText: { flex: 1, fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#1a1a1a', lineHeight: lh },

        /* Education */
        eduBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
        eduTitle: { fontFamily: 'Inter', fontWeight: 600, fontSize: dm.roleSz, color: '#111111' },
        eduInst: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.subSz, color: '#444444', marginTop: 2 },
        eduYear: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.dateSz, color: '#777777', fontStyle: 'italic' },

        /* Certifications */
        certText: { fontFamily: 'Inter', fontWeight: 400, fontSize: dm.bodySz, color: '#222222', lineHeight: lh },
    })
}

export default function CorporateBrandedPDF({ career, accentColor, fontPair, marginSize, lineSpacing, designMode }) {
    if (!career) return <Document title="CV"><Page size="A4"><View><Text>Missing career data</Text></View></Page></Document>

    const accent = accentColor || '#C9A84C'
    const s = makeStyles(accent, marginSize || 'normal', lineSpacing || 'normal', designMode || 'corporate-branded')
    const dm = DM[designMode] || DM['corporate-branded']
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

    const order = career.sectionOrder?.filter(sec => sec !== 'keyStats') || ['summary', 'skills', 'experiences', 'certifications', 'education']

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
                        <View style={s.skillList}>
                            {items.map((skill, i) => (
                                <Text key={i} style={s.skillItem}>• {cleanAndCapitalizeSkill(skill)}</Text>
                            ))}
                        </View>
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
                            <View style={{ width: 50, height: 1.5, backgroundColor: accent, marginBottom: 8, opacity: 0.7 }} />
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
