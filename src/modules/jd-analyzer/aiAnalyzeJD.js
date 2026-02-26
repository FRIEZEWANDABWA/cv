import { generateAIText } from '../../utils/aiService'
import { EXECUTIVE_AI_PERSONA, CORPORATE_AI_PERSONA } from '../../utils/aiConstants'

export async function aiAnalyzeJD(jdText, careerData, aiConfig) {
  if (!aiConfig?.apiKey) {
    throw new Error("No API key available for AI JD Analysis")
  }

  const cvContext = `
Summary: ${careerData.summary}
Experiences:
${careerData.experiences.map(e => `${e.role} at ${e.company}:\n${e.achievements.map(a => `- ${a.text}`).join('\n')}`).join('\n\n')}
Skills:
Technical: ${careerData.skills.technical.join(', ')}
Governance: ${careerData.skills.governance.join(', ')}
Leadership: ${careerData.skills.leadership.join(', ')}
`

  const persona = aiConfig?.tone === 'corporate' ? CORPORATE_AI_PERSONA : EXECUTIVE_AI_PERSONA

  const prompt = `
${persona}

I will provide a Target Job Description and the candidate's existing CV data.

Analyze the gap between the CV and the JD.

Target JD:
"""
${jdText}
"""

Candidate CV:
"""
${cvContext}
"""

Provide your analysis in EXACTLY the following JSON format, and NOTHING else. Ensure the JSON is valid.
{
  "matchScore": <integer 0-100 indicating how well the CV fits the JD>,
  "presentKeywords": [<array of 5-10 key JD terms that the CV ALREADY hits>],
  "missingKeywords": [<array of 3-7 critical JD keywords missing from the CV>],
  "suggestedPositioning": "<one of: cio-cto, head-of-infrastructure, it-governance>",
  "categoryScores": {
    "leadership": <0-10>,
    "technical": <0-10>,
    "governance": <0-10>
  },
  "tagEmphasis": [<array of 2-5 tags from this list to prioritize: "Cloud & Infra", "Cybersecurity", "ITIL / ITSM", "Digital Transformation", "ERP / Systems", "Vendor Mgt", "Budget & P&L", "Board Reporting">],
  "gapFillSuggestions": [
    {
      "keyword": "<the missing keyword>",
      "suggestedBullet": "<Draft a strong bullet point using the [Action] + [Scope] + [Result] formula. Naturally incorporate the keyword. Do NOT use markdown bolding.>"
    }
  ]
}
`

  try {
    const resultText = await generateAIText(prompt, aiConfig.apiKey, aiConfig.provider)
    // Clean up markdown block if the LLM wraps it
    const cleanedText = resultText.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("AI JD Analysis failed:", error)
    throw new Error("AI analysis failed. Falling back to basic analysis.")
  }
}
