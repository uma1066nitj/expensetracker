const express = require("express");
const body_parser = require("body-parser");
var cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const sequelize = require("./util/database");

const User = require("./models/user");
const Expense = require("./models/expenses");
const Order = require("./models/order");
const ForgetPassword = require("./models/forgetPasswordRequest");

const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expense");
const purchaseRoutes = require("./routes/purchase");
const premiumfeaturesRoutes = require("./routes/premimumfeatures");
const forgetpasswordRoutes = require("./routes/forgetpassword");

const app = express();
const dotenv = require("dotenv");

//get config vars
dotenv.config();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(cors());

// Middleware
app.use(body_parser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/user", userRoutes);
app.use("/expense", expenseRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/premium", premiumfeaturesRoutes);
app.use("/password", forgetpasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

ForgetPassword.belongsTo(User);
User.hasMany(ForgetPassword);

sequelize
  .sync()
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
