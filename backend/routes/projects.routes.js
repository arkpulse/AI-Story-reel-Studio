const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/projects.controller");
router.get("/", ctrl.list);
router.post("/", ctrl.save);
router.get("/providers/status", ctrl.providerStatus);
module.exports = router;
