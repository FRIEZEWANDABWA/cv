import { Font } from '@react-pdf/renderer'

// To ensure fonts are only registered once
let fontsRegistered = false

export const registerPdfFonts = () => {
    if (fontsRegistered) return
    fontsRegistered = true

    // We will use standard PDF fonts (Helvetica, Times-Roman) to avoid network issues
    // react-pdf automatically handles these.
    Font.registerHyphenationCallback((word) => [word])
}
