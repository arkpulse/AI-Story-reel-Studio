const openaiService = require("../services/openai.service");

async function generate(req, res, next) {
  try {
    const { text, sceneCount } = req.body;
    const result = await openaiService.breakIntoScenes({ text, sceneCount });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { generate };
