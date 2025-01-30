const express = require("express");

const expenseControlller = require("../controllers/expense");
const userauthentication = require("../middleware/auth");

const router = express.Router();

router.post(
  "/addexpense",
  userauthentication.authenticate,
  expenseControlller.addexpense
);

router.get(
  "/getexpense",
  userauthentication.authenticate,
  expenseControlller.getexpense
);

router.delete(
  "/deleteexpense",
  userauthentication.authenticate,
  expenseControlller.deleteexpense
);
router.get(
  "/download",
  userauthentication.authenticate,
  expenseControlller.downloadExpense
);
router.get(
  "/report",
  userauthentication.authenticate,
  expenseControlller.ExpenseReport
);
module.exports = router;
