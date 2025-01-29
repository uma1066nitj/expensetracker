const User = require("../models/user");
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.header("authorization");
    console.log("token : " + token);

    // Verify token and extract userId
    const decoded = jwt.verify(token, process.env.TOCKEN_SECRET);
    const userId = decoded.id; // Assuming the token contains id

    if (!userId) {
      throw new Error("Invalid token payload");
    }
    User.findByPk(userId)
      .then((user) => {
        console.log(JSON.stringify(user));
        req.user = user;
        next();
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false });
  }
};

module.exports = {
  authenticate,
};
