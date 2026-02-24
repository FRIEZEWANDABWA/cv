import { v4 as uuidv4 } from 'uuid'

/**
 * Attempt to parse raw CV text into the career data schema.
 * This is heuristic-based — the cleaner the PDF text, the better the result.
 */
export function parseCVText(rawText) {
    const lines = rawText
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean)

    const result = {
        profile: {
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            photo: null,
        },
        summary: '',
        positioning: 'hybrid',
        experiences: [],
        education: [],
        certifications: [],
        skills: { technical: [], governance: [], leadership: [] },
        keyStats: { budgetOwnership: '', teamSize: '', yearsExperience: '' },
        sectionOrder: ['summary', 'keyStats', 'skills', 'experiences', 'certifications', 'education'],
        sectionVisibility: {
            summary: true, keyStats: true, skills: true,
            experiences: true, certifications: true, education: true,
        },
        _rawText: rawText,
        _parsed: true,
    }

    const fullText = rawText.toLowerCase()

    // ── Email ──────────────────────────────────────────────────────────
    const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/i)
    if (emailMatch) result.profile.email = emailMatch[0]

    // ── Phone ──────────────────────────────────────────────────────────
    const phoneMatch = rawText.match(/(\+?\d[\d\s\-().]{8,17}\d)/)
    if (phoneMatch) result.profile.phone = phoneMatch[0].trim()

    // ── LinkedIn ───────────────────────────────────────────────────────
    const linkedinMatch = rawText.match(/linkedin\.com\/in\/[\w\-]+/i)
    if (linkedinMatch) result.profile.linkedin = linkedinMatch[0]

    // ── Name: typically the first non-empty short line ─────────────────
    for (const line of lines.slice(0, 6)) {
        if (line.length > 3 && line.length < 50 && !/[@|http|+\d{3}]/.test(line)) {
            result.profile.name = line
            break
        }
    }

    // ── Title: second prominent short line ─────────────────────────────
    const titleKeywords = ['manager', 'director', 'head', 'lead', 'officer', 'executive',
        'technolog', 'infrastructure', 'it ', 'engineer', 'architect', 'analyst', 'specialist']
    for (const line of lines.slice(0, 10)) {
        if (line !== result.profile.name && line.length < 80 &&
            titleKeywords.some((k) => line.toLowerCase().includes(k))) {
            result.profile.title = line
            break
        }
    }

    // ── Location ───────────────────────────────────────────────────────
    const locationMatch = rawText.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/)
    if (locationMatch) result.profile.location = locationMatch[0]

    // ── Section detection ──────────────────────────────────────────────
    const SECTION_PATTERNS = {
        summary: /^(profile|summary|executive summary|professional summary|about me|objective|career summary)/i,
        experience: /^(experience|work experience|employment|professional experience|career history|work history)/i,
        education: /^(education|academic|qualification|degree)/i,
        certifications: /^(certif|certification|accreditation|licence|license|professional development)/i,
        skills: /^(skill|competenc|technical skill|core competenc|expertise|technology)/i,
    }

    let currentSection = null
    const sectionBlocks = {}

    for (const line of lines) {
        let matched = false
        for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
            if (pattern.test(line) && line.length < 60) {
                currentSection = section
                sectionBlocks[section] = sectionBlocks[section] || []
                matched = true
                break
            }
        }
        if (!matched && currentSection) {
            sectionBlocks[currentSection] = sectionBlocks[currentSection] || []
            sectionBlocks[currentSection].push(line)
        }
    }

    // ── Summary ────────────────────────────────────────────────────────
    if (sectionBlocks.summary) {
        result.summary = sectionBlocks.summary
            .filter((l) => l.length > 20)
            .join(' ')
            .slice(0, 800)
    }

    // ── Skills ─────────────────────────────────────────────────────────
    const TECH_KEYWORDS = ['azure', 'aws', 'vmware', 'cisco', 'windows server', 'linux', 'office 365',
        'm365', 'active directory', 'networking', 'firewall', 'san', 'nas', 'itil', 'sap', 'erp',
        'oracle', 'sql', 'python', 'powershell', 'veeam', 'vsan', 'nsx', 'sd-wan', 'itsm', 'servicenow']
    const GOVERNANCE_KEYWORDS = ['iso 27001', 'iso27001', 'cobit', 'gdpr', 'sox', 'pci', 'nist',
        'risk management', 'compliance', 'audit', 'governance', 'itil', 'prince2', 'togaf']
    const LEADERSHIP_KEYWORDS = ['team leadership', 'budget management', 'vendor management',
        'stakeholder', 'strategic planning', 'change management', 'project management', 'pmo',
        'people management', 'performance management']

    const allSkillLines = (sectionBlocks.skills || []).join(' ').toLowerCase()

    TECH_KEYWORDS.forEach((kw) => {
        if (fullText.includes(kw) || allSkillLines.includes(kw)) {
            const formatted = kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            if (!result.skills.technical.includes(formatted)) result.skills.technical.push(formatted)
        }
    })
    GOVERNANCE_KEYWORDS.forEach((kw) => {
        if (fullText.includes(kw)) {
            const formatted = kw.toUpperCase().includes('ISO') ? kw.toUpperCase() :
                kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            if (!result.skills.governance.includes(formatted)) result.skills.governance.push(formatted)
        }
    })
    LEADERSHIP_KEYWORDS.forEach((kw) => {
        if (fullText.includes(kw)) {
            const formatted = kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            if (!result.skills.leadership.includes(formatted)) result.skills.leadership.push(formatted)
        }
    })

    // ── Experience blocks ──────────────────────────────────────────────
    if (sectionBlocks.experience) {
        const expLines = sectionBlocks.experience
        let currentExp = null
        const DATE_PATTERN = /(\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{4})\s*(–|-|to)\s*(\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|present|current|date|\d{4})/i
        const YEAR_ONLY = /\b(19|20)\d{2}\b/

        for (let i = 0; i < expLines.length; i++) {
            const line = expLines[i]
            const isDateLine = DATE_PATTERN.test(line) || (YEAR_ONLY.test(line) && line.length < 40)
            const isRoleLine = line.length > 3 && line.length < 80 &&
                !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('▪')

            if (isDateLine || (isRoleLine && i < 3)) {
                if (currentExp) result.experiences.push(currentExp)
                currentExp = {
                    id: uuidv4(),
                    company: '',
                    role: line,
                    period: isDateLine ? line : '',
                    location: '',
                    visible: true,
                    achievements: [],
                }
            } else if (currentExp) {
                const isBullet = /^[•\-▪▸●*]/.test(line)
                const isSignificant = line.length > 20

                if (isBullet || isSignificant) {
                    const text = line.replace(/^[•\-▪▸●*]\s*/, '').trim()
                    if (text.length > 10) {
                        currentExp.achievements.push({
                            id: uuidv4(),
                            text,
                            tags: inferTags(text),
                            metrics: extractMetrics(text),
                        })
                    }
                }
            }
        }
        if (currentExp) result.experiences.push(currentExp)
    }

    // ── Education ──────────────────────────────────────────────────────
    if (sectionBlocks.education) {
        const eduLines = sectionBlocks.education.filter((l) => l.length > 5)
        for (let i = 0; i < eduLines.length; i += 2) {
            result.education.push({
                id: uuidv4(),
                degree: eduLines[i] || '',
                field: '',
                institution: eduLines[i + 1] || '',
                year: (eduLines[i] + ' ' + (eduLines[i + 1] || '')).match(/\b(19|20)\d{2}\b/)?.[0] || '',
                visible: true,
            })
        }
    }

    // ── Certifications ─────────────────────────────────────────────────
    if (sectionBlocks.certifications) {
        sectionBlocks.certifications
            .filter((l) => l.length > 4)
            .forEach((line) => {
                result.certifications.push({
                    id: uuidv4(),
                    name: line.replace(/^[•\-▪▸●*]\s*/, '').trim(),
                    issuer: '',
                    year: line.match(/\b(19|20)\d{2}\b/)?.[0] || '',
                    valid: true,
                    visible: true,
                })
            })
    }

    return result
}

// ── Helpers ────────────────────────────────────────────────────────────────

function inferTags(text) {
    const t = text.toLowerCase()
    const tags = []
    if (/cloud|azure|aws|gcp|migration|saas/.test(t)) tags.push('Cloud')
    if (/governance|policy|framework|grc|cobit/.test(t)) tags.push('Governance')
    if (/infrastructure|server|network|datacenter|data center|san|nas|virtuali/.test(t)) tags.push('Infrastructure')
    if (/security|cyber|firewall|siem|endpoint|vulnerability/.test(t)) tags.push('Cybersecurity')
    if (/budget|cost|saving|capex|opex|financial/.test(t)) tags.push('Budget')
    if (/compliance|regulatory|audit|iso|sox|gdpr/.test(t)) tags.push('Compliance')
    if (/vendor|contract|procurement|supplier/.test(t)) tags.push('Vendor Management')
    if (/itil|service desk|incident|change management|sla|itsm/.test(t)) tags.push('ITSM')
    if (/erp|sap|oracle|dynamics|business system/.test(t)) tags.push('ERP')
    if (/digital|transform|moderniz|automat|innovat/.test(t)) tags.push('Digital Transformation')
    if (/risk|continuity|disaster|recovery|resilience/.test(t)) tags.push('Risk')
    if (/team|staff|led|manag|recruit|talent/.test(t)) tags.push('Leadership')
    return [...new Set(tags)]
}

function extractMetrics(text) {
    const metrics = []
    // Percentages
    const pct = text.match(/\d+[\.\d]*\s*%/g)
    if (pct) metrics.push(...pct)
    // Money amounts
    const money = text.match(/\$[\d,.]+[kKmMbB]?|\b[\d,]+\s*(million|billion|USD|KES|AED)/gi)
    if (money) metrics.push(...money)
    // Numbers with units
    const nums = text.match(/\b\d+\+?\s*(users?|servers?|sites?|countries|staff|team|nodes?|endpoints?)\b/gi)
    if (nums) metrics.push(...nums)
    return metrics.join(' | ')
}
