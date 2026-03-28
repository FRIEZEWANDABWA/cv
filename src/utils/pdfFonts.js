import { Font } from '@react-pdf/renderer'

// To ensure fonts are only registered once
let fontsRegistered = false

export const registerPdfFonts = () => {
    if (fontsRegistered) return
    fontsRegistered = true

    // 1. Register Local Custom font (Nobel) — OTF is supported
    Font.register({
        family: 'Nobel',
        fonts: [
            { src: '/fonts/Nobel-Book.otf', fontWeight: 'normal' },
            { src: '/fonts/Nobel-Bold.otf', fontWeight: 'bold' }
        ]
    })

    // NOTE: @react-pdf/renderer ONLY supports TTF and OTF — NOT woff/woff2
    // All Google Font URLs below use TTF format.

    Font.register({
        family: 'Inter',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fjbvMwCp50SjIa1ZL7SUc.ttf', fontWeight: 400 },
            { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fjbvMwCp50SjIa2pL7SUc.ttf', fontWeight: 500 },
            { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fjbvMwCp50SjIa0ZL7SUc.ttf', fontWeight: 600 },
            { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fjbvMwCp50SjIatJL7SUc.ttf', fontWeight: 700 },
        ]
    })

    Font.register({
        family: 'Playfair Display',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXTPg.ttf', fontWeight: 400 },
            { src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.ttf', fontWeight: 700 },
        ]
    })

    Font.register({
        family: 'Roboto',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 400 },
            { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 700 },
            { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBBc9.ttf', fontWeight: 300 }
        ]
    })

    Font.register({
        family: 'IBM Plex Sans',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdTMdi0t.ttf', fontWeight: 400 },
            { src: 'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjQ76AIFscg.ttf', fontWeight: 700 },
        ]
    })

    Font.register({
        family: 'EB Garamond',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/ebgaramond/v26/SlGDmQSNjdsmc35JDF1K5E55YdYP4w.ttf', fontWeight: 400 },
            { src: 'https://fonts.gstatic.com/s/ebgaramond/v26/SlGDmQSNjdsmc35JDF1K5E5mY9YP4w.ttf', fontWeight: 700 },
        ]
    })

    Font.register({
        family: 'Raleway',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/raleway/v29/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvaorCIPrE.ttf', fontWeight: 400 },
            { src: 'https://fonts.gstatic.com/s/raleway/v29/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVSepbCIPrE.ttf', fontWeight: 700 },
        ]
    })

    Font.registerHyphenationCallback((word) => [word])
}
