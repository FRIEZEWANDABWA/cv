// All achievement tags available in the system
export const ACHIEVEMENT_TAGS = [
    'Governance',
    'Infrastructure',
    'Cloud',
    'ITSM',
    'Cybersecurity',
    'ERP',
    'Compliance',
    'Digital Transformation',
    'Budget',
    'Risk',
    'Vendor Management',
    'Leadership',
    'Strategy',
    'Project Management',
]

// Role positioning modes
export const POSITIONING_MODES = [
    { id: 'governance', label: 'Governance-Focused', tags: ['Governance', 'Risk', 'Compliance', 'ITSM'] },
    { id: 'infrastructure', label: 'Infrastructure-Focused', tags: ['Infrastructure', 'Cloud', 'Cybersecurity', 'Vendor Management'] },
    { id: 'digital', label: 'Digital Transformation', tags: ['Digital Transformation', 'Cloud', 'ERP', 'Strategy'] },
    { id: 'hybrid', label: 'Hybrid Executive', tags: ['Leadership', 'Strategy', 'Budget', 'Governance'] },
]

// Tag color map for visual display
export const TAG_COLORS = {
    'Governance': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    'Infrastructure': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    'Cloud': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    'ITSM': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    'Cybersecurity': 'bg-red-500/15 text-red-300 border-red-500/30',
    'ERP': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    'Compliance': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    'Digital Transformation': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'Budget': 'bg-green-500/15 text-green-300 border-green-500/30',
    'Risk': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    'Vendor Management': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    'Leadership': 'bg-gold-500/15 text-gold-400 border-gold-500/30',
    'Strategy': 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    'Project Management': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
}

// JD keyword dictionary for client-side analysis
export const JD_KEYWORDS = {
    governance: ['governance', 'grc', 'risk', 'compliance', 'audit', 'policy', 'framework', 'control', 'regulatory', 'sox', 'iso', 'cobit', 'itil'],
    infrastructure: ['infrastructure', 'datacenter', 'data center', 'network', 'server', 'virtualization', 'vmware', 'storage', 'backup', 'disaster recovery', 'dr', 'ha', 'uptime', 'lan', 'wan', 'sd-wan'],
    cloud: ['cloud', 'azure', 'aws', 'gcp', 'saas', 'paas', 'iaas', 'migration', 'hybrid cloud', 'cloud strategy', 'microsoft 365', 'm365', 'office 365'],
    itsm: ['itsm', 'service desk', 'helpdesk', 'incident', 'change management', 'service management', 'sla', 'kpi', 'ticket', 'support'],
    security: ['security', 'cybersecurity', 'cyber', 'siem', 'soc', 'endpoint', 'firewall', 'vulnerability', 'penetration', 'zero trust', 'mfa', 'iam', 'identity'],
    erp: ['erp', 'sap', 'oracle', 'dynamics', 'sage', 'enterprise resource', 'implementation', 'integration', 'business system'],
    leadership: ['leadership', 'team lead', 'head of', 'director', 'manager', 'strategic', 'c-suite', 'stakeholder', 'board', 'executive', 'vp', 'cio', 'cto'],
    budget: ['budget', 'capex', 'opex', 'cost', 'vendor', 'contract', 'procurement', 'roi', 'saving', 'reduction'],
    digital: ['digital transformation', 'digitization', 'automation', 'innovation', 'agile', 'devops', 'modernization', 'change management'],
}

// Weak phrases to flag in NL refinement (Phase 2 active, Phase 1 data only)
export const WEAK_PHRASES = [
    'responsible for', 'helped with', 'worked on', 'assisted in',
    'involved in', 'participated in', 'was part of', 'duties included',
    'tasks included', 'handled', 'dealt with'
]

// Strong executive impact verbs
export const IMPACT_VERBS = [
    'Architected', 'Led', 'Delivered', 'Negotiated', 'Reduced', 'Improved',
    'Deployed', 'Transformed', 'Established', 'Streamlined', 'Consolidated',
    'Spearheaded', 'Achieved', 'Launched', 'Managed', 'Directed', 'Oversaw',
    'Implemented', 'Designed', 'Built', 'Drove', 'Accelerated', 'Optimized',
    'Secured', 'Migrated', 'Integrated', 'Modernized', 'Standardized',
]

// CV accent color presets
export const ACCENT_COLORS = [
    { id: 'gold', label: 'Executive Gold', value: '#C9A84C' },
    { id: 'navy', label: 'Deep Navy', value: '#1e3a5f' },
    { id: 'slate', label: 'Corporate Slate', value: '#475569' },
    { id: 'forest', label: 'Forest Authority', value: '#2d6a4f' },
    { id: 'burgundy', label: 'Burgundy Power', value: '#7c2d3e' },
    { id: 'charcoal', label: 'Charcoal Elite', value: '#374151' },
]

// CV font presets
export const CV_FONTS = [
    { id: 'inter', label: 'Inter (Modern)', heading: 'Inter', body: 'Inter' },
    { id: 'playfair', label: 'Playfair + Inter (Executive)', heading: 'Playfair Display', body: 'Inter' },
    { id: 'ibmplex', label: 'IBM Plex (Technical)', heading: 'IBM Plex Sans', body: 'IBM Plex Sans' },
    { id: 'garamond', label: 'EB Garamond (Classical)', heading: 'EB Garamond', body: 'Inter' },
    { id: 'raleway', label: 'Raleway (Contemporary)', heading: 'Raleway', body: 'Inter' },
]
