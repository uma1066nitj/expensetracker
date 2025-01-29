const URLTOBACKEND = "http://localhost:3000/";

document
  .getElementById("forgetForm")
  .addEventListener("submit", forgetPassword);

function forgetPassword(e) {
  e.preventDefault();

  const user = {
    email: document.getElementById("email").value,
  };

  axios
    .post(`${URLTOBACKEND}password/forgetpassword`, user)
    .then((res) => {
      if (res.status == 202) {
        console.log(res);
        alert("Mail Successfully Sent");
      } else {
        console.log("Email Id Not Registered with us");
        throw new Error("Email Id Not Registered with us");
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
