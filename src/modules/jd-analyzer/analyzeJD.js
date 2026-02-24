import { JD_KEYWORDS, POSITIONING_MODES } from '../../utils/constants'

/**
 * Tokenizes JD text into lowercase, cleaned word set
 */
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s\-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2)
}

/**
 * Counts how many times keywords appear in token list (with multi-word support)
 */
function countMatches(tokens, keywords) {
    const textLower = tokens.join(' ')
    return keywords.filter((kw) => textLower.includes(kw)).length
}

/**
 * Main JD analysis function — returns full analysis object
 */
export function analyzeJD(jdText, career) {
    if (!jdText.trim()) return null

    const tokens = tokenize(jdText)
    const wordCount = tokens.length
    const textLower = tokens.join(' ')

    // ── Category Scores ─────────────────────────────────────────────────
    const categoryScores = {}
    const categoryMatches = {}

    Object.entries(JD_KEYWORDS).forEach(([cat, keywords]) => {
        const matched = keywords.filter((kw) => textLower.includes(kw))
        categoryScores[cat] = matched.length
        categoryMatches[cat] = matched
    })

    // ── Determine Primary Emphasis ───────────────────────────────────────
    const sorted = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])
    const topCategories = sorted.slice(0, 3).map(([cat]) => cat)

    // ── Extract All JD Keywords (top 25) ────────────────────────────────
    const allJdKeywords = []
    Object.values(JD_KEYWORDS).flat().forEach((kw) => {
        if (textLower.includes(kw) && !allJdKeywords.includes(kw)) {
            allJdKeywords.push(kw)
        }
    })
    const topKeywords = allJdKeywords.slice(0, 30)

    // ── Build CV text corpus for matching ───────────────────────────────
    const cvCorpus = [
        career.summary,
        career.experiences.flatMap((e) => [
            e.role, e.company,
            e.achievements.map((a) => a.text + ' ' + a.metrics).join(' '),
        ]).join(' '),
        career.skills.technical.join(' '),
        career.skills.governance.join(' '),
        career.skills.leadership.join(' '),
        career.certifications.map((c) => c.name).join(' '),
        career.experiences.flatMap((e) => e.achievements.flatMap((a) => a.tags)).join(' '),
    ].join(' ').toLowerCase()

    // ── Keyword Presence in CV ──────────────────────────────────────────
    const presentKeywords = topKeywords.filter((kw) => cvCorpus.includes(kw))
    const missingKeywords = topKeywords.filter((kw) => !cvCorpus.includes(kw))

    // ── Overall ATS Match Score ─────────────────────────────────────────
    const matchScore = topKeywords.length > 0
        ? Math.round((presentKeywords.length / topKeywords.length) * 100)
        : 0

    // ── Suggested Positioning Mode ──────────────────────────────────────
    let suggestedPositioning = 'hybrid'
    if (topCategories.includes('governance') || topCategories.includes('security')) {
        suggestedPositioning = 'governance'
    } else if (topCategories.includes('infrastructure') || topCategories.includes('cloud')) {
        suggestedPositioning = 'infrastructure'
    } else if (topCategories.includes('erp') || topCategories.includes('digital')) {
        suggestedPositioning = 'digital'
    }

    // ── Tag Emphasis (which CV tags to prioritize) ─────────────────────
    const tagEmphasis = []
    if (categoryScores.governance > 1) tagEmphasis.push('Governance', 'Risk', 'Compliance')
    if (categoryScores.infrastructure > 1) tagEmphasis.push('Infrastructure', 'Vendor Management')
    if (categoryScores.cloud > 1) tagEmphasis.push('Cloud', 'Digital Transformation')
    if (categoryScores.security > 1) tagEmphasis.push('Cybersecurity')
    if (categoryScores.erp > 1) tagEmphasis.push('ERP')
    if (categoryScores.itsm > 1) tagEmphasis.push('ITSM')
    if (categoryScores.budget > 1) tagEmphasis.push('Budget')
    if (categoryScores.leadership > 1) tagEmphasis.push('Leadership', 'Strategy')

    return {
        matchScore,
        presentKeywords,
        missingKeywords,
        topKeywords,
        categoryScores,
        categoryMatches,
        topCategories,
        suggestedPositioning,
        tagEmphasis: [...new Set(tagEmphasis)],
        wordCount,
    }
}
