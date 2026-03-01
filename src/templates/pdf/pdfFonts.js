import { Font } from '@react-pdf/renderer'

// ── Shared font registration for all PDF templates ──────────
// Register ONCE, used by all PDF components.
// Inter is a modern, highly readable sans-serif optimized for screens AND print.

let fontsRegistered = false

export function ensureFontsRegistered() {
    if (fontsRegistered) return
    fontsRegistered = true

    Font.register({
        family: 'Inter',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff', fontWeight: 400 },
            { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6YAZ9hiJ-Ek-_EeA.woff', fontWeight: 500 },
            { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff', fontWeight: 600 },
            { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff', fontWeight: 700 },
        ],
    })

    Font.registerHyphenationCallback((word) => [word])
}
