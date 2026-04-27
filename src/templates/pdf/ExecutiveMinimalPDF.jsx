import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { applyPositioning } from '../../modules/cv-designer/cvUtils'
import { cleanAndCapitalizeSkill } from '../../modules/cv-designer/textUtils'
import { ensureFontsRegistered } from './pdfFonts'

ensureFontsRegistered()

// ── Executive palette (fixed) ─────────────────────────────────────────────────
const NAVY     = '#0B1F3A'
const IVORY    = '#FAF9F6'
const CHARCOAL = '#2E2E2E'
const WARM_BG  = '#F0EDE8'   // warm tinted band for experience headers
const RULE     = '#E0DAD1'   // warm hairline colour

// ── Design mode size tokens ───────────────────────────────────────────────────
const DM = {
    'executive-minimal':     { nameSz: 21, nameWt: 700, nameSpacing: 2.5, labelSz: 7,   labelLsp: 1,   roleSz: 9.5, subSz: 8.5, bodySz: 8.5, dateSz: 8,   sectionGap: 11 },
    'global-executive':      { nameSz: 23, nameWt: 700, nameSpacing: 2,   labelSz: 7,   labelLsp: 1,   roleSz: 10,  subSz: 9,   bodySz: 9.5, dateSz: 8.5, sectionGap: 16 },
    'modern-infrastructure': { nameSz: 20, nameWt: 800, nameSpacing: 3,   labelSz: 6.5, labelLsp: 1,   roleSz: 9.5, subSz: 8.5, bodySz: 9,   dateSz: 8,   sectionGap: 12 },
    'executive-standard':    { nameSz: 21, nameWt: 700, nameSpacing: 2.5, labelSz: 7,   labelLsp: 1,   roleSz: 9.5, subSz: 8.5, bodySz: 8.5, dateSz: 8,   sectionGap: 11 },
}

const getFonts = (fp) => {
    // Force system fonts to ensure 100% rendering reliability
    return { h: 'Times-Roman', b: 'Helvetica' }
}

// ── Style factory ─────────────────────────────────────────────────────────────
function makeStyles(gold, marginSize, lineSpacing, designMode, fontPair) {
    const dm  = DM[designMode] || DM['executive-minimal']
    const mx  = marginSize === 'tight' ? 36 : marginSize === 'spacious' ? 56 : 46
    const my  = marginSize === 'tight' ? 30 : marginSize === 'spacious' ? 52 : 40
    const lh  = lineSpacing === 'compact' ? 1.3 : lineSpacing === 'relaxed' ? 1.55 : 1.42
    const { h, b } = getFonts(fontPair)

    return { dm, lh, mx, my, fh: h, fb: b, styles: StyleSheet.create({

        // Page — ivory background
        page: {
            fontFamily: b,
            backgroundColor: IVORY,
            paddingTop: 0,
            paddingBottom: my,
            paddingLeft: 0,
            paddingRight: 0,
        },

        // Left accent spine
        spine: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, backgroundColor: gold },

        // ── Header band — restructured for sub-elements ──────────────────────
        header:    { backgroundColor: NAVY },
        headerTop: { paddingTop: 12, paddingLeft: mx + 3, paddingRight: mx, paddingBottom: 4 },
        name: {
            fontFamily: h, fontWeight: 700, fontSize: 26,
            color: '#FFFFFF', letterSpacing: 0.5,
            textTransform: 'uppercase', lineHeight: 1.05,
        },
        // Full-width gold rule (no horizontal padding, so it bleeds edge-to-edge)
        nameBar: { height: 2.5, backgroundColor: gold, marginLeft: 3, marginRight: 0 },
        headerMid: { paddingLeft: mx + 3, paddingRight: mx, paddingTop: 6, paddingBottom: 6 },

        // Expertise pillars row
        pillarsRow: {
            flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 6,
        },
        pillarText: {
            fontFamily: b, fontSize: 8.5, color: '#C9A84A',
            fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase',
        },
        pillarSep: {
            fontFamily: b, fontSize: 6, color: gold, marginHorizontal: 7,
        },
        // Positioning statement
        posStatement: {
            fontFamily: h, fontStyle: 'italic', fontSize: 9.5,
            color: '#EEF3FA', marginBottom: 12, lineHeight: 1.45,
        },
        // Pre-computed: rgba(255,255,255,0.12) on #0B1F3A navy = #192F48
        headerSep: { height: 0.5, backgroundColor: '#1E3352', marginBottom: 8 },

        // Contact block — 3-line structured
        // Pre-computed: rgba(255,255,255,0.6) on navy = #9DB0C5
        contactLine1: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 3 },
        contactLine2: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
        contactLine3: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
        contactItem: { fontFamily: b, fontSize: 7, color: '#AABFD6', fontWeight: 400 },
        contactLabel: { fontFamily: b, fontSize: 7, color: '#C9A84A', fontWeight: 700, marginRight: 3 },
        contactSub:   { fontFamily: b, fontSize: 7, color: '#97AECC', fontWeight: 400 },
        // Pre-computed: rgba(255,255,255,0.22) on navy = #3B5168
        contactSep:   { fontFamily: b, fontSize: 7, color: '#3D5672', marginHorizontal: 6 },

        // Stats strip — bottom band of header
        // Pre-computed: rgba(0,0,0,0.25) on #0B1F3A = #08172B
        statsStrip: {
            backgroundColor: '#08172B',
            flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
            paddingVertical: 10, paddingLeft: mx + 3, paddingRight: mx,
            borderTopWidth: 0.5, borderTopColor: '#1E3352', borderTopStyle: 'solid',
        },
        statItem: {
            fontFamily: h, fontWeight: 700, fontSize: 8.5, color: '#C9A84A',
            letterSpacing: 1.2, textTransform: 'uppercase',
        },
        statSep: {
            fontFamily: b, fontSize: 10, color: '#314763', marginHorizontal: 8, fontWeight: 300
        },

        // ── Body ────────────────────────────────────────────────────────────
        body: { paddingLeft: mx + 3, paddingRight: mx, paddingTop: 8 },
        section: { marginBottom: dm.sectionGap },

        // Section heading
        sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
        sectionDot: { width: 4, height: 4, backgroundColor: gold, borderRadius: 1, marginRight: 8 },
        sectionLabel: {
            fontFamily: h, fontWeight: 700, fontSize: dm.labelSz,
            color: NAVY, textTransform: 'uppercase', letterSpacing: dm.labelLsp,
        },
        sectionRule: { flex: 1, marginLeft: 9, height: 0.4, backgroundColor: RULE },

        // ── Summary ─────────────────────────────────────────────────────────
        summary: { fontFamily: b, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: lh, textAlign: 'justify' },
        scale:   { fontFamily: b, fontSize: 7.5, color: '#7a7060', marginTop: 5, letterSpacing: 0.2 },

        // ── Career Highlights — numbered, left gold channel ──────────────────
        impactChannel: {
            borderLeftWidth: 2, borderLeftColor: '#B08D5766', borderLeftStyle: 'solid', paddingLeft: 12,
        },
        impactRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7 },
        impactNum:  { fontFamily: h, fontWeight: 700, fontSize: 9, color: gold, width: 20, marginTop: 0.5, letterSpacing: -0.3 },
        impactText: { flex: 1, fontFamily: b, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: lh, paddingRight: 4 },

        // ── Skills ───────────────────────────────────────────────────────────
        skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
        skillCol:   { width: '31%', marginBottom: 10 },
        skillCat:   {
            fontFamily: h, fontWeight: 700, fontSize: 7, color: NAVY,
            textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4,
            paddingBottom: 2, borderBottomWidth: 0.8, borderBottomColor: '#C9A84A', borderBottomStyle: 'solid',
        },
        skillItem: { fontFamily: b, fontSize: 8, color: CHARCOAL, marginBottom: 2, lineHeight: 1.4 },

        // ── Experience ───────────────────────────────────────────────────────
        expBlock: { marginBottom: 14 },
        expHeader: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
            backgroundColor: WARM_BG, paddingVertical: 6, paddingHorizontal: 9,
            borderLeftWidth: 3, borderLeftColor: gold, borderLeftStyle: 'solid',
            marginBottom: 6,
        },
        expRoleCol: { flex: 1 },
        expRole: { fontFamily: h, fontWeight: 700, fontSize: dm.roleSz, color: NAVY, lineHeight: 1.2 },
        expComp: { fontFamily: b, fontSize: dm.subSz - 0.5, color: '#5a5040', marginTop: 1.5 },
        expDate: { fontFamily: b, fontSize: dm.dateSz - 0.5, color: gold, fontStyle: 'italic', marginLeft: 8, marginTop: 1 },

        expScope: {
            fontFamily: b, fontStyle: 'italic', fontSize: dm.dateSz, color: '#5a5040',
            lineHeight: lh, marginBottom: 6, paddingLeft: 9,
            borderLeftWidth: 1, borderLeftColor: RULE, borderLeftStyle: 'solid',
        },

        // Flagship bullet — ATS clean: visual via thick left border + tinted bg, no unicode in text
        flagshipWrap: {
            flexDirection: 'row', alignItems: 'flex-start',
            backgroundColor: '#F5EFE2',
            borderLeftWidth: 3, borderLeftColor: gold, borderLeftStyle: 'solid',
            borderRadius: 1,
            paddingVertical: 5, paddingHorizontal: 9, marginBottom: 6,
        },
        flagshipText: { flex: 1, fontFamily: b, fontWeight: 600, fontSize: dm.bodySz, color: NAVY, lineHeight: lh },

        // Achievement bullets
        bullet:     { flexDirection: 'row', marginBottom: 4, paddingRight: 4 },
        bulletMark: { fontFamily: b, fontSize: 9, color: gold, width: 14, marginTop: 0.5, opacity: 0.7 },
        bulletText: { flex: 1, fontFamily: b, fontSize: dm.bodySz, color: CHARCOAL, lineHeight: lh },

        // Tech stack
        techRow:   { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5, paddingLeft: 2 },
        techLabel: { fontFamily: h, fontWeight: 700, fontSize: dm.dateSz - 0.5, color: gold },
        techText:  { fontFamily: b, fontSize: dm.dateSz - 0.5, color: '#6a6558' },

        // ── Certifications ───────────────────────────────────────────────────
        certGrid:    { flexDirection: 'row', flexWrap: 'wrap' },
        certCell:    { width: '50%', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7, paddingRight: 10 },
        certBadge:   { backgroundColor: NAVY, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 1, marginRight: 7, marginTop: 2 },
        certYear:    { fontFamily: h, fontWeight: 700, fontSize: 6, color: '#FFFFFF', letterSpacing: 0.3 },
        certName:    { fontFamily: b, fontWeight: 600, fontSize: dm.dateSz, color: NAVY, lineHeight: 1.3, flex: 1 },
        certIssuer:  { fontFamily: b, fontSize: 6.5, color: '#7a7060', marginTop: 1.5 },

        // ── Education ────────────────────────────────────────────────────────
        eduBlock: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 8, paddingLeft: 8,
            borderLeftWidth: 2, borderLeftColor: gold + '35', borderLeftStyle: 'solid',
        },
        eduTitle: { fontFamily: h, fontWeight: 600, fontSize: dm.roleSz, color: NAVY },
        eduInst:  { fontFamily: b, fontSize: dm.subSz - 0.5, color: '#6a6558', marginTop: 1.5 },
        eduYear:  { fontFamily: b, fontSize: dm.dateSz, color: gold, fontStyle: 'italic', flexShrink: 0, marginLeft: 8 },

        // ── Tech Environment ─────────────────────────────────────────────────
        techEnvText: { fontFamily: b, fontSize: dm.bodySz - 0.5, color: CHARCOAL, lineHeight: 1.75 },
    })}
}

// ── Skill groups ──────────────────────────────────────────────────────────────
const SKILL_GROUPS = [
    { key: 'ictLeadership',       label: 'ICT Strategy & Leadership' },
    { key: 'cloudInfrastructure', label: 'Cloud & Infrastructure' },
    { key: 'cybersecurity',       label: 'Cybersecurity & Governance' },
    { key: 'businessOperations',  label: 'Business & Operations' },
    { key: 'technical',           label: 'Technical' },
    { key: 'governance',          label: 'Governance' },
    { key: 'leadership',          label: 'Leadership' },
]

function renderSkills({ layout = 'columns3', skills, s, skillLabels = {}, gold }) {
    if (!skills) return null
    const active = SKILL_GROUPS.filter(g => skills[g.key]?.length > 0)
    if (!active.length) return null

    if (layout === 'badge') {
        const all = active.flatMap(g => skills[g.key].map(sk => cleanAndCapitalizeSkill(sk)))
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {all.map((sk, i) => (
                    <View key={i} style={{ backgroundColor: gold + '18', borderWidth: 0.4, borderColor: gold + '40', borderStyle: 'solid', borderRadius: 2, paddingHorizontal: 5, paddingVertical: 2, marginRight: 4, marginBottom: 4 }}>
                        <Text style={{ fontFamily: s.skillItem.fontFamily, fontSize: 8, color: NAVY }}>{sk}</Text>
                    </View>
                ))}
            </View>
        )
    }

    if (layout === 'compact') {
        return (
            <View>
                {active.map(({ key, label }) => (
                    <View key={key} style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text style={{ fontFamily: s.skillCat.fontFamily, fontWeight: 700, fontSize: 7, color: NAVY, width: 105, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                            {skillLabels[key] || label}
                        </Text>
                        <Text style={[s.skillItem, { flex: 1, marginBottom: 0, color: CHARCOAL }]}>
                            {skills[key].map(sk => cleanAndCapitalizeSkill(sk)).join('  ·  ')}
                        </Text>
                    </View>
                ))}
            </View>
        )
    }

    if (layout === 'inline') {
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {active.map(({ key, label }) => (
                    <View key={key} style={{ width: '47%', flexDirection: 'row', marginBottom: 5, paddingRight: 8 }}>
                        <Text style={{ fontFamily: s.skillCat.fontFamily, fontSize: 7, color: gold, marginRight: 4 }}>▸</Text>
                        <Text style={{ fontFamily: s.skillItem.fontFamily, fontSize: 8, color: CHARCOAL, lineHeight: 1.4, flex: 1 }}>
                            <Text style={{ fontWeight: 700, color: NAVY, fontSize: 7, textTransform: 'uppercase', letterSpacing: 0.6 }}>{skillLabels[key] || label}: </Text>
                            {skills[key].map(sk => cleanAndCapitalizeSkill(sk)).join(', ')}
                        </Text>
                    </View>
                ))}
            </View>
        )
    }

    // columns2 / columns3 default
    const isTwoCol = layout === 'columns2'
    return (
        <View style={s.skillsGrid}>
            {active.map(({ key, label }) => (
                <View key={key} style={[s.skillCol, { width: isTwoCol ? '47%' : '31%' }]}>
                    <Text style={s.skillCat}>{skillLabels[key] || label}</Text>
                    {skills[key].map((sk, i) => (
                        <Text key={i} style={s.skillItem}>· {cleanAndCapitalizeSkill(sk)}</Text>
                    ))}
                </View>
            ))}
        </View>
    )
}

// ── Main PDF component ────────────────────────────────────────────────────────
export default function ExecutiveMinimalPDF({ career, accentColor, fontPair, marginSize, lineSpacing, designMode }) {
    if (!career) return (
        <Document title="CV" author="Frieze Wandabwa" producer="Frieze Wandabwa Resume">
            <Page size="A4"><View><Text>Missing data</Text></View></Page>
        </Document>
    )

    const gold = accentColor || '#B08D57'
    const { dm, lh, mx, my, fh, fb, styles: s } = makeStyles(gold, marginSize || 'normal', lineSpacing || 'normal', designMode || 'executive-minimal', fontPair || 'playfair')

    const positioned = applyPositioning(career)
    const vis = career.sectionVisibility || {}
    let order = career.sectionOrder?.filter(sec => sec !== 'keyStats') || ['summary', 'strategicImpact', 'skills', 'experiences', 'education', 'certifications', 'techEnvironment', 'referees']
    if (!order.includes('strategicImpact')) order.splice(1, 0, 'strategicImpact')
    if (!order.includes('techEnvironment')) order.push('techEnvironment')
    if (!order.includes('referees')) order.push('referees')
    order = [...new Set(order)]

    const profile = career.profile || {}
    const sl = career.sectionLabels || {}
    const labels = {
        summary:         sl.summary         || 'PROFESSIONAL SUMMARY',
        strategicImpact: sl.strategicImpact || 'CAREER HIGHLIGHTS',
        skills:          sl.skills          || 'CORE COMPETENCIES',
        experiences:     sl.experiences     || 'PROFESSIONAL EXPERIENCE',
        certifications:  sl.certifications  || 'PROFESSIONAL CERTIFICATIONS',
        education:       sl.education       || 'EDUCATION',
        techEnvironment: sl.techEnvironment || 'TECHNICAL SKILLS',
    }

    const contactItems = [profile.email, profile.phone, profile.location, profile.linkedin, profile.website, profile.github].filter(Boolean)

    // Expertise pillars + new data fields
    const titlePillars = (profile.title || '').split('|').map(s => s.trim()).filter(Boolean).slice(1)
    const softMetrics  = (career.keyMetrics || []).filter(Boolean)
    const pillars      = softMetrics.length > 0 ? softMetrics : titlePillars
    const statsStrip   = (career.statsStrip || []).filter(Boolean)
    const posStatement = career.positioningStatement || ''

    const docName = profile.name || 'CV'
    const docTitle = profile.title || ''
    const skillKeywords = Object.values(career.skills || {}).flat().slice(0, 12).join(', ')

    // Section heading component
    const SectionHead = ({ label }) => (
        <View style={s.sectionHead}>
            <View style={s.sectionDot} />
            <Text style={s.sectionLabel}>{label}</Text>
            <View style={s.sectionRule} />
        </View>
    )

    const renders = {
        summary: () => vis.summary !== false && positioned.summary && (
            <View key="summary" style={s.section}>
                <SectionHead label={labels.summary} />
                <Text style={s.summary}>{String(positioned.summary)}</Text>
                {positioned.executiveScale ? <Text style={s.scale}>{String(positioned.executiveScale)}</Text> : null}
            </View>
        ),

        keyAchievements: () => null,

        strategicImpact: () => {
            const items = career.strategicImpact?.length > 0
                ? career.strategicImpact
                : (career.keyAchievements?.length > 0 ? career.keyAchievements : [])
            if (vis.strategicImpact === false || !items.length) return null
            return (
                <View key="strategicImpact" style={s.section}>
                    <SectionHead label={labels.strategicImpact} />
                    {/* Left gold channel spine */}
                    <View style={s.impactChannel}>
                        {items.map((item, i) => (
                            <View key={i} style={[s.impactRow, i === items.length - 1 && { marginBottom: 0 }]}>
                                <Text style={s.impactNum}>{String(i + 1).padStart(2, '0')}</Text>
                                <Text style={s.impactText}>{String(item)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )
        },

        skills: () => {
            const has = SKILL_GROUPS.some(g => positioned.skills?.[g.key]?.length > 0)
            if (vis.skills === false || !has) return null
            return (
                <View key="skills" style={s.section} wrap={false}>
                    <SectionHead label={labels.skills} />
                    {renderSkills({ layout: career.skillsLayout || 'columns3', skills: positioned.skills, s, skillLabels: career.skillLabels, gold })}
                </View>
            )
        },

        experiences: () => vis.experiences !== false && positioned.experiences && (
            <View key="experiences" style={s.section}>
                <SectionHead label={labels.experiences} />
                {positioned.experiences.filter(e => e.role).map((exp) => (
                    <View key={exp.id || Math.random()} style={s.expBlock}>
                        {/* Role header band */}
                        <View style={s.expHeader} wrap={false}>
                            <View style={s.expRoleCol}>
                                <Text style={s.expRole}>{String(exp.role || '')}</Text>
                                {exp.company ? <Text style={s.expComp}>{String(exp.company)}{exp.location ? `  ·  ${String(exp.location)}` : ''}</Text> : null}
                            </View>
                            <Text style={s.expDate}>{String(exp.period || '')}</Text>
                        </View>

                        {/* Scope / mandate */}
                        {exp.scope ? <Text style={s.expScope}>{String(exp.scope)}</Text> : null}

                        {/* Flagship bullet — ATS-clean: thick left border visual, no unicode star in text */}
                        {exp.flagshipBullet ? (
                            <View style={s.flagshipWrap} wrap={false}>
                                <Text style={s.flagshipText}>{String(exp.flagshipBullet)}</Text>
                            </View>
                        ) : null}

                        {/* Technologies */}
                        {exp.technologies ? (
                            <View style={s.techRow} wrap={false}>
                                <Text style={s.techLabel}>Tech Stack:  </Text>
                                <Text style={s.techText}>{exp.technologies.split(',').map(t => cleanAndCapitalizeSkill(t.trim())).join('  ·  ')}</Text>
                            </View>
                        ) : null}

                        {/* Achievements */}
                        <View wrap={false}>
                            {(exp.achievements || []).slice(0, 1).map((ach, i) => (
                                <View key={i} style={s.bullet}>
                                    <Text style={s.bulletMark}>–</Text>
                                    <Text style={s.bulletText}>{String(ach.text || '')}</Text>
                                </View>
                            ))}
                        </View>
                        {(exp.achievements || []).slice(1).map((ach, i) => (
                            <View key={i + 1} style={s.bullet} wrap={false}>
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
                <SectionHead label={labels.certifications} />
                <View style={s.certGrid}>
                    {positioned.certifications.filter(c => c.name).map((c) => (
                        <View key={c.id || c.name} style={s.certCell}>
                            {c.year ? (
                                <View style={s.certBadge}>
                                    <Text style={s.certYear}>{String(c.year)}</Text>
                                </View>
                            ) : null}
                            <View style={{ flex: 1 }}>
                                <Text style={s.certName}>{String(c.name)}</Text>
                                {c.issuer ? <Text style={s.certIssuer}>{String(c.issuer)}</Text> : null}
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        ),

        education: () => vis.education !== false && positioned.education && (
            <View key="education" style={s.section} wrap={false}>
                <SectionHead label={labels.education} />
                {positioned.education.filter(e => e.degree).map((edu) => (
                    <View key={edu.id || Math.random()} style={s.eduBlock}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.eduTitle}>{String(edu.degree || '')}{edu.field ? `, ${String(edu.field)}` : ''}</Text>
                            {edu.institution ? <Text style={s.eduInst}>{String(edu.institution)}</Text> : null}
                        </View>
                        {edu.year ? <Text style={s.eduYear}>{String(edu.year)}</Text> : null}
                    </View>
                ))}
            </View>
        ),

        techEnvironment: () => {
            if (vis.techEnvironment === false) return null
            const defaultTech = 'Microsoft 365 · Microsoft Azure · AWS · Cisco Networking · Fortinet Security · Active Directory · SD-WAN · LAN/WAN Infrastructure · Endpoint Security · Backup & DR · Network Monitoring · Virtualization'
            return (
                <View key="techEnvironment" style={s.section} wrap={false}>
                    <SectionHead label={labels.techEnvironment} />
                    <Text style={s.techEnvText}>{String(career.techEnvironment || defaultTech)}</Text>
                </View>
            )
        },

        referees: () => vis.referees !== false && career.referees && (
            <View key="referees" style={s.section} wrap={false}>
                <SectionHead label="REFEREES" />
                <Text style={s.summary}>{String(career.referees)}</Text>
            </View>
        ),
    }

    return (
        <Document
            title={docTitle ? `${docName} - ${docTitle}` : docName}
            author={docName}
            subject={docTitle}
            keywords={skillKeywords}
            creator={docName}
            producer="Frieze Wandabwa Resume"
            compress={false}
        >
            <Page size="A4" style={s.page}>
                {/* Left spine — runs full page height */}
                <View style={s.spine} fixed />

                {/* ══ HEADER — Deep Navy ══ */}
                <View style={s.header}>
                    <View style={s.headerTop}>
                        {/* 1. NAME FIRST — Dominant anchor */}
                        <Text style={s.name}>{String(profile.name || 'Your Name')}</Text>

                        {/* 2. EXECUTIVE TITLE SECOND — No ambiguity */}
                        <Text style={s.pillarText}>
                            {String(profile.tagline || 'IT Manager | Enterprise Infrastructure | Cloud Platforms | Cybersecurity Governance')}
                        </Text>

                        {/* 3. STRATEGIC LEADERSHIP STATEMENT — Ownership line */}
                        {posStatement && (
                            <Text style={s.posStatement}>{String(posStatement)}</Text>
                        )}
                    </View>

                    {/* 4. GOLD STRUCTURAL DIVIDER — Separates identity from operational proof */}
                    <View style={s.nameBar} />

                    <View style={s.headerMid}>
                        {/* 5. CONTACT IDENTITY BLOCK — Optimized 2-line layout */}
                        <View style={{ marginBottom: 1 }}>
                            {/* Line 1: Location | Phone | Email */}
                            <View style={s.contactLine1}>
                                {[profile.location, profile.phone, profile.email].filter(Boolean).map((item, i, arr) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={s.contactItem}>{String(item)}</Text>
                                        {i < arr.length - 1 ? <Text style={s.contactSep}>|</Text> : null}
                                    </View>
                                ))}
                            </View>
                            
                            {/* Line 2: Links combined to save space */}
                            <View style={s.contactLine2}>
                                {profile.linkedin ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={s.contactLabel}>LinkedIn:</Text>
                                        <Text style={s.contactSub}>{String(profile.linkedin)}</Text>
                                    </View>
                                ) : null}
                                
                                {profile.website ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {profile.linkedin ? <Text style={s.contactSep}>|</Text> : null}
                                        <Text style={s.contactLabel}>Portfolio:</Text>
                                        <Text style={s.contactSub}>{String(profile.website)}</Text>
                                    </View>
                                ) : null}

                                {profile.github ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {(profile.linkedin || profile.website) ? <Text style={s.contactSep}>|</Text> : null}
                                        <Text style={s.contactLabel}>GitHub:</Text>
                                        <Text style={s.contactSub}>{String(profile.github)}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>

                    {/* 6. EXECUTIVE METRICS STRIP — Recruiter bait (Navy Bar) */}
                    {statsStrip.length > 0 && (
                        <View style={s.statsStrip}>
                            {statsStrip.map((stat, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={s.statItem}>{String(stat)}</Text>
                                    {i < statsStrip.length - 1 ? <Text style={s.statSep}>|</Text> : null}
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Gold bridge strip */}
                <View style={s.bridge} />

                {/* ══ BODY ══ */}
                <View style={s.body}>
                    {order.map(id => renders[id] ? renders[id]() : null)}
                </View>
            </Page>
        </Document>
    )
}
