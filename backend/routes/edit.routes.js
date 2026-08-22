const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/edit.controller");
router.post("/render", ctrl.render);
module.exports = router;
