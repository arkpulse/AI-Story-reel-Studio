const openaiService = require("../services/openai.service");

async function generate(req, res, next) {
  try {
    // Reuses the story model with an SEO-focused prompt; implement in openai.service.js
    // as e.g. openaiService.generateSEOPackage({ title, summary }).
    res.status(501).json({ ok: false, error: "Not implemented — add generateSEOPackage() to openai.service.js." });
  } catch (err) { next(err); }
}

module.exports = { generate };
