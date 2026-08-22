const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/animation.controller");
router.post("/generate", ctrl.submit);
router.get("/status", ctrl.status);
module.exports = router;
