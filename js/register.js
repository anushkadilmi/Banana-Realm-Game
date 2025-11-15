import { app } from "./firebaseAuthentication.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import { 
  getDatabase, 
  ref, 
  set 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const auth = getAuth(app);
const db = getDatabase(app);

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("newUser").value.trim();
  const password = document.getElementById("newPass").value.trim();
  const confirmPassword = document.getElementById("confirmPass").value.trim();

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match!");
    return;
  }

  if (password.length < 6) {
    alert("❌ Password must be at least 6 characters!");
    return;
  }

  const email = `${username}@bananarealm.com`;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await set(ref(db, "Users/" + user.uid), {
      username,
      createdAt: new Date().toISOString(),
      highScore: 0,
      level: 1
    });

    alert("🎉 Account created successfully! You can now log in.");
    window.location.href = "login.html"; 

  } catch (error) {
    console.error(error);

    let message = "❌ Something went wrong.";
    if (error.code === "auth/email-already-in-use") message = "⚠ Username already exists!";
    if (error.code === "auth/invalid-email") message = "⚠ Invalid username.";
    if (error.code === "auth/weak-password") message = "⚠ Weak password.";

    alert(message);
  }
});
