import { app } from "./firebaseAuthentication.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const auth = getAuth(app);

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("❌ Fill all fields!");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    if (!userCred.user.emailVerified) {
      alert("⚠ Email not verified! Check your inbox.");
      window.location.href = "verify.html";
      return;
    }

    alert("🎉 Login successful!");

    setTimeout(() => {
      window.location.href = "game.html";
    }, 1000);

  } catch (error) {
    let msg = "❌ Login failed!";
    if (error.code === "auth/user-not-found") msg = "⚠ No account found!";
    if (error.code === "auth/wrong-password") msg = "⚠ Wrong password!";

    alert(msg);
  }
});

// -------------------- RESET PASSWORD --------------------
document.getElementById("forgotPassword").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("⚠ Enter your email first!");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("📩 Password reset link sent! Check your inbox.");
  } catch (error) {
    let msg = "❌ Failed to send reset email.";
    if (error.code === "auth/user-not-found") msg = "⚠ This email has no account!";
    alert(msg);
  }
});
// -------------------- GO TO REGISTER --------------------

document.getElementById("registerBtn").addEventListener("click", () => {
  window.location.href = "register.html";
});
