const audioService = require("../services/audio.service");

async function music(req, res, next) {
  try {
    const { moodPrompt, durationSec } = req.body;
    const result = await audioService.generateMusic({ moodPrompt, durationSec });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

async function sfx(req, res, next) {
  try {
    const { sfxPrompt } = req.body;
    const result = await audioService.generateSfx({ sfxPrompt });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { music, sfx };
