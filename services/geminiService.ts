import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { OpsRequest } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function* streamOpsResponse(request: OpsRequest) {
  const model = "gemini-2.5-flash";
  
  // Construct the user prompt based on the structured input
  const userPrompt = `
STARTUP PROFILE:
Name: ${request.profile.name}
Description: ${request.profile.description}
Industry: ${request.profile.industry}
Team Size: ${request.profile.teamSize}
Preferred Tone: ${request.profile.tone}

MODE:
${request.mode}

RAW INPUT:
${request.rawInput}

EXTRA INSTRUCTIONS:
${request.extraInstructions || "None"}
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balance between creativity and strict adherence to format
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}
