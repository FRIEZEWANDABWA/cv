/**
 * toneEngine.js — Executive Tone & Integrity Layer
 * Rule-based only. No LLM. No keyword stuffing.
 */

// ── Verb Banks by Mode ──────────────────────────────────────────────────────
export const TONE_VERBS = {
    governance: [
        'directed', 'governed', 'oversaw', 'spearheaded', 'established',
        'instituted', 'enforced', 'chaired', 'mandated', 'ratified',
        'supervised', 'steered', 'formulated', 'presided', 'authorized',
    ],
    infrastructure: [
        'designed', 'architected', 'scaled', 'implemented', 'deployed',
        'engineered', 'configured', 'built', 'integrated', 'constructed',
        'provisioned', 'commissioned', 'consolidated', 'migrated', 'hardened',
    ],
    digital: [
        'transformed', 'modernized', 'optimized', 'enabled', 'accelerated',
        'automated', 'digitized', 'pioneered', 'innovated', 'streamlined',
        'catalyzed', 'reinvented', 'orchestrated', 'digitally enabled', 'drove',
    ],
    hybrid: [
        'led', 'delivered', 'managed', 'championed', 'advanced',
        'developed', 'executed', 'strengthened', 'elevated', 'grew',
    ],
}

// ── Weak / Passive Phrases ──────────────────────────────────────────────────
const WEAK_VERBS = [
    'was responsible for', 'responsible for', 'helped', 'assisted with',
    'worked on', 'involved in', 'participated in', 'was part of',
    'supported the', 'contributed to',
]

// ── AI-Generated / Buzzword Flags ──────────────────────────────────────────
const BUZZWORDS = [
    'synergy', 'synergies', 'dynamic', 'proactive', 'leverage', 'leveraging',
    'utilize', 'utilization', 'robust', 'innovative', 'innovation-driven',
    'results-driven', 'passionate about', 'thought leader', 'disruptive',
    'game-changing', 'best-in-class', 'cutting-edge', 'holistic',
    'value-add', 'paradigm', 'move the needle', 'boil the ocean',
]

// ── Generic Summary Phrases ─────────────────────────────────────────────────
const GENERIC_SUMMARY = [
    'passionate professional', 'dynamic individual', 'results-oriented',
    'hardworking', 'team player', 'good communication skills',
    'attention to detail', 'fast learner', 'self-motivated',
    'outside the box',
]

// ── Symmetrical Metric Pattern (formulaic) ─────────────────────────────────
const FORMULAIC_METRIC = /\(\d+[\+%]?[^)]{0,20}\)/g

/**
 * Score an achievement text against the tone mode.
 * Returns 0–100 score and the matched verbs.
 */
export function scoreToneVerbs(text, mode) {
    const lower = text.toLowerCase()
    const verbs = TONE_VERBS[mode] || TONE_VERBS.hybrid
    const matched = verbs.filter((v) => lower.includes(v))
    const score = Math.min(100, Math.round((matched.length / 3) * 100))
    return { score, matched }
}

/**
 * Suggest a stronger opening verb for an achievement based on mode.
 * Returns null if the existing opener is already strong.
 */
export function suggestToneVerb(text, mode) {
    const lower = text.toLowerCase().trim()
    const verbs = TONE_VERBS[mode] || TONE_VERBS.hybrid
    const allVerbs = Object.values(TONE_VERBS).flat()

    // Already starts with a strong verb?
    const startsStrong = verbs.some((v) => lower.startsWith(v))
    if (startsStrong) return null

    // Starts with a weak phrase?
    const weakMatch = WEAK_VERBS.find((w) => lower.startsWith(w))

    // Find best replacement — pick the most contextually relevant
    const suggestion = verbs.find((v) => !lower.includes(v)) || verbs[0]

    return {
        original: weakMatch || text.split(' ').slice(0, 2).join(' '),
        suggestion: capitalizeFirst(suggestion),
        reason: weakMatch
            ? `"${capitalizeFirst(weakMatch)}" is passive — replace with a decisive executive verb`
            : `For ${mode} positioning, consider opening with "${capitalizeFirst(suggestion)}"`,
    }
}

/**
 * Full tone integrity check on an achievement or summary block.
 * Returns array of flags.
 */
export function toneIntegrityCheck(text) {
    const lower = text.toLowerCase()
    const flags = []

    // Buzzwords
    BUZZWORDS.forEach((bw) => {
        if (lower.includes(bw)) {
            flags.push({
                type: 'buzzword',
                severity: 'medium',
                match: bw,
                message: `Remove "${bw}" — it reads as filler and reduces executive credibility.`,
            })
        }
    })

    // Generic summary phrases
    GENERIC_SUMMARY.forEach((g) => {
        if (lower.includes(g)) {
            flags.push({
                type: 'generic',
                severity: 'high',
                match: g,
                message: `"${g}" is a generic CV phrase. Replace with a specific, quantified claim.`,
            })
        }
    })

    // Weak passive openers
    WEAK_VERBS.forEach((w) => {
        if (lower.startsWith(w)) {
            flags.push({
                type: 'passive',
                severity: 'high',
                match: w,
                message: `Opens with weak phrase "${w}". Start with a decisive action verb.`,
            })
        }
    })

    // Formulaic metrics e.g. "(20% savings, 1000 users)"
    const formulaic = text.match(FORMULAIC_METRIC)
    if (formulaic && formulaic.length > 2) {
        flags.push({
            type: 'formulaic',
            severity: 'low',
            match: formulaic.join(', '),
            message: 'Multiple parenthetical metrics may feel templated. Vary the presentation.',
        })
    }

    return flags
}

/**
 * Audit entire CV text for AI-generated feel.
 * Returns overall risk score (0-100) and flags.
 */
export function auditAIFeel(achievements) {
    const allFlags = []
    const openerCount = {}

    achievements.forEach((ach) => {
        const text = ach.text || ''
        const opener = text.trim().split(' ')[0]?.toLowerCase()

        // Count repeated openers
        if (opener) {
            openerCount[opener] = (openerCount[opener] || 0) + 1
        }

        // Run integrity check
        const flags = toneIntegrityCheck(text)
        if (flags.length > 0) {
            allFlags.push({ id: ach.id, text, flags })
        }
    })

    // Flag repeated openers (≥3 times)
    Object.entries(openerCount).forEach(([verb, count]) => {
        if (count >= 3) {
            allFlags.push({
                id: 'opener-repeat',
                text: '',
                flags: [{
                    type: 'repetition',
                    severity: 'high',
                    match: verb,
                    message: `"${capitalizeFirst(verb)}" starts ${count} bullets — vary your sentence openers.`,
                }],
            })
        }
    })

    const totalFlags = allFlags.reduce((n, a) => n + a.flags.length, 0)
    const highFlags = allFlags.reduce((n, a) => n + a.flags.filter((f) => f.severity === 'high').length, 0)
    const riskScore = Math.min(100, totalFlags * 8 + highFlags * 15)

    return { riskScore, flagged: allFlags }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
