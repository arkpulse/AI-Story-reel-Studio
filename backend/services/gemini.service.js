/**
 * Google Gemini service — alternative story enhancement model.
 * Docs: https://ai.google.dev/api/generate-content
 */
const env = require("../config/env");

async function enhanceStory({ text, level, readingAge }) {
  if (!env.isConfigured("geminiApiKey")) {
    throw Object.assign(new Error("GEMINI_API_KEY is not configured on the server."), { status: 501 });
  }

  const prompt = `You are a children's story editor. Rewrite the following story for a ${readingAge} year-old audience with a ${level} tone. Keep character names and details consistent. Keep content age-appropriate, positive, and free of anything scary or violent. Return only the rewritten story text, no preamble.\n\nSTORY:\n${text}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw Object.assign(
      new Error(`Gemini request failed (${res.status}): ${errBody.slice(0, 300)}`),
      { status: res.status === 401 || res.status === 403 ? 401 : 502 }
    );
  }
  const data = await res.json();
  const enhanced = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
  return { enhanced };
}

module.exports = { enhanceStory };
