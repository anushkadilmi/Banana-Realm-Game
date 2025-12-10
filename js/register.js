console.log("register.js loaded!");

import { app, database } from "./firebaseAuthentication.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import { ref, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const auth = getAuth(app);

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("newUser").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPass").value.trim();
  const confirm = document.getElementById("confirmPass").value.trim();

  if (password !== confirm) {
    alert("❌ Passwords do not match!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    await set(ref(database, "Users/" + user.uid), {
      username: username,
      email: email,
      createdAt: new Date().toISOString(),
      highScore: 0
    });

    alert("📩 Account created! Verification email sent.");

    setTimeout(() => {
      window.location.href = "verify.html";
    }, 800);

  } catch (error) {
    console.error(error);

    let msg = "❌ Something went wrong.";
    if (error.code === "auth/email-already-in-use") msg = "⚠ Email already registered!";
    if (error.code === "auth/invalid-email") msg = "⚠ Invalid email!";
    if (error.code === "auth/weak-password") msg = "⚠ Weak password!";

    alert(msg);
  }
});
