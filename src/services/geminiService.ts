import { GoogleGenAI } from "@google/genai";
import { AgentProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function* generateChatResponseStream(prompt: string, history: any[], agent: AgentProfile) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  // Combine history with new prompt for a complete content list
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] }
  ];

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: {
      systemInstruction: `${agent.prompt}

PERSONALITY: ${agent.personality}
MASTER SKILLS: ${agent.skills.join(', ')}

MEMORY ROM SUMMARY (Learning Context):
${Object.entries(agent.memoryRom).length > 0 
  ? JSON.stringify(Object.entries(agent.memoryRom).slice(-5)) // Pass last 5 interactions for context
  : "No previous decisions logged yet."}

Your tone is technical, futuristic, and industrial, reflecting your specific role and identity.`,
    },
  });
  
  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
