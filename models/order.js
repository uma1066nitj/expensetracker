const Sequelize = require("sequelize");
const sequilize = require("../util/database");

const Order = sequilize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: Sequelize.INTEGER,
  paymentid: Sequelize.STRING,
  orderid: Sequelize.STRING,
  Status: Sequelize.STRING,
});

module.exports = Order;
