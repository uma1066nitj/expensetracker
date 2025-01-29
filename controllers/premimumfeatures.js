const User = require("../models/user");
const Expense = require("../models/expenses");
const sequelize = require("../util/database");

const getUserLeaderBoard = async (req, res) => {
  try {
    const leaderboardofusers = await User.findAll({
      attributes: ["id", "name", "totalExpenses"],
      include: [
        {
          model: Expense,
          attributes: [],
        },
      ],
      group: ["user.id"],
      order: [["totalExpenses", "DESC"]],
    });

    res.status(200).json(leaderboardofusers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

module.exports = {
  getUserLeaderBoard,
};
