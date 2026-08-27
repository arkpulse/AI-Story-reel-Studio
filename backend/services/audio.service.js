/**
 * Music & sound-effects service (e.g. Stable Audio, ElevenLabs Sound
 * Effects, Suno). Kept separate from voice.service.js since it's a
 * distinct model/product for most providers.
 */
const env = require("../config/env");

async function generateMusic({ moodPrompt, durationSec }) {
  throw Object.assign(new Error("Not implemented — wire up a music generation provider."), { status: 501 });
}

async function generateSfx({ sfxPrompt }) {
  throw Object.assign(new Error("Not implemented — wire up a sound-effects generation provider."), { status: 501 });
}

module.exports = { generateMusic, generateSfx };
