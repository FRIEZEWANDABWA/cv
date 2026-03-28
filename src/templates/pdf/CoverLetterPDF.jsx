import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

// ── Uses ONLY built-in PDF fonts (Helvetica, Times-Roman) ──────────────
// These require zero font registration and are guaranteed to render.
// Accent font: Times-Roman (serif, professional)
// Body font:   Helvetica (clean, modern sans-serif)

const makeStyles = (accent, marginSize, lineSpacing) => {
    const m = marginSize === 'tight' ? 40 : marginSize === 'spacious' ? 62 : 52
    const lh = lineSpacing === 'compact' ? 1.4 : lineSpacing === 'relaxed' ? 1.7 : 1.55
    const pt = marginSize === 'tight' ? 32 : marginSize === 'spacious' ? 48 : 40
    const clr = accent || '#C9A84C'

    return StyleSheet.create({
        page: {
            fontFamily: 'Helvetica',
            backgroundColor: '#ffffff',
            paddingTop: pt,
            paddingBottom: pt,
            paddingHorizontal: m,
        },
        header: {
            borderBottomWidth: 1.5,
            borderBottomColor: clr,
            borderBottomStyle: 'solid',
            paddingBottom: 14,
            marginBottom: 24,
        },
        name: {
            fontFamily: 'Helvetica-Bold',
            fontSize: 20,
            color: '#0a0a0a',
            letterSpacing: 0.5,
            marginBottom: 3,
            textTransform: 'uppercase',
        },
        title: {
            fontFamily: 'Helvetica',
            fontSize: 9,
            color: clr,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        contactRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 10,
        },
        contactItem: {
            fontFamily: 'Helvetica',
            fontSize: 8.5,
            color: '#444444',
        },
        contactSep: {
            fontFamily: 'Helvetica',
            fontSize: 8.5,
            color: '#cccccc',
            marginHorizontal: 7,
        },
        dateLine: {
            fontFamily: 'Helvetica',
            fontSize: 9.5,
            color: '#555555',
            marginBottom: 18,
        },
        toLabel: {
            fontFamily: 'Helvetica-Bold',
            fontSize: 9.5,
            color: '#111111',
            marginBottom: 2,
        },
        toCompany: {
            fontFamily: 'Helvetica',
            fontSize: 9.5,
            color: '#333333',
            marginBottom: 22,
        },
        paragraph: {
            fontFamily: 'Helvetica',
            fontSize: 10,
            color: '#1a1a1a',
            lineHeight: lh,
            marginBottom: 14,
            textAlign: 'justify',
        },
        signOff: {
            fontFamily: 'Helvetica',
            fontSize: 10,
            color: '#1a1a1a',
            marginTop: 16,
        },
        sigName: {
            fontFamily: 'Helvetica-Bold',
            fontSize: 12,
            color: '#0a0a0a',
            marginTop: 22,
        },
    })
}

export default function CoverLetterPDF({
    career,
    targetCompany,
    generatedText,
    accentColor,
    marginSize,
    lineSpacing,
}) {
    const s = makeStyles(accentColor, marginSize, lineSpacing)
    const profile = career?.profile || {}

    const contactItems = [
        profile.email,
        profile.phone,
        profile.location,
        profile.linkedin,
    ].filter(Boolean)

    const paragraphs = (generatedText || '').split('\n\n').filter(p => p.trim())
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const docName = profile.name || 'Candidate'
    const docTitle = profile.title || ''

    return (
        <Document
            title={targetCompany ? `${docName} — Cover Letter for ${targetCompany}` : `${docName} — Cover Letter`}
            author={docName}
            subject={docTitle ? `Cover Letter — ${docTitle}` : 'Cover Letter'}
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
                                {i < contactItems.length - 1
                                    ? <Text style={s.contactSep}>·</Text>
                                    : null}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Body */}
                <Text style={s.dateLine}>{dateStr}</Text>
                <View style={{ marginBottom: 20 }}>
                    <Text style={s.toLabel}>Hiring Manager</Text>
                    <Text style={s.toCompany}>{String(targetCompany || 'Target Company')}</Text>
                </View>

                {paragraphs.map((p, i) => (
                    <Text key={i} style={s.paragraph}>{String(p.trim())}</Text>
                ))}

                <Text style={s.signOff}>Sincerely,</Text>
                <Text style={s.sigName}>{String(profile.name || '')}</Text>
            </Page>
        </Document>
    )
}
