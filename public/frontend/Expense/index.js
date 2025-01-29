const URLTOBACKEND = "http://localhost:3000/";
const tableBody = document.querySelector(".table tbody");
const EMAILID = "ceoumashankar@gmail.com";
const PHONENO = "7257868848";
const prev = document.getElementById("prevPage");
const curr = document.getElementById("currPage");
const next = document.getElementById("nextPage");
const token = localStorage.getItem("token");
const setLimitDropdown = document.getElementById("setlimit");
const paginationInfo = document.getElementById("pagination-info");
const username = document.getElementById("username");
let currentPage = 1;
let totalCount = 0;
// Add new expense
function addNewExpense(e) {
  e.preventDefault();
  const form = e.target;

  const expenseDetails = {
    expenseamount: form.expenseamount.value,
    description: form.description.value,
    category: form.category.value,
  };

  axios
    .post(`${URLTOBACKEND}expense/addexpense`, expenseDetails, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 201) {
        addNewExpensetoUI(response.data.expense);
        updatedPagination(currentPage, limit);
        updateButtonsState(currentPage, limit);
        form.reset();
      } else {
        throw new Error("Failed to create new expense");
      }
    })
    .catch((err) => showError(err));
}

// Add expense to UI
function addNewExpensetoUI(element) {
  tableBody.innerHTML += `
    <tr id="expense-${element.id}">
      <td class="amount">${element.expenseamount}</td>
      <td class="description">${element.description}</td>
      <td class="category">${element.category}</td>
      <td>
        <button style="cursor: pointer; background-color: red; border: none;" onclick="deleteExpense(event, ${element.id})">
          Delete
        </button>
      </td>
    </tr>`;
}

// Delete expense
function deleteExpense(e, expenseid) {
  e.preventDefault();

  axios
    .delete(`${URLTOBACKEND}expense/deleteexpense?id=${expenseid}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 204) {
        const limit = parseInt(setLimitDropdown.value);
        removeExpensefromUI(expenseid);
        updatedPagination(currentPage, limit);
        updateButtonsState(currentPage, limit);
      } else {
        throw new Error("Failed to delete expense");
      }
    })
    .catch((err) => showError(err));
}

// Remove expense from UI
function removeExpensefromUI(expenseid) {
  const expenseElemId = `expense-${expenseid}`;
  document.getElementById(expenseElemId).remove();
}

// Enable dark mode
function enableDarkMode() {
  document.body.classList.add("dark-mode");
  document.getElementById("rzp-button1").textContent = "You're Premium User";
  document.getElementById("rzp-button1").disabled = true;
  document.getElementById("leaderboard-button").style.display = "block";
}

document.getElementById("leaderboard-button").onclick = function () {
  axios
    .get(`${URLTOBACKEND}premium/showLeaderBoard`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 200) {
        const leaderboardList = document.getElementById("leaderboard-list");
        leaderboardList.innerHTML = ""; // Clear any previous data
        const leaderboardData = response.data;

        leaderboardData.forEach((user, index) => {
          const row = document.createElement("tr");
          // Add medals for top 3 users
          let medal = "";
          if (index === 0) {
            medal = "🥇"; // Gold Medal
          } else if (index === 1) {
            medal = "🥈"; // Silver Medal
          } else if (index === 2) {
            medal = "🥉"; // Bronze Medal
          }
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}${medal}</td>
            <td>${user.totalExpenses}</td>
          `;
          leaderboardList.appendChild(row);
        });

        document.getElementById("leaderboard").style.display = "block";
      } else {
        throw new Error("Failed to fetch leaderboard");
      }
    })
    .catch((err) => {
      console.error("Error fetching leaderboard:", err);
      alert("Unable to fetch leaderboard data.");
    });
};

// Buy premium membership
document.getElementById("rzp-button1").onclick = async function (e) {
  e.preventDefault();

  const response = await axios.get(
    `${URLTOBACKEND}purchase/premiummembership`,
    { headers: { Authorization: token } }
  );

  const options = {
    key: response.data.key_id,
    amount: response.data.order.amount,
    name: "Uma Shankar",
    description: "Premium Membership",
    order_id: response.data.order.id,
    prefill: {
      name: "Uma Shankar",
      email: EMAILID,
      contact: PHONENO,
    },
    theme: {
      color: "#3399cc",
    },
    handler: function (response) {
      axios
        .post(
          `${URLTOBACKEND}purchase/updatetransactionstatus`,
          {
            orderid: options.order_id,
            paymentid: response.razorpay_payment_id,
          },
          { headers: { Authorization: token } }
        )
        .then(() => {
          alert("You are a Premium User Now");
          localStorage.setItem(
            "userDetails",
            JSON.stringify({ ispremiumuser: true })
          );
          enableDarkMode();
        })
        .catch(() => {
          alert("Something went wrong. Try Again!!!");
        });
    },
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();

  rzp1.on("payment.failed", function (response) {
    alert("Payment Failed");
    console.error(response.error);
  });
};

// Show error
function showError(err) {
  document.body.innerHTML += `<div style="color:red;"> ${err}</div>`;
}

function getExpenses(page, limit) {
  tableBody.innerHTML = "";

  axios
    .get(`${URLTOBACKEND}expense/getexpense?page=${page}&limit=${limit}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 200) {
        // console.log(response.data);
        const { total } = response.data;
        totalCount = total;
        response.data.expense.results.forEach((expense) => {
          addNewExpensetoUI(expense);
        });
        updatedPagination(page, limit);
        updateButtonsState(page, limit);
      } else {
        throw new Error("Failed to fetch expenses");
      }
    })
    .catch((err) => showError(err));
}

setLimitDropdown.addEventListener("change", () => {
  const limit = parseInt(setLimitDropdown.value);
  localStorage.setItem("pagelimit", limit);
  currentPage = 1;
  getExpenses(currentPage, limit);
});

// Pagination
prev.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    const limit = parseInt(setLimitDropdown.value) || 5;
    getExpenses(currentPage, limit);
  }
});

next.addEventListener("click", () => {
  const limit = parseInt(setLimitDropdown.value) || 5;
  if (currentPage * limit < totalCount) {
    currentPage++;
    getExpenses(currentPage, limit);
  }
});

// On page load
window.addEventListener("DOMContentLoaded", () => {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const limit = parseInt(setLimitDropdown.value);
  // console.log(userDetails);
  username.textContent = userDetails.username;

  if (userDetails?.ispremiumuser) {
    enableDarkMode();
  }
  const savedLimit = localStorage.getItem("pagelimit") || 5;
  setLimitDropdown.value = savedLimit;

  getExpenses(1, savedLimit);
  updatedPagination(currentPage, limit);
  updateButtonsState(currentPage, limit);
  updateClock();
});

function updatedPagination(currentPage, itemsPerPage) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalCount);
  paginationInfo.textContent = `Showing ${start}-${end} of ${totalCount}`;
}
function updateButtonsState(currentPage, itemsPerPage) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  prev.disabled = currentPage === 1; // Disable "Prev" button if on the first page
  next.disabled = currentPage >= totalPages; // Disable "Next" button if on the last page
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timeString = `${hours}:${minutes}:${seconds}`;

  document.getElementById("clock").textContent = timeString;
}
// Update the clock every second
setInterval(updateClock, 1000);
