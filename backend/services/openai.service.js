/**
 * OpenAI service — story enhancement, scene breakdown, character extraction.
 * Uses the Chat Completions API with JSON-mode prompts for the structured
 * outputs (scenes, characters) so the response can be parsed directly.
 */
const env = require("../config/env");

async function callChat(messages, { json = false } = {}) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw Object.assign(
      new Error(`OpenAI request failed (${res.status}): ${errBody.slice(0, 300)}`),
      { status: res.status === 401 ? 401 : 502 }
    );
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function enhanceStory({ text, level, readingAge }) {
  if (!env.isConfigured("openaiApiKey")) {
    throw Object.assign(new Error("OPENAI_API_KEY is not configured on the server."), { status: 501 });
  }
  const content = await callChat([
    {
      role: "system",
      content: `You are a children's story editor. Rewrite the story for a ${readingAge} year-old audience with a ${level} tone. Keep character names and details consistent. Keep content age-appropriate, positive, and free of anything scary or violent. Return only the rewritten story text, no preamble.`,
    },
    { role: "user", content: text },
  ]);
  return { enhanced: content };
}

async function breakIntoScenes({ text, sceneCount }) {
  if (!env.isConfigured("openaiApiKey")) {
    throw Object.assign(new Error("OPENAI_API_KEY is not configured on the server."), { status: 501 });
  }
  const content = await callChat(
    [
      {
        role: "system",
        content: `You split children's stories into ${sceneCount || "an appropriate number of"} scenes for an animated video. Return strict JSON: {"scenes":[{"description":"","background":"","camera":"","animationPrompt":"","imagePrompt":"","sfxPrompt":"","musicPrompt":"","narration":"","dialogue":""}]}. No extra commentary.`,
      },
      { role: "user", content: text },
    ],
    { json: true }
  );
  const parsed = JSON.parse(content);
  const scenes = (parsed.scenes || []).map((s, i) => ({ id: `scene_${Date.now()}_${i}`, index: i + 1, status: "pending", ...s }));
  return { scenes };
}

async function extractCharacters({ text }) {
  if (!env.isConfigured("openaiApiKey")) {
    throw Object.assign(new Error("OPENAI_API_KEY is not configured on the server."), { status: 501 });
  }
  const content = await callChat(
    [
      {
        role: "system",
        content: `Identify the distinct characters in this children's story. Return strict JSON: {"characters":[{"name":"","age":"","gender":"","clothes":"","hair":"","face":"","personality":"","voiceStyle":"","color":"#hex"}]}. No extra commentary.`,
      },
      { role: "user", content: text },
    ],
    { json: true }
  );
  const parsed = JSON.parse(content);
  const characters = (parsed.characters || []).map((c, i) => ({ id: `char_${Date.now()}_${i}`, ...c }));
  return { characters };
}

module.exports = { enhanceStory, breakIntoScenes, extractCharacters };
