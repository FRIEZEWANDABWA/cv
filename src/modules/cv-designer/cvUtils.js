import { POSITIONING_MODES, TAG_COLORS } from '../../utils/constants'

/**
 * Filters and sorts experiences/achievements based on active positioning mode.
 * Returns a new career object with achievements reordered.
 */
export function applyPositioning(career) {
    if (!career || !career.experiences) return career || {}
    const mode = POSITIONING_MODES.find((m) => m.id === career.positioning) || POSITIONING_MODES[3]
    const priorityTags = mode.tags || []

    const sortedExperiences = career.experiences.map((exp) => {
        if (!exp.achievements) return exp
        const sortedAchievements = [...exp.achievements].sort((a, b) => {
            const aTags = a.tags || []
            const bTags = b.tags || []
            const aScore = aTags.filter((t) => priorityTags.includes(t)).length
            const bScore = bTags.filter((t) => priorityTags.includes(t)).length
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
 * Compute CV Readiness Score (0-100) from career data.
 * This is a parse-readiness + content-strength checklist —
 * NOT a literal Workday/Greenhouse ATS parse score.
 */
export function computeATSScore(career) {
    const checks = []
    if (!career) return { score: 0, checks: [], label: 'CV Readiness Score' }

    const profile = career.profile || {}
    const experiences = career.experiences || []
    const skills = career.skills || {}
    const certifications = career.certifications || []
    const education = career.education || []

    // ── Basics (Standard Sections) ─────────────────────────────────
    checks.push({ label: 'Professional Summary present', pass: !!career.summary?.trim() })
    const allSkillItems = [
        ...(skills.technical || []),
        ...(skills.governance || []),
        ...(skills.leadership || []),
        ...(skills.ictLeadership || []),
        ...(skills.cloudInfrastructure || []),
        ...(skills.cybersecurity || []),
        ...(skills.businessOperations || []),
    ]
    checks.push({ label: 'Core Competencies listed', pass: allSkillItems.length > 4 })
    checks.push({ label: 'Professional Experience entries', pass: experiences.filter(e => e.role).length >= 2 })
    checks.push({ label: 'Certifications present', pass: certifications.filter(c => c.name).length > 0 })
    checks.push({ label: 'Education present', pass: education.filter(e => e.degree).length > 0 })

    // ── Executive Depth (Wording & Logic) ──────────────────────────
    const allAchievements = experiences.flatMap(e => (e.achievements || []).map(a => (a.text || '').toLowerCase()))
    const skillsText = allSkillItems.join(' ').toLowerCase()

    const govKeywords = ['governance', 'compliance', 'iso', 'itil', 'risk', 'audit', 'strategy', 'policy', 'isms']
    const hasGov = govKeywords.some(k => allAchievements.some(a => a.includes(k)) || skillsText.includes(k))
    checks.push({ label: 'IT Governance/Risk keywords', pass: hasGov })

    const bizKeywords = ['budget', 'cost', 'vendor', 'sla', 'stakeholder', 'roi', 'business', 'alignment', 'capex', 'opex']
    const hasBiz = bizKeywords.some(k => allAchievements.some(a => a.includes(k)) || skillsText.includes(k))
    checks.push({ label: 'Strategic/Business keywords', pass: hasBiz })

    const leads = ['led', 'directed', 'oversaw', 'spearheaded', 'managed', 'governed', 'established', 'mentored']
    const hasLead = leads.some(k => allAchievements.some(a => a.includes(k)))
    checks.push({ label: 'Strong Action Verbs (Lead/Direct)', pass: hasLead })

    // ── Structural Integrity ────────────────────────────────────────
    checks.push({ label: 'Executive Scale statement', pass: !!career.executiveScale?.trim() })
    checks.push({ label: 'Contact info (LinkedIn/Email/Phone)', pass: !!(profile.linkedin && profile.email && profile.phone) })

    // ── Metrics ─────────────────────────────────────────────────────
    const metricCount = experiences.reduce((sum, e) => sum + (e.achievements || []).filter(a => a.metrics?.trim() || /\d+%|\d+\s+centers|\d+\s+users|million|kes|usd/i.test(a.text || '')).length, 0)
    checks.push({ label: 'High metric penetration (>3)', pass: metricCount >= 3 })

    // ── Memorability Checks ─────────────────────────────────────────
    const hasFlagship = experiences.some(e => e.flagshipBullet?.trim())
    checks.push({ label: 'Flagship bullet present (★)', pass: hasFlagship })

    const openerCount = {}
    experiences.forEach(exp => {
        ;(exp.achievements || []).forEach(ach => {
            const opener = (ach.text || '').trim().split(' ')[0]?.toLowerCase()
            if (opener) openerCount[opener] = (openerCount[opener] || 0) + 1
        })
    })
    const maxRepeat = Math.max(0, ...Object.values(openerCount))
    checks.push({ label: 'Verb diversity (no verb >3×)', pass: maxRepeat < 4 })

    const hasMostRecentScope = experiences.length > 0 && !!experiences[0].scope?.trim()
    checks.push({ label: 'Current role scope statement filled', pass: hasMostRecentScope })

    const linkedinClean = !profile.linkedin || !profile.linkedin.startsWith('https://')
    checks.push({ label: 'LinkedIn URL is clean format', pass: linkedinClean, hint: 'Use linkedin.com/in/... not the full https:// URL for better ATS parsing.' })

    const passing = checks.filter((c) => c.pass).length
    const score = Math.round((passing / (checks.length || 1)) * 100)

    return { score, checks, label: 'CV Readiness Score' }
}
