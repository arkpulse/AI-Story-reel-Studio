const videoService = require("../services/video.service");

async function render(req, res, next) {
  try {
    const { projectId, scenes, videoSettings, audioSettings, captions } = req.body;
    const result = await videoService.renderTimeline({ projectId, scenes, videoSettings, audioSettings, captions });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { render };
