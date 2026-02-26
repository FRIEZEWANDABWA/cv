import { generateAIText } from '../../utils/aiService'
import { EXECUTIVE_AI_PERSONA, CORPORATE_AI_PERSONA } from '../../utils/aiConstants'

export async function aiGenerateCoverLetter(careerData, coverLetterState, aiConfig) {
    if (!aiConfig?.apiKey) {
        throw new Error("No API key available for Cover Letter Generation")
    }

    const { targetCompany, targetRole, jdContext } = coverLetterState
    const persona = aiConfig?.tone === 'corporate' ? CORPORATE_AI_PERSONA : EXECUTIVE_AI_PERSONA

    const cvContext = `
Name: ${careerData.profile.name}
Title: ${careerData.profile.title}
Summary: ${careerData.summary}
Experiences:
${careerData.experiences.map(e => `${e.role} at ${e.company}:\n${e.achievements.map(a => `- ${a.text}`).join('\n')}`).join('\n\n')}
Skills:
Technical: ${careerData.skills.technical.join(', ')}
Governance: ${careerData.skills.governance.join(', ')}
Leadership: ${careerData.skills.leadership.join(', ')}
`

    const prompt = `
${persona}

I need you to write a highly professional, targeted Cover Letter.

TARGET OPPORTUNITY:
Company: ${targetCompany || '[Target Company]'}
Role: ${targetRole || '[Target Role]'}
Job Description Context (if provided):
"""
${jdContext || 'None provided. Focus purely on aligning my executive background with general requirements for this type of role.'}
"""

CANDIDATE DATA:
"""
${cvContext}
"""

REQUIREMENTS:
1. Write a 3-4 paragraph cover letter.
2. DO NOT include address headers or date blocks (the UI will handle the header). Start directly with the salutation.
3. Keep the tone strictly aligned with your designated persona (${aiConfig?.tone === 'corporate' ? 'standard corporate professional' : 'measured, confident executive'}).
4. Highlight 2-3 specific achievements from the candidate data that best align with the Target Opportunity.
5. End with a strong closing statement.
6. DO NOT use placeholders like [Your Name] at the end, I will inject the signature. Just provide the body of the letter.

Return ONLY the plain text of the cover letter. No markdown formatting, no JSON, just paragraphs separated by double newlines.
`

    try {
        const resultText = await generateAIText(prompt, aiConfig.apiKey, aiConfig.provider)
        return resultText.trim()
    } catch (error) {
        console.error("Cover Letter Generation failed:", error)
        throw new Error("Failed to generate the cover letter. Please try again.")
    }
}
