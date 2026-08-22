const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/characters.controller");
router.post("/extract", ctrl.extract);
module.exports = router;
