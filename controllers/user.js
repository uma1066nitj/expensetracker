const sequelize = require("../util/database");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  const saltrounds = 10;

  const t = await sequelize.transaction(); // Start a transaction

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(saltrounds);
    const hash = await bcrypt.hash(password, salt);

    // Create the user with the transaction
    await User.create(
      { name, email, phone, password: hash },
      { transaction: t }
    );

    await t.commit(); // Commit the transaction
    res.status(201).json({ message: "Successfully created new user" });
  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of an error
    console.error("Unable to create new user:", err.message);
    res.status(500).json({
      success: false,
      message: "Unable to create new user",
      error: err,
    });
  }
};

function generateAccessToken(id) {
  return jwt.sign({ id }, process.env.TOCKEN_SECRET);
}

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Passwords do not match" });
    }

    // Generate JWT token
    const token = generateAccessToken(user.id);
    // const username = use
    res.status(200).json({
      token,
      username: user.name,
      ispremiumuser: user.ispremiumuser,
      success: true,
      message: "Successfully Logged In",
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error: err });
  }
};
