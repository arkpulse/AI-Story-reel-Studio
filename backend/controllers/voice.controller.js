const elevenLabsService = require("../services/elevenlabs.service");

async function generate(req, res, next) {
  try {
    const { text, voice, speed, pitch } = req.body;
    const result = await elevenLabsService.generateVoice({ text, voice, speed, pitch });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { generate };
