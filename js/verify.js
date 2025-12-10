import { app } from "./firebaseAuthentication.js";
import {
  getAuth,
  sendEmailVerification,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const auth = getAuth(app);

document.getElementById("resendBtn").addEventListener("click", () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await sendEmailVerification(user);
      alert("📧 Verification email sent!");
    } else {
      alert("⚠ Log in first.");
    }
  });
});

document.getElementById("goToLogin").addEventListener("click", () => {
  window.location.href = "login.html";
});
