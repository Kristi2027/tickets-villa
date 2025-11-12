import { GoogleGenAI } from '@google/genai';

// Lazily initialize to avoid crashing the app on load if the API key is missing.
let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI | null {
  if (ai) {
    return ai;
  }
  
  // The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
  const apiKey = process.env.API_KEY;

  if (apiKey) {
    // FIX: Initialize GoogleGenAI with a named apiKey parameter.
    ai = new GoogleGenAI({ apiKey });
    return ai;
  }
  
  // Don't throw an error, just log it so the app can continue running.
  console.error("API_KEY is not configured. AI features will be disabled.");
  return null;
}

export const generateEventDescription = async (
  title: string,
  keywords: string
): Promise<string> => {
  const genAI = getAiInstance();

  if (!genAI) {
    return 'AI features are currently unavailable. Please check your API key configuration.';
  }

  const prompt = `Write a compelling and exciting event description for an event titled "${title}". 
  The event is about: ${keywords}. 
  The description should be around 100-150 words. Make it sound engaging and encourage people to attend.`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // FIX: Access the generated text directly from the response object's `text` property.
    const description = response.text;
    if (description) {
      return description;
    } else {
      return 'Could not generate a description. Please write one manually.';
    }
  } catch (error) {
    console.error('Error generating event description:', error);
    return 'An error occurred while generating the description. Please write one manually.';
  }
};
