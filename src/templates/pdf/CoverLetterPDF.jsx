import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

/* ─── Format-specific style factories (built-in fonts only) ── */

const executiveStyles = (accent) => StyleSheet.create({
    page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingTop: 36, paddingBottom: 36, paddingHorizontal: 48 },
    header: { borderBottomWidth: 2, borderBottomColor: '#111111', borderBottomStyle: 'solid', paddingBottom: 16, marginBottom: 24 },
    name: { fontFamily: 'Helvetica-Bold', fontSize: 22, color: '#000000', letterSpacing: -0.3, marginBottom: 3, textTransform: 'uppercase' },
    title: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: accent, textTransform: 'uppercase', letterSpacing: 1.2 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
    contactItem: { fontSize: 8, color: '#555555' },
    contactSep: { fontSize: 8, color: '#cccccc', marginHorizontal: 8 },
    dateLine: { fontSize: 9, color: '#333333', marginBottom: 18 },
    targetLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#111111', marginBottom: 1 },
    targetCompany: { fontSize: 9, color: '#333333', marginBottom: 20 },
    paragraph: { fontSize: 9.5, color: '#2d2d2d', lineHeight: 1.55, marginBottom: 12, textAlign: 'justify' },
    signOff: { fontSize: 9.5, color: '#2d2d2d', marginTop: 14 },
    sigName: { fontFamily: 'Helvetica-Bold', marginTop: 20, fontSize: 11, color: '#111111' },
})

const modernStyles = (accent) => StyleSheet.create({
    page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingTop: 0, paddingBottom: 36, paddingHorizontal: 0 },
    header: { backgroundColor: accent, paddingTop: 28, paddingBottom: 20, paddingHorizontal: 48, marginBottom: 28 },
    name: { fontFamily: 'Helvetica-Bold', fontSize: 20, color: '#ffffff', letterSpacing: 0.2, marginBottom: 3 },
    title: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#ffffffcc', textTransform: 'uppercase', letterSpacing: 1 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
    contactItem: { fontSize: 7.5, color: '#ffffffbb' },
    contactSep: { fontSize: 7.5, color: '#ffffff55', marginHorizontal: 6 },
    body: { paddingHorizontal: 48 },
    dateLine: { fontSize: 9, color: '#555555', marginBottom: 16 },
    targetLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#111111', marginBottom: 1 },
    targetCompany: { fontSize: 9, color: '#444444', marginBottom: 18 },
    paragraph: { fontSize: 9.5, color: '#333333', lineHeight: 1.55, marginBottom: 12, textAlign: 'left' },
    signOff: { fontSize: 9.5, color: '#333333', marginTop: 14 },
    sigName: { fontFamily: 'Helvetica-Bold', marginTop: 20, fontSize: 11, color: accent },
})

const classicStyles = (accent) => StyleSheet.create({
    page: { fontFamily: 'Times-Roman', backgroundColor: '#ffffff', paddingTop: 48, paddingBottom: 48, paddingHorizontal: 56 },
    header: { marginBottom: 28, alignItems: 'center' },
    name: { fontFamily: 'Times-Bold', fontSize: 18, color: '#111111', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
    title: { fontSize: 9, color: '#555555', textTransform: 'uppercase', letterSpacing: 1.5 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' },
    contactItem: { fontSize: 7.5, color: '#666666' },
    contactSep: { fontSize: 7.5, color: '#cccccc', marginHorizontal: 6 },
    divider: { width: '100%', height: 0.5, backgroundColor: '#cccccc', marginTop: 12 },
    dateLine: { fontSize: 9, color: '#444444', marginBottom: 16, marginTop: 20 },
    targetLabel: { fontFamily: 'Times-Bold', fontSize: 9, color: '#222222', marginBottom: 1 },
    targetCompany: { fontSize: 9, color: '#444444', marginBottom: 18 },
    paragraph: { fontSize: 9.5, color: '#333333', lineHeight: 1.5, marginBottom: 11, textAlign: 'justify' },
    signOff: { fontSize: 9.5, color: '#333333', marginTop: 14 },
    sigName: { fontFamily: 'Times-Bold', marginTop: 20, fontSize: 11, color: '#111111' },
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
                    {format === 'classic' && s.divider ? <View style={s.divider} /> : null}
                </View>

                {/* Body */}
                <View style={isModern ? s.body : undefined}>
                    <Text style={s.dateLine}>{dateStr}</Text>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={s.targetLabel}>Hiring Manager</Text>
                        <Text style={s.targetCompany}>{String(targetCompany || 'Target Company')}</Text>
                    </View>

                    {paragraphs.map((p, i) => (
                        <Text key={i} style={s.paragraph}>{String(p.trim())}</Text>
                    ))}

                    <Text style={s.signOff}>Sincerely,</Text>
                    <Text style={s.sigName}>{String(profile.name || '')}</Text>
                </View>
            </Page>
        </Document>
    )
}
