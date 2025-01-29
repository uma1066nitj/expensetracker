const path = require("path");

const express = require("express");

const resetpasswordController = require("../controllers/forgetPassword");

const router = express.Router();

router.post("/forgetpassword", resetpasswordController.forgetPassword);

router.get("/resetpassword/:id", resetpasswordController.resetPassword);

router.get(
  "/updatepassword/:resetpasswordid",
  resetpasswordController.updatePassword
);

module.exports = router;
