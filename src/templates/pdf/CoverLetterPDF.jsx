import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { ensureFontsRegistered } from './pdfFonts'

ensureFontsRegistered()

/* ─── Format-specific style factories ──────────────────────── */

const executiveStyles = (accent) => StyleSheet.create({
    page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: 40, paddingBottom: 40, paddingHorizontal: 52 },
    header: { borderBottomWidth: 1.5, borderBottomColor: '#111111', borderBottomStyle: 'solid', paddingBottom: 16, marginBottom: 26 },
    name: { fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: '#0a0a0a', letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
    title: { fontFamily: 'Inter', fontWeight: 600, fontSize: 9.5, color: accent, textTransform: 'uppercase', letterSpacing: 1.2 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
    contactItem: { fontFamily: 'Inter', fontWeight: 400, fontSize: 8.5, color: '#444444' },
    contactSep: { fontFamily: 'Inter', fontSize: 8.5, color: '#bbbbbb', marginHorizontal: 8 },
    dateLine: { fontFamily: 'Inter', fontWeight: 400, fontSize: 9.5, color: '#333333', marginBottom: 20 },
    targetLabel: { fontFamily: 'Inter', fontWeight: 600, fontSize: 9.5, color: '#111111', marginBottom: 2 },
    targetCompany: { fontFamily: 'Inter', fontWeight: 400, fontSize: 9.5, color: '#333333', marginBottom: 22 },
    paragraph: { fontFamily: 'Inter', fontWeight: 400, fontSize: 10, color: '#1a1a1a', lineHeight: 1.55, marginBottom: 14, textAlign: 'justify' },
    signOff: { fontFamily: 'Inter', fontWeight: 400, fontSize: 10, color: '#1a1a1a', marginTop: 16 },
    sigName: { fontFamily: 'Inter', fontWeight: 700, marginTop: 24, fontSize: 12, color: '#0a0a0a' },
})

const modernStyles = (accent) => StyleSheet.create({
    page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: 0, paddingBottom: 40, paddingHorizontal: 0 },
    header: { backgroundColor: accent, paddingTop: 30, paddingBottom: 22, paddingHorizontal: 52, marginBottom: 30 },
    name: { fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: '#ffffff', letterSpacing: 0.3, marginBottom: 4 },
    title: { fontFamily: 'Inter', fontWeight: 600, fontSize: 9, color: '#ffffffcc', textTransform: 'uppercase', letterSpacing: 1 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
    contactItem: { fontFamily: 'Inter', fontWeight: 400, fontSize: 8, color: '#ffffffbb' },
    contactSep: { fontFamily: 'Inter', fontSize: 8, color: '#ffffff55', marginHorizontal: 6 },
    body: { paddingHorizontal: 52 },
    dateLine: { fontFamily: 'Inter', fontWeight: 400, fontSize: 9.5, color: '#555555', marginBottom: 18 },
    targetLabel: { fontFamily: 'Inter', fontWeight: 600, fontSize: 9.5, color: '#111111', marginBottom: 2 },
    targetCompany: { fontFamily: 'Inter', fontWeight: 400, fontSize: 9.5, color: '#444444', marginBottom: 20 },
    paragraph: { fontFamily: 'Inter', fontWeight: 400, fontSize: 10, color: '#222222', lineHeight: 1.55, marginBottom: 14, textAlign: 'left' },
    signOff: { fontFamily: 'Inter', fontWeight: 400, fontSize: 10, color: '#222222', marginTop: 16 },
    sigName: { fontFamily: 'Inter', fontWeight: 700, marginTop: 24, fontSize: 12, color: accent },
})

const classicStyles = (accent) => StyleSheet.create({
    page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: 48, paddingBottom: 48, paddingHorizontal: 56 },
    header: { marginBottom: 28, alignItems: 'center' },
    name: { fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: '#111111', letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
    title: { fontFamily: 'Inter', fontWeight: 400, fontSize: 9, color: '#555555', textTransform: 'uppercase', letterSpacing: 1.5 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, justifyContent: 'center' },
    contactItem: { fontFamily: 'Inter', fontWeight: 400, fontSize: 8, color: '#555555' },
    contactSep: { fontFamily: 'Inter', fontSize: 8, color: '#cccccc', marginHorizontal: 6 },
    divider: { width: '100%', height: 0.5, backgroundColor: '#cccccc', marginTop: 14 },
    dateLine: { fontFamily: 'Inter', fontWeight: 400, fontSize: 9.5, color: '#444444', marginBottom: 18, marginTop: 22 },
    targetLabel: { fontFamily: 'Inter', fontWeight: 700, fontSize: 9.5, color: '#222222', marginBottom: 2 },
    targetCompany: { fontFamily: 'Inter', fontWeight: 400, fontSize: 9.5, color: '#444444', marginBottom: 20 },
    paragraph: { fontFamily: 'Inter', fontWeight: 400, fontSize: 10, color: '#222222', lineHeight: 1.5, marginBottom: 13, textAlign: 'justify' },
    signOff: { fontFamily: 'Inter', fontWeight: 400, fontSize: 10, color: '#222222', marginTop: 16 },
    sigName: { fontFamily: 'Inter', fontWeight: 700, marginTop: 24, fontSize: 12, color: '#111111' },
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
                    <View style={{ marginBottom: 22 }}>
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
