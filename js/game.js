import { app } from "./firebaseAuthentication.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const auth = getAuth(app);

// Music functionality
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const volumeSlider = document.getElementById('volumeSlider');

// Initialize music state from localStorage
let isMusicPlaying = localStorage.getItem('musicPlaying') === 'true';
let volume = localStorage.getItem('musicVolume') || 0.7;
let musicEnabled = false; // Track if user has interacted

// Set initial volume
backgroundMusic.volume = volume;
volumeSlider.value = volume;

// Initialize music state
function initializeMusic() {
    // Start with music paused due to browser restrictions
    isMusicPlaying = false;
    musicToggle.textContent = '🔇';
    backgroundMusic.pause();
    
    // Add initial tooltip
    musicToggle.title = 'Click anywhere first to enable music';
    musicToggle.style.opacity = '0.7';
    
    // Enable interactive start
    enableMusicInteraction();
}

// Enable music after user interaction
function enableMusicInteraction() {
    const enableMusic = () => {
        // Mark music as enabled
        musicEnabled = true;
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', enableMusic);
        document.removeEventListener('keydown', enableMusic);
        
        // Now music can be controlled
        musicToggle.style.cursor = 'pointer';
        musicToggle.style.opacity = '1';
        musicToggle.title = 'Click to play music';
        
        // If music was playing before, resume it
        if (isMusicPlaying) {
            playMusic();
        }
        
        console.log('Music system enabled - click volume button to play');
    };
    
    // Add event listeners for first user interaction
    document.addEventListener('click', enableMusic, { once: true });
    document.addEventListener('keydown', enableMusic, { once: true });
}

// Play music with proper error handling
function playMusic() {
    if (!musicEnabled) return false;
    
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            musicToggle.textContent = '🔊';
            isMusicPlaying = true;
            localStorage.setItem('musicPlaying', true);
        }).catch(error => {
            console.log('Play failed:', error);
            musicToggle.textContent = '🔇';
            isMusicPlaying = false;
            musicToggle.title = 'Click to try playing music again';
            return false;
        });
    }
    return true;
}

// Pause music
function pauseMusic() {
    backgroundMusic.pause();
    musicToggle.textContent = '🔇';
    isMusicPlaying = false;
    localStorage.setItem('musicPlaying', false);
}

// Toggle music play/pause
musicToggle.addEventListener('click', function() {
    if (!musicEnabled) {
        musicToggle.title = 'Click anywhere on the page first to enable music';
        return;
    }
    
    if (isMusicPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
});

// Volume control
volumeSlider.addEventListener('input', function() {
    backgroundMusic.volume = this.value;
    localStorage.setItem('musicVolume', this.value);
    
    // If volume is set to 0 and music is playing, show muted icon
    if (this.value == 0 && isMusicPlaying) {
        musicToggle.textContent = '🔈'; // Speaker with no sound
    } else if (isMusicPlaying) {
        musicToggle.textContent = '🔊';
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isMusicPlaying) {
        backgroundMusic.pause();
    } else if (!document.hidden && isMusicPlaying && musicEnabled) {
        // Only resume if we have user interaction permission
        backgroundMusic.play().catch(e => {
            console.log('Resume failed:', e);
        });
    }
});

// Add functionality to menu items
document.getElementById("playBtn").addEventListener("click", function() {
    window.location.href = "level-select.html";
});

document.getElementById("leaderBtn").addEventListener("click", function() {
    alert("Opening leaderboard!");
     window.location.href = "leaderboard.html";
});

document.getElementById("creditBtn").addEventListener("click", function() {
    alert("Showing credits!");
     window.location.href = "credit.html";
});

document.getElementById("achievementBtn").addEventListener("click", function() {
    alert("Viewing achievements!");
    window.location.href = "achievements.html";
});

document.getElementById("quietBtn").addEventListener("click", function() {
    alert("Opening settings!");
     window.location.href = "quiet.html";
});



// Logout functionality with Firebase
async function logout() {
    if (confirm("Are you sure you want to logout?")) {
        // Pause music before logout
        pauseMusic();
        
        try {
            await signOut(auth);
            // Clear local storage
            localStorage.removeItem('username');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('musicPlaying');
            localStorage.removeItem('musicVolume');
            
            alert("Logged out successfully!");
            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout error:", error);
            alert("Error logging out. Please try again.");
        }
    }
}

// Check authentication state and display user
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User authenticated:", user.email);
        
        // Extract username from email 
        const username = user.email.split('@')[0];
        
        // Store username in localStorage for offline access
        localStorage.setItem('username', username);
        localStorage.setItem('currentUser', username);
        
        // Display welcome message
        displayWelcomeMessage(username);
        
    } else {
        // No user is signed in - redirect to login
        console.log("No user authenticated, redirecting to login");
        alert("Please login first!");
        window.location.href = "login.html";
    }
});

// Display welcome message with user info
function displayWelcomeMessage(username) {
    // Check if welcome element already exists
    let welcomeElement = document.querySelector('.welcome-user');
    
    if (!welcomeElement) {
        welcomeElement = document.createElement('div');
        welcomeElement.className = 'welcome-user';
        document.body.appendChild(welcomeElement);
    }
    
    welcomeElement.innerHTML = `Welcome, <span class="username">${username}</span>!`;
    
    // Add logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.style.cssText = `
        margin-left: 10px;
        background: rgba(255, 0, 0, 0.3);
        color: white;
        border: 1px solid #ff4444;
        border-radius: 3px;
        padding: 2px 8px;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    logoutBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255, 0, 0, 0.5)';
    });
    logoutBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255, 0, 0, 0.3)';
    });
    logoutBtn.addEventListener('click', logout);
    
    welcomeElement.appendChild(logoutBtn);
}

// Initialize music after DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
    initializeMusic();
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // M key to toggle music (only if music is enabled)
    if (e.code === 'KeyM' && musicEnabled) {
        e.preventDefault();
        musicToggle.click();
    }
    // Space bar to toggle music
    if (e.code === 'Space' && musicEnabled) {
        e.preventDefault();
        musicToggle.click();
    }
    // Escape key for logout
    if (e.code === 'Escape') {
        logout();
    }
});

// Handle audio errors
backgroundMusic.addEventListener('error', function(e) {
    console.error('Audio error:', e);
    musicToggle.style.color = '#ff4444';
    musicToggle.title = 'Audio file not found. Please check audio files.';
    
    // Update icon to show error state
    musicToggle.textContent = '❌';
});

// Handle audio loading
backgroundMusic.addEventListener('loadeddata', function() {
    console.log('Audio loaded successfully');
    musicToggle.title = 'Music ready - click anywhere to enable';
});

// Save music state when leaving page
window.addEventListener('beforeunload', function() {
    localStorage.setItem('musicPlaying', isMusicPlaying);
    localStorage.setItem('musicVolume', backgroundMusic.volume);
});

// Add a welcome message in console
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🎵 Banana Quest Hub Loaded!');
        console.log('💡 Tip: Click anywhere on the page, then click the volume button to enable music');
    }, 500);
});