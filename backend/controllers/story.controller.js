const openaiService = require("../services/openai.service");
const geminiService = require("../services/gemini.service");

async function enhance(req, res, next) {
  try {
    const { text, level, readingAge, provider } = req.body;
    const svc = provider === "gemini" ? geminiService : openaiService;
    const result = await svc.enhanceStory({ text, level, readingAge });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { enhance };
