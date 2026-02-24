import { POSITIONING_MODES, TAG_COLORS } from '../../utils/constants'

/**
 * Filters and sorts experiences/achievements based on active positioning mode.
 * Returns a new career object with achievements reordered.
 */
export function applyPositioning(career) {
    const mode = POSITIONING_MODES.find((m) => m.id === career.positioning) || POSITIONING_MODES[3]
    const priorityTags = mode.tags

    const sortedExperiences = career.experiences.map((exp) => {
        const sortedAchievements = [...exp.achievements].sort((a, b) => {
            const aScore = a.tags.filter((t) => priorityTags.includes(t)).length
            const bScore = b.tags.filter((t) => priorityTags.includes(t)).length
            return bScore - aScore
        })
        return { ...exp, achievements: sortedAchievements }
    })

    return { ...career, experiences: sortedExperiences }
}

/**
 * Returns margin values in points based on margin setting
 */
export function getMargins(marginSize) {
    switch (marginSize) {
        case 'tight': return { top: 28, right: 32, bottom: 28, left: 32 }
        case 'spacious': return { top: 50, right: 54, bottom: 50, left: 54 }
        default: return { top: 38, right: 44, bottom: 38, left: 44 }
    }
}

/**
 * Returns line height multiplier
 */
export function getLineHeight(lineSpacing) {
    switch (lineSpacing) {
        case 'compact': return 1.3
        case 'relaxed': return 1.7
        default: return 1.5
    }
}

/**
 * Compute basic ATS score (0-100) from career data
 */
export function computeATSScore(career) {
    const checks = []

    // ── Basics (Standard Sections) ─────────────────────────────────
    checks.push({ label: 'Professional Summary present', pass: !!career.summary?.trim() })
    checks.push({ label: 'Core Competencies listed', pass: (career.skills.technical?.length || 0) + (career.skills.governance?.length || 0) > 4 })
    checks.push({ label: 'Professional Experience entries', pass: career.experiences.filter(e => e.role).length >= 2 })
    checks.push({ label: 'Certifications present', pass: career.certifications.filter(c => c.name).length > 0 })
    checks.push({ label: 'Education present', pass: career.education.filter(e => e.degree).length > 0 })

    // ── Executive Depth (Wording & Logic) ──────────────────────────
    const allAchievements = career.experiences.flatMap(e => e.achievements.map(a => a.text.toLowerCase()))
    const skillsText = [
        ...career.skills.technical,
        ...career.skills.governance,
        ...career.skills.leadership
    ].join(' ').toLowerCase()

    const govKeywords = ['governance', 'compliance', 'iso', 'itil', 'risk', 'audit', 'strategy', 'policy', 'isms', 'isms']
    const hasGov = govKeywords.some(k => allAchievements.some(a => a.includes(k)) || skillsText.includes(k))
    checks.push({ label: 'IT Governance/Risk keywords', pass: hasGov })

    const bizKeywords = ['budget', 'cost', 'vendor', 'sla', 'stakeholder', 'roi', 'business', 'alignment', 'capex', 'opex']
    const hasBiz = bizKeywords.some(k => allAchievements.some(a => a.includes(k)) || skillsText.includes(k))
    checks.push({ label: 'Strategic/Business keywords', pass: hasBiz })

    const leads = ['led', 'directed', 'oversaw', 'spearheaded', 'managed', 'governed', 'established', 'led', 'mentored']
    const hasLead = leads.some(k => allAchievements.some(a => a.includes(k)))
    checks.push({ label: 'Strong Action Verbs (Lead/Direct)', pass: hasLead })

    // ── Structural Integrity ────────────────────────────────────────
    checks.push({ label: 'Executive Scale statement', pass: !!career.executiveScale?.trim() })
    checks.push({ label: 'Contact info (LinkedIn/Email/Phone)', pass: !!(career.profile.linkedin && career.profile.email && career.profile.phone) })

    // ── Metrics ─────────────────────────────────────────────────────
    const metricCount = career.experiences.reduce((sum, e) => sum + e.achievements.filter(a => a.metrics?.trim() || /\d+%|\d+\s+centers|\d+\s+users|million|kes|usd/i.test(a.text)).length, 0)
    checks.push({ label: 'High metric penetration (>3)', pass: metricCount >= 3 })

    const passing = checks.filter((c) => c.pass).length
    const score = Math.round((passing / checks.length) * 100)

    return { score, checks }
}
