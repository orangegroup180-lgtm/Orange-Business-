import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  // The API key is obtained exclusively from the environment variable.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please set the API_KEY environment variable.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getBusinessChatSession = () => {
  const ai = getAiClient();
  if (!ai) return null;
  
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are Orange Business AI, a dedicated intelligent assistant for a solopreneur. Your goal is to help with market research, business strategy, drafting communications, and operational efficiency. You are concise, professional, and actionable. When asked about current events or market data, use your search tool.",
      tools: [{ googleSearch: {} }]
    }
  });
};

export const generateEmail = async (
  recipient: string,
  purpose: string,
  tone: string,
  context: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    if (!ai) return "API Key is missing. Please configure your environment.";

    const prompt = `
      You are an expert executive assistant for a busy solopreneur. 
      Write a concise, effective business email.

      Details:
      - Recipient: ${recipient}
      - Purpose: ${purpose}
      - Tone: ${tone}
      - Context: ${context}
      
      Output Requirements:
      1. Subject Line: clear and engaging.
      2. Body: Professional, direct, and actionable. No fluff. 
      3. Format: Clearly separate "Subject:" and the body.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Failed to generate email.";
  } catch (error: any) {
    console.error("AI Error:", JSON.stringify(error));
    if (error?.status === 403 || error?.code === 403 || JSON.stringify(error).includes("PERMISSION_DENIED")) {
        return "Permission denied. Check API Key configuration.";
    }
    return "An error occurred while communicating with the AI assistant.";
  }
};

export const generateInsights = async (dataContext: string): Promise<string> => {
  try {
    const ai = getAiClient();
    if (!ai) return "Insights unavailable without API Key.";

    const prompt = `
      Act as an elite business coach for a solopreneur. 
      Analyze this business data: ${dataContext}
      
      Provide exactly 3 insights in Markdown bullet points.
      Each insight must be:
      1. Extremely concise (under 15 words).
      2. Action-oriented or celebrating a win.
      3. Specific to the numbers provided.

      Example format:
      * 🚀 **Revenue up** - Good momentum! Consider raising prices slightly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No insights available.";
  } catch (error: any) {
    console.error("AI Error:", JSON.stringify(error));
    if (error?.status === 403 || error?.code === 403) return "AI Access Denied.";
    return "Could not generate insights at this time.";
  }
};

export const suggestClientAction = async (clientInfo: string): Promise<string> => {
  try {
    const ai = getAiClient();
    if (!ai) return "Suggestion unavailable.";

    const prompt = `
      As a specialized CRM Sales Coach, analyze this client profile: ${clientInfo}
      
      Task: Recommend ONE specific, high-value action to take today.
      
      Guidelines:
      - If 'lastContact' > 30 days: Suggest a specific re-engagement email topic (e.g. "Send 'Checking In' email").
      - If 'totalSpent' > $5000: Suggest a VIP loyalty check-in or exclusive offer.
      - If 'totalSpent' < $1000: Suggest a specific upsell or volume discount.
      
      Output: Start with a verb. Max 15 words. Be specific, not generic.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No suggestion available.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error generating suggestion.";
  }
};

export const generateDocumentNotes = async (type: string, clientName: string, itemsDescription: string): Promise<string> => {
  try {
    const ai = getAiClient();
    if (!ai) return "Thank you for your business!";
    
    const prompt = `
      Write a professional, 1-sentence footer note for a ${type}.
      Client: ${clientName}
      Services: ${itemsDescription}
      
      If Invoice: Polite payment reminder.
      If Quote: Excited call to action.
      If Receipt: Warm thank you.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Thank you for your business.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Thank you for your business.";
  }
}