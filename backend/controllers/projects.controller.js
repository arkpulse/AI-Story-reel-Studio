const env = require("../config/env");

// In-memory placeholder. Swap for a real database (Postgres/Mongo) in production.
const projects = new Map();

function list(req, res) {
  res.json({ ok: true, projects: Array.from(projects.values()) });
}

function save(req, res) {
  const project = req.body;
  if (!project || !project.id) return res.status(400).json({ ok: false, error: "Missing project.id" });
  projects.set(project.id, project);
  res.json({ ok: true, project });
}

function providerStatus(req, res) {
  res.json({
    ok: true,
    providers: {
      openai: env.isConfigured("openaiApiKey"),
      gemini: env.isConfigured("geminiApiKey"),
      elevenlabs: env.isConfigured("elevenLabsApiKey"),
      stableDiffusion: env.isConfigured("stableDiffusionApiKey"),
      flux: env.isConfigured("fluxApiKey"),
      runway: env.isConfigured("runwayApiKey"),
      luma: env.isConfigured("lumaApiKey"),
      kling: env.isConfigured("klingApiKey"),
      pika: env.isConfigured("pikaApiKey"),
      veo: env.isConfigured("veoApiKey"),
    },
  });
}

module.exports = { list, save, providerStatus };
