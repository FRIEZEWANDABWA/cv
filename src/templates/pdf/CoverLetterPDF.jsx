import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { ensureFontsRegistered } from './pdfFonts'

ensureFontsRegistered()

/* ─── Format-specific style factories (built-in fonts for reliability) ── */

const getFontFamilies = (fp) => {
    switch (fp) {
        case 'playfair': return { h: 'Playfair Display', b: 'Inter' }
        case 'garamond': return { h: 'EB Garamond', b: 'Inter' }
        case 'raleway': return { h: 'Raleway', b: 'Inter' }
        case 'nobel': return { h: 'Nobel', b: 'Inter' }
        case 'ibmplex': return { h: 'IBM Plex Sans', b: 'IBM Plex Sans' }
        case 'calibri': return { h: 'Helvetica', b: 'Helvetica' } // Standard PDF fallback for generic sans
        default: return { h: 'Inter', b: 'Inter' }
    }
}

const executiveStyles = (accent, fp, marginSize, lineSpacing) => {
    const { h, b } = getFontFamilies(fp)
    const m = marginSize === 'tight' ? 40 : marginSize === 'spacious' ? 62 : 52
    const lh = lineSpacing === 'compact' ? 1.4 : lineSpacing === 'relaxed' ? 1.7 : 1.55
    const pt = marginSize === 'tight' ? 32 : marginSize === 'spacious' ? 48 : 40

    return StyleSheet.create({
        page: { fontFamily: b, backgroundColor: '#ffffff', paddingTop: pt, paddingBottom: pt, paddingHorizontal: m },
        header: { borderBottomWidth: 1.5, borderBottomColor: '#111111', borderBottomStyle: 'solid', paddingBottom: 16, marginBottom: 26 },
        name: { fontFamily: h, fontWeight: 'bold', fontSize: 22, color: '#0a0a0a', letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
        title: { fontFamily: h, fontWeight: 'bold', fontSize: 9.5, color: accent, textTransform: 'uppercase', letterSpacing: 1.2 },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
        contactItem: { fontFamily: b, fontSize: 8.5, color: '#444444' },
        contactSep: { fontFamily: b, fontSize: 8.5, color: '#bbbbbb', marginHorizontal: 8 },
        dateLine: { fontFamily: b, fontSize: 9.5, color: '#333333', marginBottom: 20 },
        targetLabel: { fontFamily: h, fontWeight: 'bold', fontSize: 9.5, color: '#111111', marginBottom: 2 },
        targetCompany: { fontFamily: b, fontSize: 9.5, color: '#333333', marginBottom: 22 },
        paragraph: { fontFamily: b, fontSize: 10, color: '#1a1a1a', lineHeight: lh, marginBottom: 14, textAlign: 'justify' },
        signOff: { fontFamily: b, fontSize: 10, color: '#1a1a1a', marginTop: 16 },
        sigName: { fontFamily: h, fontWeight: 'bold', marginTop: 24, fontSize: 12, color: '#0a0a0a' },
    })
}

const modernStyles = (accent, fp, marginSize, lineSpacing) => {
    const { h, b } = getFontFamilies(fp)
    const m = marginSize === 'tight' ? 40 : marginSize === 'spacious' ? 62 : 52
    const lh = lineSpacing === 'compact' ? 1.4 : lineSpacing === 'relaxed' ? 1.7 : 1.55
    const pt = marginSize === 'tight' ? 32 : marginSize === 'spacious' ? 48 : 40

    return StyleSheet.create({
        page: { fontFamily: b, backgroundColor: '#ffffff', paddingTop: 0, paddingBottom: pt, paddingHorizontal: 0 },
        header: { backgroundColor: accent, paddingTop: 30, paddingBottom: 22, paddingHorizontal: m, marginBottom: 30 },
        name: { fontFamily: h, fontWeight: 'bold', fontSize: 20, color: '#ffffff', letterSpacing: 0.3, marginBottom: 4 },
        title: { fontFamily: h, fontWeight: 'bold', fontSize: 9, color: '#ffffffcc', textTransform: 'uppercase', letterSpacing: 1 },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
        contactItem: { fontFamily: b, fontSize: 8, color: '#ffffffbb' },
        contactSep: { fontFamily: b, fontSize: 8, color: '#ffffff55', marginHorizontal: 6 },
        body: { paddingHorizontal: m },
        dateLine: { fontFamily: b, fontSize: 9.5, color: '#555555', marginBottom: 18 },
        targetLabel: { fontFamily: h, fontWeight: 'bold', fontSize: 9.5, color: '#111111', marginBottom: 2 },
        targetCompany: { fontFamily: b, fontSize: 9.5, color: '#444444', marginBottom: 20 },
        paragraph: { fontFamily: b, fontSize: 10, color: '#222222', lineHeight: lh, marginBottom: 14, textAlign: 'left' },
        signOff: { fontFamily: b, fontSize: 10, color: '#222222', marginTop: 16 },
        sigName: { fontFamily: h, fontWeight: 'bold', marginTop: 24, fontSize: 12, color: accent },
    })
}

const classicStyles = (accent, fp, marginSize, lineSpacing) => {
    const { h, b } = getFontFamilies(fp)
    const m = marginSize === 'tight' ? 44 : marginSize === 'spacious' ? 66 : 56
    const lh = lineSpacing === 'compact' ? 1.35 : lineSpacing === 'relaxed' ? 1.6 : 1.5
    const pt = marginSize === 'tight' ? 40 : marginSize === 'spacious' ? 56 : 48

    return StyleSheet.create({
        page: { fontFamily: b, backgroundColor: '#ffffff', paddingTop: pt, paddingBottom: pt, paddingHorizontal: m },
        header: { marginBottom: 28, alignItems: 'center' },
        name: { fontFamily: h, fontWeight: 'bold', fontSize: 18, color: '#111111', letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
        title: { fontFamily: b, fontSize: 9, color: '#555555', textTransform: 'uppercase', letterSpacing: 1.5 },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, justifyContent: 'center' },
        contactItem: { fontFamily: b, fontSize: 8, color: '#555555' },
        contactSep: { fontFamily: b, fontSize: 8, color: '#cccccc', marginHorizontal: 6 },
        divider: { width: '100%', height: 0.5, backgroundColor: '#cccccc', marginTop: 14 },
        dateLine: { fontFamily: b, fontSize: 9.5, color: '#444444', marginBottom: 18, marginTop: 22 },
        targetLabel: { fontFamily: h, fontWeight: 'bold', fontSize: 9.5, color: '#222222', marginBottom: 2 },
        targetCompany: { fontFamily: b, fontSize: 9.5, color: '#444444', marginBottom: 20 },
        paragraph: { fontFamily: b, fontSize: 10, color: '#222222', lineHeight: lh, marginBottom: 13, textAlign: 'justify' },
        signOff: { fontFamily: b, fontSize: 10, color: '#222222', marginTop: 16 },
        sigName: { fontFamily: h, fontWeight: 'bold', marginTop: 24, fontSize: 12, color: '#111111' },
    })
}

const FORMAT_MAP = {
    executive: executiveStyles,
    modern: modernStyles,
    classic: classicStyles,
}

/* ─── Component ────────────────────────────────────────────── */

export default function CoverLetterPDF({ career, targetCompany, generatedText, accentColor, format, fontPair, marginSize, lineSpacing }) {
    if (!career || !generatedText) {
        return (
            <Document title="Cover Letter" author="CareerWeapon" producer="CareerWeapon CV Engine">
                <Page size="A4"><View style={{ padding: 40 }}><Text>Missing data</Text></View></Page>
            </Document>
        )
    }

    const accent = accentColor || '#C9A84C'
    const fp = fontPair || 'inter'
    const styleFn = FORMAT_MAP[format] || FORMAT_MAP['executive']
    const s = styleFn(accent, fp, marginSize, lineSpacing)
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

    const docName = profile.name || 'Candidate'
    const docTitle = profile.title || ''
    const coverTitle = targetCompany
        ? `${docName} — Cover Letter for ${targetCompany}`
        : `${docName} — Cover Letter`

    return (
        <Document
            title={coverTitle}
            author={docName}
            subject={docTitle ? `Cover Letter — ${docTitle}` : 'Cover Letter'}
            keywords={docTitle}
            creator={docName}
            producer="CareerWeapon CV Engine"
        >
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
