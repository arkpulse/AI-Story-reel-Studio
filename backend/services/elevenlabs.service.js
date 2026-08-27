/**
 * ElevenLabs service — narration & dialogue voice generation.
 * Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
 *
 * Note: this returns raw audio bytes as base64 for simplicity. In a real
 * deployment you'd upload the buffer to S3/GCS/etc. and return a URL
 * instead of inlining base64 audio in the JSON response.
 */
const env = require("../config/env");
const fs = require("fs");
const path = require("path");

// A few of ElevenLabs' stock premade voice IDs, mapped to the frontend's
// voice picker options. Swap for your own cloned/custom voice IDs as needed.
const VOICE_MAP = {
  "female-warm": "21m00Tcm4TlvDq8ikWAM",   // Rachel
  "female-bright": "EXAVITQu4vr4xnSDxMaL", // Bella
  "male-friendly": "TxGEqnHWrfWFTfGW9XjX", // Josh
  "male-deep": "VR6AewLTigWG4xSOukaG",     // Arnold
  "child-playful": "jsCqWAovK2LkecY7zXl4", // Freya (closest stock option)
  "child-curious": "jsCqWAovK2LkecY7zXl4",
};

async function generateVoice({ text, voice, speed = 1.0, pitch = 1.0 }) {
  if (!env.isConfigured("elevenLabsApiKey")) {
    throw Object.assign(new Error("ELEVENLABS_API_KEY is not configured on the server."), { status: 501 });
  }
  const voiceId = VOICE_MAP[voice] || VOICE_MAP["female-warm"];

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": env.elevenLabsApiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, speed },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw Object.assign(
      new Error(`ElevenLabs request failed (${res.status}): ${errBody.slice(0, 300)}`),
      { status: res.status === 401 ? 401 : 502 }
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  const outDir = path.join(__dirname, "..", "generated", "audio");
  fs.mkdirSync(outDir, { recursive: true });
  const filename = `clip_${Date.now()}.mp3`;
  fs.writeFileSync(path.join(outDir, filename), Buffer.from(arrayBuffer));

  return {
    clip: {
      voice,
      voiceId,
      // In production this should be a public URL (from your file host/CDN),
      // not a local server path.
      localPath: `/generated/audio/${filename}`,
    },
  };
}

module.exports = { generateVoice };
