export async function generateAIText(prompt, apiKey, provider = 'openai') {
    if (!apiKey) {
        throw new Error("No API key provided. Please configure it in settings.")
    }

    try {
        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                    }
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || "Failed to generate content from Gemini")
            }

            const data = await response.json()
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated."

        } else {
            // Default to OpenAI
            const url = 'https://api.openai.com/v1/chat/completions'
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || "Failed to generate content from OpenAI")
            }

            const data = await response.json()
            return data.choices?.[0]?.message?.content || "No response generated."
        }
    } catch (error) {
        console.error("AI Generation Error:", error)
        throw error
    }
}
