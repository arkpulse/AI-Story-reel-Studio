const animationService = require("../services/animation.service");

async function submit(req, res, next) {
  try {
    const { imagePath, prompt, cameraMovement } = req.body;
    const result = await animationService.submitAnimationJob({ imagePath, prompt, cameraMovement });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

async function status(req, res, next) {
  try {
    const { jobId } = req.query;
    const result = await animationService.pollAnimationJob({ jobId });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { submit, status };
