const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/story.controller");
router.post("/enhance", ctrl.enhance);
module.exports = router;
