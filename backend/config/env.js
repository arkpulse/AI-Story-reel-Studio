/**
 * Central place that reads provider credentials from process.env.
 * Nothing in here is ever sent to the frontend — only status booleans
 * (see routes/projects.routes.js -> GET /api/providers/status pattern)
 * should ever be exposed to the client.
 */
module.exports = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  stableDiffusionApiKey: process.env.SD_API_KEY || "",
  fluxApiKey: process.env.FLUX_API_KEY || "",
  runwayApiKey: process.env.RUNWAY_API_KEY || "",
  lumaApiKey: process.env.LUMA_API_KEY || "",
  klingApiKey: process.env.KLING_API_KEY || "",
  pikaApiKey: process.env.PIKA_API_KEY || "",
  veoApiKey: process.env.VEO_API_KEY || "",

  isConfigured(key) {
    return Boolean(this[key] && this[key].length > 0);
  },
};
