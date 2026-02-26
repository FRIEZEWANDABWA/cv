import { generateAIText, parseAIJsonResponse } from '../../utils/aiService'
import { EXECUTIVE_AI_PERSONA, CORPORATE_AI_PERSONA } from '../../utils/aiConstants'

export async function aiAutoTailorCV(careerData, jdText, aiConfig) {
    if (!aiConfig?.apiKey) {
        throw new Error("No API key available for AI Tailoring")
    }

    if (!jdText || jdText.length < 50) {
        throw new Error("Job description is too short to analyze accurately")
    }

    const cvContext = `
Summary: ${careerData.summary}

Experiences:
${careerData.experiences.map(e => `
ID: ${e.id}
Role: ${e.role} at ${e.company}
Achievements:
${e.achievements.map(a => `[${a.id}] ${a.text}`).join('\n')}
`).join('\n')}
`

    const persona = aiConfig?.tone === 'corporate' ? CORPORATE_AI_PERSONA : EXECUTIVE_AI_PERSONA

    const prompt = `
${persona}

You are an expert ATS (Applicant Tracking System) optimizer and Executive Resume Writer.
I will provide you with a Target Job Description and the candidate's existing Resume/CV Data.

Your task:
Rewrite the candidate's "Summary" and their specific "Achievements" so that they perfectly align with the Target Job Description. 

CRITICAL RULES:
1. ONLY re-write the text to naturally inject keywords from the Job Description. 
2. DO NOT hallucinate, invent, or fabricate new roles, companies, degrees, or fake metrics (like "$100M revenue" if they didn't have it). 
3. If the candidate doesn't have the experience required by the JD, do not fake it. Focus on what they DO have that overlaps with the JD.
4. Keep the exact same ID strings for the achievements. We rely on those to map the data back to our database.
5. Use the Action + Scope + Result formula for bullets.

Target JD:
"""
${jdText}
"""

Candidate CV:
"""
${cvContext}
"""

Provide your rewritten updates in EXACTLY the following JSON format, and NOTHING else. Ensure the JSON is completely valid.
{
  "summary": "<The rewritten executive summary spanning 2-4 sentences, highlighting keywords from the JD.>",
  "achievements": [
    {
       "id": "<The exact same achievement ID as provided in the candidate CV>",
       "text": "<The rewritten achievement bullet, naturally weaving in JD keywords without lying.>"
    }
  ]
}
`

    try {
        const resultText = await generateAIText(prompt, aiConfig.apiKey, aiConfig.provider)
        return parseAIJsonResponse(resultText)
    } catch (error) {
        console.error("AI Auto-Tailor failed:", error)
        throw new Error("AI Auto-Tailor failed to rewrite the CV.")
    }
}
