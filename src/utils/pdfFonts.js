import { Font } from '@react-pdf/renderer'

// To ensure fonts are only registered once
let fontsRegistered = false

export const registerPdfFonts = () => {
    if (fontsRegistered) return
    fontsRegistered = true

    // 1. Register Local Custom font (Nobel)
    Font.register({
        family: 'Nobel',
        fonts: [
            { src: '/fonts/Nobel-Book.otf', fontWeight: 'normal' },
            { src: '/fonts/Nobel-Bold.otf', fontWeight: 'bold' }
        ]
    })

    // 2. Register Google Fonts
    Font.register({
        family: 'Inter',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff' }, // 400
            { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZJhjp-Ek-_EeA.woff', fontWeight: 'bold' } // 700
        ]
    })

    Font.register({
        family: 'Playfair Display',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff' }, // 400
            { src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PE-QvXDXbtM.woff', fontWeight: 'bold' } // 700
        ]
    })

    Font.register({
        family: 'Roboto',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf' },
            { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' },
            { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBBc9.ttf', fontWeight: 300 } 
        ]
    })

    Font.register({
        family: 'IBM Plex Sans',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdHeFac.woff' }, // 400
            { src: 'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjQ76AIFscg.woff', fontWeight: 'bold' } // 700
        ]
    })

    Font.register({
        family: 'EB Garamond',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/ebgaramond/v26/SlGDmQSNjdsmc35JDF1K5E55YdYP4w.woff' }, // 400
            { src: 'https://fonts.gstatic.com/s/ebgaramond/v26/SlGDmQSNjdsmc35JDF1K5E5mYdYP4w.woff', fontWeight: 'bold' } // 700
        ]
    })

    Font.register({
        family: 'Raleway',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/raleway/v29/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvaorCIPrQ.woff' }, // 400
            { src: 'https://fonts.gstatic.com/s/raleway/v29/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVSepbCIPrQ.woff', fontWeight: 'bold' } // 700
        ]
    })
}
