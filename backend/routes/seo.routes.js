const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/seo.controller");
router.post("/generate", ctrl.generate);
module.exports = router;
