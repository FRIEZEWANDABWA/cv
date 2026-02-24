/**
 * Shared template rendering helpers for HTML preview
 */

export function getFont(fontPair) {
    const fonts = {
        inter: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
        playfair: { heading: "'Playfair Display', Georgia, serif", body: "'Inter', sans-serif" },
        ibmplex: { heading: "'IBM Plex Sans', sans-serif", body: "'IBM Plex Sans', sans-serif" },
        garamond: { heading: "'EB Garamond', Georgia, serif", body: "'Inter', sans-serif" },
        raleway: { heading: "'Raleway', sans-serif", body: "'Inter', sans-serif" },
    }
    return fonts[fontPair] || fonts.inter
}

export function getMarginPx(marginSize) {
    switch (marginSize) {
        case 'tight': return '22px 28px'
        case 'spacious': return '48px 54px'
        default: return '36px 44px'
    }
}

export function getLineHeightVal(lineSpacing) {
    switch (lineSpacing) {
        case 'compact': return '1.35'
        case 'relaxed': return '1.7'
        default: return '1.55'
    }
}

export function formatBullets(achievements) {
    return achievements.filter((a) => a.text?.trim()).slice(0, 6)
}
