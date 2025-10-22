
import { GoogleGenAI } from "@google/genai";
import { EnemyType } from "../constants";

let ai: GoogleGenAI | null = null;
const descriptionCache = new Map<EnemyType, string>();

const getAi = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const getEnemyDescription = async (enemyType: EnemyType): Promise<string> => {
  if (descriptionCache.has(enemyType)) {
    return descriptionCache.get(enemyType)!;
  }
  
  try {
    const genAI = getAi();
    const prompt = `Describe a fantasy creature called a '${enemyType}' for a rogue-lite game. The description should be short, quirky, and fit a 'crunchy and sproingly' aesthetic. Maximum 30 words.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const description = response.text.trim();
    if (description) {
      descriptionCache.set(enemyType, description);
    }
    return description;
  } catch (error) {
    console.error("Error fetching enemy description from Gemini:", error);
    return `A menacing ${enemyType.toLowerCase()} appears!`;
  }
};