import { app } from "./firebaseAuthentication.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const auth = getAuth(app);

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please fill all fields!");
    return;
  }

  // Convert username → email used in register (same method)
  const email = `${username}@bananarealm.com`;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    alert("🎉 Login successful!");
    window.location.href = "game.html";

  } catch (error) {
    console.error(error);

    let message = "❌ Login failed.";
    if (error.code === "auth/user-not-found") message = "⚠ No such username!";
    if (error.code === "auth/wrong-password") message = "⚠ Incorrect password!";
    if (error.code === "auth/invalid-email") message = "⚠ Invalid username!";

    alert(message);
  }
});

// Go to register page
document.getElementById("registerBtn").addEventListener("click", function () {
 window.location.href = "../html/register.html";
});
