
import { GoogleGenAI, Type } from "@google/genai";

export const fetchJungleLore = async (location: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the Spirit of the Jungle. The player is currently at ${location}. Give a short, immersive, one-sentence observation about the jungle environment. Be poetic but brief (max 15 words).`,
      config: {
        maxOutputTokens: 100,
        temperature: 0.8,
      },
    });

    return response.text || "The leaves whisper secrets in the wind...";
  } catch (error) {
    console.error("Error fetching jungle lore:", error);
    return "The jungle is dense and mysterious today.";
  }
};
