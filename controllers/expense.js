const Expense = require("../models/expenses");
const AWS = require("aws-sdk");
const User = require("../models/user");
const ExpenseReport = require("../models/expenseReport");

exports.addexpense = (req, res, next) => {
  const { expenseamount, description, category } = req.body;

  // Add the expense and update totalExpenses for the user
  req.user
    .createExpense({ expenseamount, description, category })
    .then((expense) => {
      // Update totalExpenses in the user table
      const totalExpense =
        Number(req.user.totalExpenses) + Number(expenseamount);
      return User.update(
        { totalExpenses: totalExpense },
        { where: { id: req.user.id } }
      )
        .then(() => {
          return res.status(201).json({ expense, success: true });
        })
        .catch((err) => {
          console.error("Error updating totalExpenses:", err);
          return res.status(500).json({ success: false, error: err });
        });
    })
    .catch((err) => {
      console.error("Error adding expense:", err);
      return res.status(403).json({ success: false, error: err });
    });
};

exports.getexpense = (req, res, next) => {
  req.user
    .getExpenses()
    .then((expenses) => {
      const total = expenses.length; // Get the total number of expenses
      const paginatedData = paginationResult(req, expenses);
      return res.status(200).json({
        expense: paginatedData,
        total, // Include total count in the response
        success: true,
      });
    })
    .catch((err) => {
      console.error("Error fetching expenses:", err);
      return res.status(402).json({ error: err, success: false });
    });
};

const paginationResult = function pagination(req, model) {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = {};
    const totalCount = model.length;

    if (endIndex < totalCount) {
      result.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      result.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    result.lastPage = Math.floor(totalCount / limit);

    result.results = model.slice(startIndex, endIndex);

    return result;
  } catch (err) {
    console.log("err :" + err);
  }
};

exports.deleteexpense = (req, res, next) => {
  const expenseid = parseInt(req.query.id);

  Expense.findOne({ where: { id: expenseid } })
    .then((expense) => {
      if (!expense) {
        return res
          .status(404)
          .json({ success: false, message: "Expense not found" });
      }

      // Subtract the expense amount from totalExpenses
      const updatedTotalExpense =
        Number(req.user.totalExpenses) - Number(expense.expenseamount);

      // Delete the expense
      return Expense.destroy({ where: { id: expenseid } })
        .then(() => {
          // Update totalExpenses in the user table
          return User.update(
            { totalExpenses: updatedTotalExpense },
            { where: { id: req.user.id } }
          )
            .then(() => {
              return res
                .status(204)
                .json({ success: true, message: "Deleted Successfully" });
            })
            .catch((err) => {
              console.error(
                "Error updating totalExpenses after deletion:",
                err
              );
              return res.status(500).json({ success: false, error: err });
            });
        })
        .catch((err) => {
          console.error("Error deleting expense:", err);
          return res
            .status(403)
            .json({ success: false, message: "Failed to delete" });
        });
    })
    .catch((err) => {
      console.error("Error finding expense:", err);
      return res.status(500).json({ success: false, error: err });
    });
};

async function uploadTOS3(data, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
    ContentType: "text/html",
  };

  const s3response = await s3bucket.upload(params).promise();
  if (s3response) {
    return s3response.Location;
  }
}
exports.ExpenseReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await ExpenseReport.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.downloadExpense = async (req, res, next) => {
  try {
    const expenses = await req.user.getExpenses();
    console.log(expenses);
    let totalAmount = 0;
    const tableRows = expenses
      .map((expense) => {
        totalAmount += expense.expenseamount;
        return `<tr>
          <td>${expense.description}</td>
          <td>${expense.category}</td>
          <td>${expense.expenseamount}</td>
          <td>${new Date(expense.createdAt).toLocaleDateString()}</td>
        </tr>`;
      })
      .join("");
    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const expenseDate = new Date(expense.createdAt);
      const monthYear = `${expenseDate.toLocaleString("default", {
        month: "long",
      })} ${expenseDate.getFullYear()}`;
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += expense.expenseamount;

      return acc;
    }, {});
    const yearlyRows = Object.entries(monthlyExpenses).map(
      ([month, totalExpense]) => `
        <tr>
          <td>${month}</td>
          <td>${totalExpense}</td>
        </tr>`
    );
    const grandTotal = Object.values(monthlyExpenses).reduce(
      (sum, expense) => sum + expense,
      0
    );
    const username = req.user.name;
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>My Expenses</title>
          <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                margin: 0;
                padding: 0;
                color: #333;
            }

            .container {
                max-width: 800px;
                margin: 30px auto;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                position: relative;
            }
            h1 {
                font-size: 28px;
                color: #2d8461;
                font-weight: bold;
                text-align: center;
                margin-bottom: 20px;
            }
            header p {
                font-size: 14px;
                color: #666;
                 text-align: center;
                margin-bottom: 20px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }

            table thead {
                background-color: #4d4885;
                color: white;
            }

            table th, table td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: center;
            }

            table tr:nth-child(even) {
                background-color: #f9f9f9;
            }

            table tfoot td {
                font-weight: bold;
            }

            .report-section h2 {
                font-size: 24px;
                margin-top: 30px;
                color: #444;
            }

            footer {
                display: flex;
                justify-content: center;
                margin-top: 20px;
            }

            .print-btn {
                display: inline-block;
                background-color: #007bff;
                color: white;
                font-size: 18px;
                padding: 12px 30px;
                border-radius: 5px;
                border: none;
                cursor: pointer;
                transition: background-color 0.3s, transform 0.2s;
                text-align: center;
            }

            .print-btn:hover {
                background-color: #0056b3;
                transform: scale(1.05);
            }

            .print-btn i {
                margin-right: 10px;
            }
            @media print {
            .print-btn {
                display: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h1>Expense Report of ${username}</h1>
              <p>Detailed view of your expenses</p>
            </header>

            <table>
              <thead>
                <tr>
                  <th>Expense Name</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">Total Amount</td>
                  <td>${totalAmount}</td>
                </tr>
              </tfoot>
            </table>

            <h1>Yearly Report</h1>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Expense</th>
                </tr>
              </thead>
              <tbody>
                ${yearlyRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="1">Total Amount</td>
                  <td>${grandTotal}</td>
                </tr>
              </tfoot>
            </table>
            <footer>
              <button id="printReport" class="print-btn">
              Print Report
              </button>
            </footer>
          </div>
          <script>
            document.getElementById('printReport').addEventListener('click', function() {
                window.print();
            });
          </script>
        </body>
        </html>`;
    const id = req.user.id;
    const filename = `MyExpense${id}/${new Date()}.html`;
    const fileURL = await uploadTOS3(Buffer.from(htmlContent), filename);
    // console.log("fileURL: " + fileURL);
    await ExpenseReport.create({ userId: id, fileURL });
    return res.status(201).json({ success: true, fileURL });
  } catch (err) {
    console.log("Exception", err);
    return res.status(500).json({ success: false, fileURL: "", err: err });
  }
};
