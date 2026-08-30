const openaiService = require("../services/openai.service");

async function extract(req, res, next) {
  try {
    const { text } = req.body;
    const result = await openaiService.extractCharacters({ text });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { extract };
