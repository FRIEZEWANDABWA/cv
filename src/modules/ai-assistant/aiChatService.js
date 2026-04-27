import { generateAIText, parseAIJsonResponse } from '../../utils/aiService'
import { EXECUTIVE_AI_PERSONA, CORPORATE_AI_PERSONA } from '../../utils/aiConstants'

// ── Complete CV data schema — every field the AI can edit ─────────────────────
const CV_SCHEMA_GUIDE = `
COMPLETE EDITABLE CV SCHEMA — you have full write access to all of these:

profile:
  name          (string) — full legal name
  title         (string) — professional title line, can separate domains with " | "
  email         (string)
  phone         (string)
  location      (string)
  linkedin      (string) — short format: "linkedin.com/in/..."
  website       (string)
  github        (string)

summary:         (string) — Professional Summary paragraph, 80–250 words

executiveScale:  (string) — one-line scope statement below summary, optional

keyAchievements: (string[]) — Career Highlights list, 4–6 items
                 Also synced to strategicImpact[] — edit keyAchievements and it will show

strategicImpact: (string[]) — same as keyAchievements, takes priority if both present

skills:          (object)   — Core Competencies, keyed by group name
  ictLeadership:       (string[])
  cloudInfrastructure: (string[])
  cybersecurity:       (string[])
  businessOperations:  (string[])
  technical:           (string[])
  governance:          (string[])
  leadership:          (string[])
  (Any new group key you create will appear automatically)

skillLabels:     (object) — display name for each skill group key
  { "ictLeadership": "ICT Leadership & Strategy", ... }

experiences:     (object[]) — Professional Experience entries
  Each entry has:
    id           (string, DO NOT change)
    role         (string) — job title
    company      (string)
    location     (string)
    period       (string) — "MM/YYYY – MM/YYYY" or "MM/YYYY – Present"
    scope        (string) — client mandate / context paragraph (italic, below header)
    technologies (string) — comma-separated tech stack
    flagshipBullet (string) — THE top headline achievement for this role (★ highlighted)
    achievements (object[]) — bullet points, each: { id: string, text: string }

certifications:  (object[]) — Professional Certifications
  Each entry: { id, name, issuer, year }

education:       (object[])
  Each entry: { id, degree, field, institution, year }

techEnvironment: (string) — Technical Skills paragraph, dot-separated items

keyMetrics:      (string[]) — optional header row items; leave [] to show expertise pillars from title

sectionLabels:   (object) — custom display names for each section
  {
    summary: "Professional Summary",
    strategicImpact: "Career Highlights",
    skills: "Core Competencies",
    experiences: "Professional Experience",
    certifications: "Professional Certifications",
    education: "Education",
    techEnvironment: "Technical Skills"
  }

sectionVisibility: (object) — toggle sections on/off
  { summary: true, strategicImpact: true, skills: true, experiences: true,
    certifications: true, education: true, techEnvironment: true, referees: false }

referees:        (string) — optional referees text

FORMATTING RULES FOR ATS SAFETY AND HUMAN-SOUNDING CONTENT:
- NEVER use the em-dash character (—). It is the #1 AI writing fingerprint. Use a comma, period, or recast the sentence instead.
- Never use ★ ● ■ or any unicode emoji inside content text fields (those are visual-only in the template)
- Never use | inside text fields (reserved as pipe separator for title pillars in the header)  
- Achievement texts: plain prose, no special characters except hyphen (-), parentheses, ampersand (&), and standard punctuation
- flagshipBullet: write as a cinematic, specific, high-stakes sentence — no bullet marker prefix — no em-dash
- techEnvironment: items separated by " · " (space-dot-space), no bullet markers
`

export async function processCvChat(chatHistory, careerData, aiConfig) {
    if (!aiConfig?.apiKey) {
        throw new Error('No API key available for AI Chat')
    }

    const historyText = chatHistory.map(m => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.text}`).join('\n')
    const persona = aiConfig?.tone === 'corporate' ? CORPORATE_AI_PERSONA : EXECUTIVE_AI_PERSONA

    const prompt = `
${persona}

You have DIRECT DATABASE CONTROL over every field of the user's CV.

${CV_SCHEMA_GUIDE}

CURRENT CV DATA (full JSON):
"""
${JSON.stringify(careerData, null, 2)}
"""

CHAT LOG:
${historyText}

TASK:
1. Read the latest USER message in the chat log carefully.
2. Apply their request precisely to the CURRENT CV DATA, modifying only the relevant fields.
3. Respect all ATS formatting rules above — especially no unicode symbols in text fields.
4. DO NOT change any "id" fields of existing items. Do not delete data unless explicitly asked.
5. If adding new achievements/experiences, generate unique string IDs (e.g. "ach_${Date.now()}").
6. After applying changes, return EXACTLY this JSON and NOTHING else:

{
  "assistantReply": "<A short, friendly 1–2 sentence message confirming exactly what you changed>",
  "updatedCareerData": <THE COMPLETE UPDATED CV JSON OBJECT — every field, even unchanged ones>
}

CRITICAL: Return ONLY valid JSON. No markdown code fences. No explanation outside the JSON.
`

    try {
        const resultText = await generateAIText(prompt, aiConfig.apiKey, aiConfig.provider)
        return parseAIJsonResponse(resultText)
    } catch (error) {
        console.error('AI Chat Error:', error)
        throw new Error('I had trouble applying those changes. My generated data might have been malformed. Please try asking again.')
    }
}

export async function processCoverLetterChat(chatHistory, coverLetterText, aiConfig) {
    if (!aiConfig?.apiKey) {
        throw new Error('No API key available for AI Chat')
    }

    const historyText = chatHistory.map(m => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.text}`).join('\n')
    const persona = aiConfig?.tone === 'corporate' ? CORPORATE_AI_PERSONA : EXECUTIVE_AI_PERSONA

    const prompt = `
${persona}

You are an expert AI Editor helping the user refine their Cover Letter.

CURRENT COVER LETTER TEXT:
"""
${coverLetterText}
"""

CHAT LOG:
${historyText}

TASK:
1. Read the latest USER message. Apply their request to the CURRENT COVER LETTER TEXT precisely.
2. Ensure you follow the strict persona tone rules — no banned phrases, human-authored voice.
3. Return EXACTLY this JSON and NOTHING else:

{
  "assistantReply": "<A short, friendly 1–2 sentence message confirming what you changed>",
  "updatedCoverLetterText": "<THE COMPLETE UPDATED COVER LETTER TEXT>"
}

CRITICAL: Return ONLY valid JSON. No markdown code fences.
`

    try {
        const resultText = await generateAIText(prompt, aiConfig.apiKey, aiConfig.provider)
        return parseAIJsonResponse(resultText)
    } catch (error) {
        console.error('AI Cover Letter Chat Error:', error)
        throw new Error('I had trouble applying those changes. My generated data might have been malformed. Please try asking again.')
    }
}
