 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
    import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
    import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
    
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCmPj8C2JQvHyAyEyEXH8DfdSwNOvNMXuI",
    authDomain: "banana-realm-53e5a.firebaseapp.com",
    projectId: "banana-realm-53e5a",
    storageBucket: "banana-realm-53e5a.firebasestorage.app",
    messagingSenderId: "432057721420",
    appId: "1:432057721420:web:cfba311b1616a955cb0ae9"
  };

  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
export const database = getDatabase(app);

// Database paths
export const DB_PATHS = {
  users: 'users',
  leaderboard: 'leaderboard/global',
  achievements: 'achievements'
};