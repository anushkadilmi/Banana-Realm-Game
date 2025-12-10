// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmPj8C2JQvHyAyEyEXH8DfdSwNOvNMXuI",
  authDomain: "banana-realm-53e5a.firebaseapp.com",
  projectId: "banana-realm-53e5a",
  storageBucket: "banana-realm-53e5a.firebasestorage.app",
  messagingSenderId: "432057721420",
  appId: "1:432057721420:web:cfba311b1616a955cb0ae9",
  databaseURL: "https://banana-realm-53e5a-default-rtdb.firebaseio.com"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Database paths
export const DB_PATHS = {
  users: "users",
  userProgress: "userProgress", // New path for user game progress
  leaderboard: "leaderboard/global",
  achievements: "achievements",
  scores: "scores", // All game scores
  globalStats: "globalStats" // Overall statistics
};
console.log("firebaseAuthentication.js loaded!");
