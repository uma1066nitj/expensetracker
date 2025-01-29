const BASEURL = "http://localhost:3000/";

document.getElementById("signupform").addEventListener("submit", registerUser);

function registerUser(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  const User = { name, email, phone, password };
  console.log(User);

  axios
    .post(`${BASEURL}user/signup`, User)
    .then((res) => {
      if (res.status === 201) {
        alert("Successfuly signed up");
        // window.location.href = `${BASEURL}login`;
      } else {
        console.log("User Registration failed");
        throw new Error(res.data.messsage);
      }
    })
    .catch((err) => {
      alert("Your Email Id is already registerd.");
      console.log("error " + err);
    });

  document.getElementById("signupform").reset();
}
