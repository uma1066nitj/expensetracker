const Sequelize = require("sequelize");
const sequilize = require("../util/database");

const ForgetPasswordRequest = sequilize.define("ForgetPasswordRequest", {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true,
  },
  isactive: Sequelize.BOOLEAN,
  expiresby: Sequelize.DATE,
});

module.exports = ForgetPasswordRequest;
