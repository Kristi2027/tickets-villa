import { GoogleGenAI } from '@google/genai';

// When this file is bundled for the browser `process` may be undefined.
// Declare it so TypeScript does not error during client builds. The value
// will only be read when available (server-side or configured build env).
declare const process: any;

// Lazily initialize to avoid crashing the app on load if the API key is missing.
let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI | null {
  if (ai) {
    return ai;
  }

  // The API key MAY be provided in process.env.API_KEY for server-side builds.
  const apiKey = process.env.API_KEY;

  if (apiKey) {
    // Initialize GoogleGenAI with the named apiKey parameter when available.
    try {
      ai = new GoogleGenAI({ apiKey });
      return ai;
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
      ai = null;
      return null;
    }
  }

  // Don't throw an error, just log it so the app can continue running and use server proxy instead.
  console.warn('API_KEY is not configured for client-side GenAI. Falling back to server proxy /api/genai.php');
  return null;
}

/**
 * Robust helper to extract text from a variety of GenAI response shapes.
 */
function extractTextFromResponse(resp: any): string | null {
  if (!resp) return null;
  // Common shapes we'll attempt to read from (tolerant):
  // - { text: '...' }
  if (typeof resp.text === 'string' && resp.text.trim()) return resp.text.trim();

  // - { output: [{ content: [{ type: 'output_text', text: '...' }] }] }
  try {
    const out = resp.output?.[0]?.content;
    if (Array.isArray(out)) {
      for (const c of out) {
        if ((c.type === 'output_text' || c.type === 'text' || !c.type) && c.text) {
          return String(c.text).trim();
        }
        // Some shapes put the text directly on the content object
        if (typeof c === 'string' && c.trim()) return c.trim();
      }
    }
  } catch (e) {
    // ignore
  }

  // - { candidates: [{ content: '...' }] } or { candidates: [{ text: '...' }] }
  if (Array.isArray(resp.candidates) && resp.candidates.length > 0) {
    const cand = resp.candidates[0];
    if (typeof cand.content === 'string' && cand.content.trim()) return cand.content.trim();
    if (typeof cand.text === 'string' && cand.text.trim()) return cand.text.trim();
  }

  // - nested choices (some wrappers)
  if (Array.isArray(resp.choices) && resp.choices.length > 0) {
    if (typeof resp.choices[0].text === 'string') return resp.choices[0].text.trim();
  }

  return null;
}

export const generateEventDescription = async (
  title: string,
  keywords: string
): Promise<string> => {
  const genAI = getAiInstance();

  const prompt = `Write a compelling and exciting event description for an event titled "${title}".\nThe event is about: ${keywords}.\nThe description should be around 100-150 words. Make it sound engaging and encourage people to attend.`;

  // First try direct client if available (server builds with API key)
  if (genAI) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        // some client versions accept `contents` as a string or array — pass a tolerant shape
        contents: prompt as any,
      } as any);

      const description = extractTextFromResponse(response);
      if (description) return description;
      // fallthrough to try server proxy
    } catch (error) {
      console.error('Error generating event description with client GenAI:', error);
      // fallthrough to server proxy
    }
  }

  // Fallback: use server-side PHP proxy (`api/genai.php`) which reads server secrets
  try {
    const resp = await fetch('/api/genai.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!resp.ok) {
      console.error('Server GenAI proxy returned non-OK:', resp.status, await resp.text());
      return 'AI features are currently unavailable. Please check your API key configuration.';
    }

    const json = await resp.json();
    const description = extractTextFromResponse(json);
    if (description) return description;

    return 'Could not generate a description. Please write one manually.';
  } catch (err) {
    console.error('Error calling server GenAI proxy:', err);
    return 'An error occurred while generating the description. Please write one manually.';
  }
};
