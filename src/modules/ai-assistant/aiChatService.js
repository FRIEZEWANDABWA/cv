import { generateAIText } from '../../utils/aiService'
import { EXECUTIVE_AI_PERSONA, CORPORATE_AI_PERSONA } from '../../utils/aiConstants'

export async function processCvChat(chatHistory, careerData, aiConfig) {
    if (!aiConfig?.apiKey) {
        throw new Error("No API key available for AI Chat")
    }

    const historyText = chatHistory.map(m => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.text}`).join('\n')
    const persona = aiConfig?.tone === 'corporate' ? CORPORATE_AI_PERSONA : EXECUTIVE_AI_PERSONA

    const prompt = `
${persona}

You have direct database control over the user's CV data.

CURRENT CV DATA:
"""
${JSON.stringify(careerData, null, 2)}
"""

CHAT LOG:
${historyText}

INSTRUCTIONS:
1. Look at the latest USER message in the chat log. Apply their request to the CURRENT CV DATA. Make intelligent, aggressive improvements if asked.
2. DO NOT modify any \`id\` fields of existing items. Do not delete data unless specifically asked.
3. If you add new items (experiences, achievements, skills), generate a unique string for the \`id\`.
4. Return EXACTLY the following JSON format and nothing else.
{
  "assistantReply": "<A short, friendly, concise message explaining what you modified in the CV data>",
  "updatedCareerData": <THE ENTIRE UPDATED CV JSON OBJECT>
}
5. Return ONLY valid JSON data. Do not wrap in markdown \`\`\`json blocks.
`

    try {
        // We use the underlying generateAIText directly with the system instructions
        const resultText = await generateAIText(prompt, aiConfig.apiKey, aiConfig.provider)
        const cleanedText = resultText.replace(/```json\n?|\n?```/g, '').trim()

        return JSON.parse(cleanedText)
    } catch (error) {
        console.error("AI Chat Error:", error)
        throw new Error("I had trouble applying those changes. My generated data might have been malformed. Please try asking again.")
    }
}

export async function processCoverLetterChat(chatHistory, coverLetterText, aiConfig) {
    if (!aiConfig?.apiKey) {
        throw new Error("No API key available for AI Chat")
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

INSTRUCTIONS:
1. Look at the latest USER message. Apply their request to the CURRENT COVER LETTER TEXT. Make intelligent, aggressive improvements if asked.
2. Ensure you follow the strict persona tone rules.
3. Return EXACTLY the following JSON format and nothing else.
{
  "assistantReply": "<A short, friendly, concise message explaining what you modified in the Cover Letter>",
  "updatedCoverLetterText": "<THE ENTIRE UPDATED COVER LETTER TEXT>"
}
4. Return ONLY valid JSON data. Do not wrap in markdown \`\`\`json blocks.
`

    try {
        const resultText = await generateAIText(prompt, aiConfig.apiKey, aiConfig.provider)
        const cleanedText = resultText.replace(/```json\n?|\n?```/g, '').trim()
        return JSON.parse(cleanedText)
    } catch (error) {
        console.error("AI Cover Letter Chat Error:", error)
        throw new Error("I had trouble applying those changes. My generated data might have been malformed. Please try asking again.")
    }
}
