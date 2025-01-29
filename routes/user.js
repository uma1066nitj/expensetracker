const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.post("/signup", userController.registerUser);

router.post("/login", userController.loginUser);

module.exports = router;
