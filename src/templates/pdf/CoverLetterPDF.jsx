import { Document, Page, View, Text, Font, StyleSheet } from '@react-pdf/renderer'

Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff', fontWeight: 700 },
    ],
})

Font.registerHyphenationCallback((word) => [word])

/* ─── Format-specific style factories ──────────────────────── */

const executiveStyles = (accent) => StyleSheet.create({
    page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: 36, paddingBottom: 36, paddingHorizontal: 48 },
    header: { borderBottomWidth: 2, borderBottomColor: '#111111', borderBottomStyle: 'solid', paddingBottom: 16, marginBottom: 24 },
    name: { fontSize: 22, fontWeight: 700, color: '#000000', letterSpacing: -0.3, marginBottom: 3, textTransform: 'uppercase' },
    title: { fontSize: 9.5, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: 1.2 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 0 },
    contactItem: { fontSize: 8, color: '#555555' },
    contactSep: { fontSize: 8, color: '#cccccc', marginHorizontal: 8 },
    dateLine: { fontSize: 9, color: '#333333', marginBottom: 18 },
    targetLabel: { fontSize: 9, color: '#111111', fontWeight: 600, marginBottom: 1 },
    targetCompany: { fontSize: 9, color: '#333333', marginBottom: 20 },
    paragraph: { fontSize: 9.5, color: '#2d2d2d', lineHeight: 1.55, marginBottom: 12, textAlign: 'justify' },
    signOff: { fontSize: 9.5, color: '#2d2d2d', marginTop: 14 },
    sigName: { marginTop: 20, fontSize: 11, fontWeight: 600, color: '#111111' },
})

const modernStyles = (accent) => StyleSheet.create({
    page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: 0, paddingBottom: 36, paddingHorizontal: 0 },
    header: { backgroundColor: accent, paddingTop: 28, paddingBottom: 20, paddingHorizontal: 48, marginBottom: 28 },
    name: { fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: 0.2, marginBottom: 3 },
    title: { fontSize: 9, fontWeight: 600, color: '#ffffffcc', textTransform: 'uppercase', letterSpacing: 1 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 0 },
    contactItem: { fontSize: 7.5, color: '#ffffffbb' },
    contactSep: { fontSize: 7.5, color: '#ffffff55', marginHorizontal: 6 },
    body: { paddingHorizontal: 48 },
    dateLine: { fontSize: 9, color: '#555555', marginBottom: 16 },
    targetLabel: { fontSize: 9, color: '#111111', fontWeight: 600, marginBottom: 1 },
    targetCompany: { fontSize: 9, color: '#444444', marginBottom: 18 },
    paragraph: { fontSize: 9.5, color: '#333333', lineHeight: 1.55, marginBottom: 12, textAlign: 'left' },
    signOff: { fontSize: 9.5, color: '#333333', marginTop: 14 },
    sigName: { marginTop: 20, fontSize: 11, fontWeight: 700, color: accent },
})

const classicStyles = (accent) => StyleSheet.create({
    page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingTop: 48, paddingBottom: 48, paddingHorizontal: 56 },
    header: { marginBottom: 28, alignItems: 'center' },
    name: { fontSize: 18, fontWeight: 700, color: '#111111', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
    title: { fontSize: 9, fontWeight: 400, color: '#555555', textTransform: 'uppercase', letterSpacing: 1.5 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 0, justifyContent: 'center' },
    contactItem: { fontSize: 7.5, color: '#666666' },
    contactSep: { fontSize: 7.5, color: '#cccccc', marginHorizontal: 6 },
    divider: { width: '100%', height: 0.5, backgroundColor: '#cccccc', marginTop: 12 },
    dateLine: { fontSize: 9, color: '#444444', marginBottom: 16, marginTop: 20 },
    targetLabel: { fontSize: 9, color: '#222222', fontWeight: 700, marginBottom: 1 },
    targetCompany: { fontSize: 9, color: '#444444', marginBottom: 18 },
    paragraph: { fontSize: 9.5, color: '#333333', lineHeight: 1.5, marginBottom: 11, textAlign: 'justify' },
    signOff: { fontSize: 9.5, color: '#333333', marginTop: 14 },
    sigName: { marginTop: 20, fontSize: 11, fontWeight: 700, color: '#111111' },
})

const FORMAT_MAP = {
    executive: executiveStyles,
    modern: modernStyles,
    classic: classicStyles,
}

/* ─── Component ────────────────────────────────────────────── */

export default function CoverLetterPDF({ career, targetCompany, generatedText, accentColor, format }) {
    if (!career || !generatedText) {
        return (
            <Document title="Cover Letter">
                <Page size="A4"><View style={{ padding: 40 }}><Text>Missing data</Text></View></Page>
            </Document>
        )
    }

    const accent = accentColor || '#C9A84C'
    const styleFn = FORMAT_MAP[format] || FORMAT_MAP['executive']
    const s = styleFn(accent)
    const profile = career.profile || {}

    const contactItems = [
        profile.email,
        profile.phone,
        profile.location,
        profile.linkedin,
    ].filter(Boolean)

    const paragraphs = generatedText.split('\n\n').filter(p => p.trim())
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const isModern = format === 'modern'

    return (
        <Document title={`Cover Letter - ${profile.name || 'Candidate'}`}>
            <Page size="A4" style={s.page}>
                {/* Header */}
                <View style={s.header}>
                    <Text style={s.name}>{String(profile.name || '')}</Text>
                    <Text style={s.title}>{String(profile.title || '')}</Text>
                    <View style={s.contactRow}>
                        {contactItems.map((item, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={s.contactItem}>{String(item)}</Text>
                                {i < contactItems.length - 1 ? <Text style={s.contactSep}>·</Text> : null}
                            </View>
                        ))}
                    </View>
                    {format === 'classic' && <View style={s.divider} />}
                </View>

                {/* Body */}
                <View style={isModern ? s.body : undefined}>
                    <Text style={s.dateLine}>{dateStr}</Text>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={s.targetLabel}>Hiring Manager</Text>
                        <Text style={s.targetCompany}>{String(targetCompany || 'Target Company')}</Text>
                    </View>

                    {paragraphs.map((p, i) => (
                        <Text key={i} style={s.paragraph}>{p.trim()}</Text>
                    ))}

                    <Text style={s.signOff}>Sincerely,</Text>
                    <Text style={s.sigName}>{String(profile.name || '')}</Text>
                </View>
            </Page>
        </Document>
    )
}
