import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash";

export class AIService {
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("AI API key not found. Set VITE_AI_API_KEY.");
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateAnswer(
    query: string,
    context: { text: string; docName: string }[],
    chatHistory: any[]
  ) {
    const contextPrompt =
      context.length > 0
        ? `Use ONLY the following context from uploaded documents to answer.
           Cite source as [filename.pdf].
           If not in context, say: "Not found in documents."

           CONTEXT:
           ${context.map((c) => `[${c.docName}]: ${c.text}`).join("\n\n")}`
        : "No documents uploaded yet.";

    const systemInstruction = `You are an expert Document Assistant.
    Answer accurately using only the provided context.
    Be concise and professional.
    ${contextPrompt}`;

    try {
      const model = this.client.getGenerativeModel({ model: MODEL_NAME });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: query }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
        },
        systemInstruction: { parts: [{ text: systemInstruction }] },
      });

      const text = result.response.text();

      return {
        text: text || "No response generated.",
        sources: Array.from(new Set(context.map((c) => c.docName))),
      };
    } catch (error) {
      console.error("AI Error:", error);
      return {
        text: "Sorry, I couldn't process your question right now.",
        sources: [],
      };
    }
  }
}
