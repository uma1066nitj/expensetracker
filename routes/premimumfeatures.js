const express = require("express");

const premiumFeatureController = require("../controllers/premimumfeatures");

const authenticatemiddleware = require("../middleware/auth");

const router = express.Router();

router.get(
  "/showLeaderBoard",
  authenticatemiddleware.authenticate,
  premiumFeatureController.getUserLeaderBoard
);

module.exports = router;
