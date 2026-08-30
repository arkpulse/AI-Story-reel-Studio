const imageService = require("../services/image.service");

async function generate(req, res, next) {
  try {
    const { title, style } = req.body;
    // Thumbnails typically reuse the image service with a title-card-oriented prompt.
    const result = await imageService.generateImage({ prompt: `YouTube thumbnail, bold text "${title}", kid-friendly, colorful`, style });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { generate };
