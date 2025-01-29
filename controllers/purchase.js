const Order = require("../models/order");
const Razorpay = require("razorpay");

exports.purchasepremium = async (req, res, next) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 250000;

    instance.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(err);
      }
      req.user
        .createOrder({ orderid: order.id, status: "PENDING" })
        .then(() => {
          return res.status(201).json({ order, key_id: instance.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  } catch (err) {
    console.error(err);
    return res
      .status(403)
      .json({ message: "Something went wrong", error: err });
  }
};

exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { paymentid, orderid } = req.body;
    Order.findOne({ where: { orderid: orderid } })
      .then((order) => {
        order
          .update({ paymentid: paymentid, status: "SUCCESSFUL" })
          .then(() => {
            req.user.update({ ispremiumuser: true });
            return res
              .status(202)
              .json({ sucess: true, message: "Transaction Successful" });
          })
          .catch((err) => {
            throw new Error(err);
          });
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    console.error(err);
    return res
      .status(403)
      .json({ success: false, message: "Something went wrong" });
  }
};
