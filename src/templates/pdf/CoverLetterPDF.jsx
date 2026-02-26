import { Document, Page, View, Text, Font, StyleSheet } from '@react-pdf/renderer'

Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff', fontWeight: 700 },
    ],
})

const makeStyles = (accentColor) => {
    return StyleSheet.create({
        page: { fontFamily: 'Inter', backgroundColor: '#ffffff', paddingTop: 0, paddingBottom: 48, paddingLeft: 0, paddingRight: 0 },
        header: {
            paddingTop: 36, paddingBottom: 24, paddingHorizontal: 40,
            backgroundColor: '#ffffff',
            borderBottomWidth: 1, borderBottomColor: '#f0f0f0', borderBottomStyle: 'solid'
        },
        name: { fontSize: 24, fontWeight: 700, color: '#000000', letterSpacing: -0.5, marginBottom: 4 },
        title: { fontSize: 10, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: 1 },
        contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
        contactItem: { fontSize: 8, color: '#555555' },
        contactSep: { color: '#cccccc', marginHorizontal: 8 },
        body: { paddingHorizontal: 40, paddingTop: 36 },
        dateText: { fontSize: 10, color: '#333333', marginBottom: 20 },
        targetText: { fontSize: 10, color: '#111111', fontWeight: 600, marginBottom: 2 },
        targetCompany: { fontSize: 10, color: '#333333', marginBottom: 24 },
        paragraph: { fontSize: 10, color: '#2d2d2d', lineHeight: 1.6, marginBottom: 16, textAlign: 'justify' },
        signOff: { fontSize: 10, color: '#2d2d2d', marginTop: 16, marginBottom: 32 },
    })
}

export default function CoverLetterPDF({ career, targetCompany, generatedText, accentColor }) {
    if (!career || !generatedText) return <Document title="Cover Letter"><Page size="A4"><View><Text>Missing data</Text></View></Page></Document>

    const s = makeStyles(accentColor || '#C9A84C')
    const profile = career.profile || {}
    const contactItems = [
        profile.email,
        profile.phone,
        profile.location,
        profile.linkedin,
    ].filter(Boolean)

    const paragraphs = generatedText.split('\n\n').filter(p => p.trim())

    return (
        <Document title={`Cover Letter - ${profile.name || 'Candidate'}`}>
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.name}>{String(profile.name || '')}</Text>
                    <Text style={s.title}>{String(profile.title || '')}</Text>
                    <View style={s.contactRow}>
                        {contactItems.map((item, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={s.contactItem}>{String(item)}</Text>
                                {i < contactItems.length - 1 ? <Text style={s.contactSep}>|</Text> : null}
                            </View>
                        ))}
                    </View>
                </View>

                <View style={s.body}>
                    <Text style={s.dateText}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={s.targetText}>Hiring Manager</Text>
                        <Text style={s.targetCompany}>{String(targetCompany || 'Target Company')}</Text>
                    </View>

                    {paragraphs.map((p, i) => (
                        <Text key={i} style={s.paragraph}>{p}</Text>
                    ))}

                    <View style={s.signOff}>
                        <Text>Sincerely,</Text>
                        <Text style={{ marginTop: 24, fontSize: 12, fontWeight: 600 }}>{String(profile.name || '')}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
