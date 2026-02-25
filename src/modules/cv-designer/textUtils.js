export function cleanAndCapitalizeSkill(skill) {
    if (!skill) return ''

    // 1. Remove trailing or leading hyphens/artifacts
    let cleaned = skill.replace(/^-+|-+$/g, '').trim()

    // 2. Exact word capitalization mapping for common IT terms
    const EXACT_MATCHES = {
        'aws': 'AWS',
        'vmware': 'VMware',
        'cisco': 'Cisco',
        'm365': 'M365',
        'itil': 'ITIL',
        'erp': 'ERP',
        'oracle': 'Oracle',
        'sql': 'SQL',
        'azure': 'Azure',
        'gcp': 'GCP',
        'api': 'API',
        'ci/cd': 'CI/CD',
        'devops': 'DevOps',
        'saas': 'SaaS',
        'paas': 'PaaS',
        'iaas': 'IaaS',
        'kpi': 'KPI',
        'okr': 'OKR',
        'ceo': 'CEO',
        'cio': 'CIO',
        'cto': 'CTO',
        'ciso': 'CISO',
        'roi': 'ROI',
        'sla': 'SLA',
        'p&l': 'P&L',
        'crm': 'CRM',
        'hris': 'HRIS',
    }

    const lower = cleaned.toLowerCase()
    if (EXACT_MATCHES[lower]) {
        return EXACT_MATCHES[lower]
    }

    // 3. Fallback: Title Case (capitalize first letter of each word)
    return cleaned.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
}
