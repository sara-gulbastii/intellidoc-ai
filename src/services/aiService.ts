import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash";

export class AIService {
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("AI API key not found. Set VITE_AI_API_KEY in environment.");
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
        ? `Use ONLY the following context from uploaded documents to answer the question.
           Always cite the document name in brackets, e.g., [Document.pdf].
           If the answer is not in the context, say "I don't know based on the provided documents."
           
           CONTEXT:
           ${context.map(c => `[From ${c.docName}]: ${c.text}`).join('\n\n')}
           `
        : "No document context is available. Please inform the user that they should upload PDFs first if they want context-aware answers.";

    const systemInstruction = `You are a professional Document Assistant. 
    Your goal is to provide accurate, grounded answers based solely on the provided PDF context. 
    Maintain a helpful, clear, and objective tone.
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
        text: text || "I'm sorry, I couldn't generate a response.",
        sources: Array.from(new Set(context.map(c => c.docName))),
      };
    } catch (error) {
      console.error("AI Service Error:", error);
      return {
        text: "I encountered an issue while processing your request. Please try again.",
        sources: [],
      };
    }
  }
}
