import { GoogleGenAI } from "@google/genai";
import { DebugResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const SYSTEM_INSTRUCTION = `You are DebugMate AI, a world-class programming tutor and debugging expert.
Analyze the user's code, error message, or terminal output and provide a high-quality, structured response.

CONSTRAINTS:
- BE CONCISE: Use clear, jargon-free language.
- BE BEGINNER-FRIENDLY: Use helpful metaphors when appropriate.
- BE TECHNICAL: Provide the exact root cause.
- BE PRACTICAL: Offer clear, step-by-step instructions for the fix.
- CODE QUALITY: Corrected code must be production-ready and follow best practices.
- FORMATTING: Ensure the response is easy to scan visually.

The JSON schema MUST follow this exact structure:
{
  "summary": "One punchy sentence naming the error.",
  "beginnerExplanation": "A 1-2 sentence metaphor or simple explanation explaining what theoretically went wrong.",
  "rootCause": "A concise technical explanation of the specific language/runtime failure.",
  "suggestedFix": "A numbered, step-by-step list of actions to resolve this.",
  "correctedCode": "The complete, optimized, and fixed code block.",
  "preventionTips": "Short bullet points on how to never see this error again."
}

If the input is not related to programming, gently redirect the user to provide a code-related error or snippet.`;

/**
 * Explains a programming error using Gemini.
 */
export async function explainError(
  input: string,
  language: string,
  imageData?: string // Base64
): Promise<DebugResult> {
  try {
    const parts: any[] = [];
    
    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageData.split(',')[1] || imageData,
        },
      });
    }

    parts.push({
      text: `Language/Environment: ${language}\n\nInput Content:\n${input}`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    // Validate required fields
    const requiredFields: (keyof DebugResult)[] = ['summary', 'beginnerExplanation', 'rootCause', 'suggestedFix', 'correctedCode', 'preventionTips'];
    for (const field of requiredFields) {
      if (!result[field]) {
        throw new Error(`Invalid AI response: Missing ${field}`);
      }
    }

    return result as DebugResult;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Invalid API key. Please check your GEMINI_API_KEY.");
    }
    if (error.message?.includes("Safety")) {
      throw new Error("Content was flagged by safety filters. Please try a different error.");
    }
    throw new Error(error.message || "Failed to analyze error. Please check your connectivity.");
  }
}
