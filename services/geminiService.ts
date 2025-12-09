import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const getAiClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateCreativeImage = async (prompt: string): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) {
    console.error("API Key not found");
    await new Promise(r => setTimeout(r, 1500));
    return `https://picsum.photos/1024/768?grayscale&blur=2&random=${Math.random()}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generatePoetry = async (
  heritageName: string, 
  countryPoem: string, 
  language: 'zh' | 'en'
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return language === 'zh' ? '历史的回响在风中低语。' : 'History whispers in the wind.';

  try {
    const prompt = `
      Context: A poetic cultural heritage app.
      Site: ${heritageName}
      Ref: "${countryPoem}"
      Task: Write ONE short, deep, atmospheric line connecting these. 
      Style: Ancient, philosophical.
      Language: ${language === 'zh' ? 'Chinese' : 'English'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || '';
  } catch (error) {
    console.error("Error generating poetry:", error);
    return '';
  }
};
