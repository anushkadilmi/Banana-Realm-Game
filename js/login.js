// Handle login validation
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Temporary default credentials for testing
  const defaultUser = "player";
  const defaultPass = "adventure123";

  // Stored user credentials (from register page)
  const savedUser = localStorage.getItem("username");
  const savedPass = localStorage.getItem("password");

  if (!username || !password) {
    alert("Please fill out all fields!");
    return;
  }

  // Check against saved credentials OR temporary test credentials
  if (
    (username === savedUser && password === savedPass) ||
    (username === defaultUser && password === defaultPass)
  ) {
    alert("Login successful!");
    window.location.href = "game.html"; // move to main game
  } else {
    alert("Invalid username or password. Try again!");
  }
});

// Redirect to register page
document.getElementById("registerBtn").addEventListener("click", function() {
  window.location.href = "register.html";
});
