import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

export async function initializeGeminiAI() {
  const { llmKey } = await chrome.storage.sync.get(['llmKey']);
  if (!llmKey) {
    throw new Error('Gemini API key not found. Please set it in the extension settings.');
  }
  genAI = new GoogleGenerativeAI(llmKey);
}

export async function getGeminiResponse(prompt) {
  if (!genAI) {
    await initializeGeminiAI();
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
}
