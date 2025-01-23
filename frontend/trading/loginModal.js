// Select elements
const profileIcon = document.querySelector(".profile-icon");
const userModal = document.getElementById("userModal");
const closeModal = document.getElementById("closeModal");
const toggleFormText = document.getElementById("toggleFormText");
const modalTitle = document.getElementById("modalTitle");
const submitButton = document.getElementById("submitButton");
const usernameDisplay = document.getElementById("usernameDisplay"); // Add an element to display the username

// Open the modal when clicking the profile icon
profileIcon.addEventListener("click", () => {
  userModal.style.display = "block";

  // Check if the user is already logged in and show the username
  if (localStorage.getItem("username")) {
    // User is logged in, display username in the modal
    modalTitle.textContent = "Welcome, " + localStorage.getItem("username");
    submitButton.style.display = "none"; // Hide the submit button
    toggleFormText.innerHTML = `<a href="#" id="logoutLink">Logout</a>`; // Add logout link
    document.getElementById("logoutLink").addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser(); // Log the user out
    });
  } else {
    // User is not logged in, show the login form
    modalTitle.textContent = "Login";
    submitButton.style.display = "inline-block"; // Show the submit button
    toggleFormText.innerHTML = `Don't have an account? <a href="#" id="toggleFormLink">Sign up</a>`;
    const signUpLink = document.getElementById("toggleFormLink");
    signUpLink.addEventListener("click", (e) => {
      e.preventDefault();
      toggleForm(); // Switch to sign up
    });
  }
});

// Close the modal
closeModal.addEventListener("click", () => {
  userModal.style.display = "none";
});

// Switch between Login and Signup forms
function toggleForm() {
  if (modalTitle.textContent === "Login") {
    modalTitle.textContent = "Sign Up";
    submitButton.textContent = "Sign Up";
    toggleFormText.innerHTML = `Already have an account? <a href="#" id="toggleFormLink">Login</a>`;
    const loginLink = document.getElementById("toggleFormLink");
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      toggleForm(); // Switch back to login
    });
  } else {
    modalTitle.textContent = "Login";
    submitButton.textContent = "Login";
    toggleFormText.innerHTML = `Don't have an account? <a href="#" id="toggleFormLink">Sign up</a>`;
    const signUpLink = document.getElementById("toggleFormLink");
    signUpLink.addEventListener("click", (e) => {
      e.preventDefault();
      toggleForm(); // Switch to sign up
    });
  }
}

// Initially set up the event listener for the "Sign up" link
const signUpLink = document.getElementById("toggleFormLink");
signUpLink.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForm(); // Switch to sign up
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (e) => {
  if (e.target === userModal) {
    userModal.style.display = "none";
  }
});

// Form submission (Login or Sign Up)
document.getElementById("userForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log(`${modalTitle.textContent} with`, { username, password });

  // Determine the appropriate endpoint based on the form title
  const endpoint =
    modalTitle.textContent === "Login" ? "/api/login" : "/api/createUser";

  // Send data to the backend using fetch or Axios
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success || data.username) {
        alert(`${modalTitle.textContent} successful!`);
        
        // Close the modal
        userModal.style.display = "none";

        // If login, store the username and token in localStorage
        if (modalTitle.textContent === "Login" && data.token) {
          localStorage.setItem("authToken", data.token); // Store token
          localStorage.setItem("username", username); // Store username
        }

        // Update the navbar and UI based on login state
        checkUserLoginStatus(); // Update navbar on successful login
      } else {
        alert(data.message || "Something went wrong.");
      }
    })
    .catch((error) => console.error("Error:", error));
});

// Check if the user is logged in and update the UI accordingly
function checkUserLoginStatus() {
  if (localStorage.getItem("username")) {
    const username = localStorage.getItem("username");
    
    // Update the username directly in the navbar
    const usernameDisplay = document.getElementById("usernameDisplay");
    usernameDisplay.textContent = `${username}`;
    usernameDisplay.style.display = "inline"; // Show username next to profile picture

    // Show appropriate navbar elements
    document.getElementById("loginItem").style.display = "none"; // Hide login item
    document.getElementById("logoutItem").style.display = "block"; // Show logout item
  } else {
    // Hide username if not logged in
    const usernameDisplay = document.getElementById("usernameDisplay");
    usernameDisplay.style.display = "none"; // Hide username
    document.getElementById("loginItem").style.display = "block"; // Show login item
    document.getElementById("logoutItem").style.display = "none"; // Hide logout item
  }
}

// Call the function to update the UI based on login status on page load
checkUserLoginStatus();