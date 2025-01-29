const uuid = require("uuid");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const ForgetPasswordRequest = require("../models/forgetPasswordRequest");

// umashankarofficial19@gmail.com
exports.forgetPassword = (req, res, next) => {
  try {
    console.log("forget Password" + req.body);
    const { email } = req.body;
    User.findOne({ where: { email } }).then((user) => {
      if (user) {
        const id = uuid.v4();
        console.log(user + " " + id);
        user
          .createForgetPasswordRequest({ id, isactive: true })
          .catch((err) => {
            throw new Error(err);
          });
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: email, // Change to your recipient
          from: "umashankarofficial19@gmail.com", // Change to your verified sender
          subject: "Reset Password Link",
          text: "Reset Password Link From Expense Tracker",
          html: `<strong>To Reset the Password <a href="http://localhost:3000/password/resetpassword/${id}"> click here </a></strong>`,
        };

        sgMail
          .send(msg)
          .then((response) => {
            console.log("Email Sent");
            return res.status(response[0].statusCode).json({
              message: "Link to reset password send to resgistred mail id",
              success: true,
            });
          })
          .catch((error) => {
            throw new Error(error);
          });
      } else {
        throw new Error("User dosent exist");
      }
    });
  } catch (err) {
    console.log(err);
    return res.json({ message: err, success: false });
  }
};

exports.resetPassword = (req, res, next) => {
  const id = req.params.id;
  ForgetPasswordRequest.findOne({ where: { id, isactive: true } }).then(
    (ForgetPasswordRequest) => {
      if (ForgetPasswordRequest) {
        ForgetPasswordRequest.update({ isactive: false });
        res.status(200).send(`<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 400px;
      padding: 20px;
      text-align: center;
    }
    h2 {
      margin-bottom: 20px;
      color: #333;
    }
    label {
      display: block;
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
      text-align: left;
    }
    input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    input[type="password"] {
      padding-left: 10px;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      width: 100%;
      margin-top: 10px;
    }
    button:hover {
      background-color: #45a049;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Reset Your Password</h2>
    <form action="/password/updatepassword/${id}" method="POST" onsubmit="formsubmitted(event)">
      <label for="newpassword">Enter New Password</label>
      <input name="newpassword" type="password" id="newpassword" required placeholder="Enter your new password">
      <button type="submit">Reset Password</button>
    </form>

  <script>
    function formsubmitted(e){
        e.preventDefault();
        console.log('Reset password form submitted');
        // You can add form validation or custom actions here if needed
    }
  </script>
</body>
</html>
`);
        res.end();
      }
    }
  );
};

exports.updatePassword = (req, res, next) => {
  try {
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;
    ForgetPasswordRequest.findOne({ where: { id: resetpasswordid } }).then(
      (resetpasswordrequest) => {
        User.findOne({ where: { id: resetpasswordrequest.userId } }).then(
          (user) => {
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, function (err, salt) {
              if (err) {
                console.log(err);
                throw new Error(err);
              }
              bcrypt.hash(newpassword, salt, function (err, hash) {
                if (err) {
                  console.log(err);
                  throw new Error(err);
                }
                user.update({ password: hash }).then(() => {
                  return res
                    .status(201)
                    .json({ message: "Successfully updated the new password" });
                });
              });
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(403).json({ error, success: false });
  }
};
