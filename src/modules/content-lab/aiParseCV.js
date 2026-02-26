import { generateAIText, parseAIJsonResponse } from '../../utils/aiService'
import { EXECUTIVE_AI_PERSONA, CORPORATE_AI_PERSONA } from '../../utils/aiConstants'

export async function aiParseCV(rawText, aiConfig) {
  if (!aiConfig?.apiKey) {
    throw new Error("No API key available for AI Content Parsing")
  }

  const persona = aiConfig?.tone === 'corporate' ? CORPORATE_AI_PERSONA : EXECUTIVE_AI_PERSONA

  const prompt = `
${persona}

You are an expert ATS CV parser. Extract structured data from the following raw text. The text might be a full CV, a single section, or conversational output from an AI.
Do your best to extract what exists while applying the persona formatting rules (e.g. capitalize ITIL, strip out fluffy adjectives).

Raw Text:
"""
${rawText}
"""

Return EXACTLY the following JSON format and NOTHING else. Ensure it is valid JSON.
{
  "summary": "<Extract the professional summary or executive bio. Leave empty string if none found.>",
  "experiences": [
    {
      "role": "<Job title>",
      "company": "<Company name>",
      "period": "<Date range>",
      "location": "<Location>",
      "achievements": [
        { "text": "<Bullet point text without leading symbols>", "metrics": "<Any extracted numbers/metrics like '20%', '$5M', etc.>", "tags": [] }
      ]
    }
  ],
  "skills": {
    "technical": ["<tech skill 1>", "<tech skill 2>"],
    "governance": ["<gov skill 1>", "<gov skill 2>"],
    "leadership": ["<lead skill 1>", "<lead skill 2>"]
  },
  "education": [
    { "degree": "<Degree>", "institution": "<School>", "year": "<Year>", "field": "<Field>" }
  ],
  "certifications": [
    { "name": "<Cert Name>", "issuer": "<Issuer>", "year": "<Year>" }
  ]
}
`

  try {
    const resultText = await generateAIText(prompt, aiConfig.apiKey, aiConfig.provider)
    const parsed = parseAIJsonResponse(resultText)

    // Ensure achievements have unique IDs for the store
    if (parsed.experiences) {
      parsed.experiences.forEach(exp => {
        exp.id = crypto.randomUUID()
        if (exp.achievements) {
          exp.achievements.forEach(ach => {
            ach.id = crypto.randomUUID()
          })
        }
      })
    }

    return parsed
  } catch (error) {
    console.error("AI CV Parsing failed:", error)
    throw new Error("AI parsing failed. Falling back to basic regex parsing.")
  }
}
