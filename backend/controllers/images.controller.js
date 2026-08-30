const imageService = require("../services/image.service");

async function generate(req, res, next) {
  try {
    const { prompt, style, seed } = req.body;
    const result = await imageService.generateImage({ prompt, style, seed });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { generate };
