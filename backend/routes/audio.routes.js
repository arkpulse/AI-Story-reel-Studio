const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/audio.controller");
router.post("/music", ctrl.music);
router.post("/sfx", ctrl.sfx);
module.exports = router;
