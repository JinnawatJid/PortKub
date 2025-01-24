// Select elements
const profileIcon = document.querySelector(".profile-icon");
const userModal = document.getElementById("userModal");
const closeModal = document.getElementById("closeModal");
const toggleFormText = document.getElementById("toggleFormText");
const modalTitle = document.getElementById("modalTitle");
const submitButton = document.getElementById("submitButton");
const usernameDisplay = document.getElementById("usernameDisplay");

// Open the modal when clicking the profile icon
profileIcon.addEventListener("click", () => {
  userModal.style.display = "block";

  if (localStorage.getItem("username")) {
    // User is logged in, display welcome message
    modalTitle.textContent = `Welcome, ${localStorage.getItem("username")}`;
    submitButton.style.display = "none";
    toggleFormText.innerHTML = `<a href="#" id="logoutLink">Logout</a>`;
    document.getElementById("logoutLink").addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
  } else {
    // Show login form if user is not logged in
    showLoginForm();
  }
});

// Close the modal
closeModal.addEventListener("click", () => {
  userModal.style.display = "none";
});

// Show Login Form
function showLoginForm() {
  modalTitle.textContent = "Login";
  submitButton.textContent = "Login";
  submitButton.style.display = "inline-block";
  toggleFormText.innerHTML = `Don't have an account? <a href="#" id="toggleFormLink">Sign up</a>`;
  document.getElementById("toggleFormLink").addEventListener("click", (e) => {
    e.preventDefault();
    showSignUpForm();
  });
}

// Show Sign-Up Form
function showSignUpForm() {
  modalTitle.textContent = "Sign Up";
  submitButton.textContent = "Sign Up";
  toggleFormText.innerHTML = `Already have an account? <a href="#" id="toggleFormLink">Login</a>`;
  document.getElementById("toggleFormLink").addEventListener("click", (e) => {
    e.preventDefault();
    showLoginForm();
  });
}

// Close modal when clicking outside the modal content
window.addEventListener("click", (e) => {
  if (e.target === userModal) {
    userModal.style.display = "none";
  }
});

// Handle Form Submission (Login or Sign-Up)
document.getElementById("userForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const endpoint =
    modalTitle.textContent === "Login" ? "/api/login" : "/api/createUser";

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success || data.token) {
        alert(`${modalTitle.textContent} successful!`);
        userModal.style.display = "none";

        if (modalTitle.textContent === "Login") {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("username", username);
          updateVirtualMoney();
        }
        checkUserLoginStatus();
      } else {
        alert(data.message || "An error occurred.");
      }
    })
    .catch((error) => console.error("Error:", error));
});

// Check Login Status
function checkUserLoginStatus() {
  if (localStorage.getItem("username")) {
    usernameDisplay.textContent = localStorage.getItem("username");
    usernameDisplay.style.display = "inline";
    document.getElementById("loginItem").style.display = "none";
    document.getElementById("logoutItem").style.display = "block";

    // Fetch and display virtual money
    updateVirtualMoney();
  } else {
    usernameDisplay.style.display = "none";
    document.getElementById("loginItem").style.display = "block";
    document.getElementById("logoutItem").style.display = "none";
    document.getElementById("virtualMoneyItem").style.display = "none";
  }
}

// Function to format the virtual money with thousands separator and no decimals
function formatVirtualMoney(amount) {
  // Convert to integer and add thousands separator
  const roundedAmount = Math.round(amount); // Round to nearest integer if necessary
  return roundedAmount.toLocaleString(); // This adds the thousands separator
}

// Update Virtual Money Display
function updateVirtualMoney() {
  fetch("/api/getVirtualMoney", {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true", // Skip ngrok's browser warning
      "User-Agent": "Mozilla/5.0 (compatible; MyCustomAgent/1.0)", // Custom User-Agent
      "Content-Type": "application/json", // Still need this to specify the request type
    },
    credentials: 'same-origin', // Include session cookie for session management
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch virtual money: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        const virtualMoneyItem = document.getElementById("virtualMoneyItem");
        const formattedMoney = formatVirtualMoney(data.virtualMoney); // Format the virtual money
        virtualMoneyItem.textContent = `${formattedMoney} USD`; // Show the formatted value
        virtualMoneyItem.style.display = "block"; // Show the virtual money element
      } else {
        console.error("Failed to fetch virtual money:", data.message);
      }
    })
    .catch((error) => {
      console.error(error.message);
      alert("Failed to fetch virtual money: Unauthorized. Please log in first.");
    });
}

// Logout User
function logoutUser() {
  fetch("/api/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (response.ok) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        alert("Logged out successfully!");
        checkUserLoginStatus();
        userModal.style.display = "none";
      } else {
        return response.json().then((data) => {
          alert(data.message || "Failed to log out. Try again.");
        });
      }
    })
    .catch((error) => console.error("Logout Error:", error));
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  checkUserLoginStatus();
});
