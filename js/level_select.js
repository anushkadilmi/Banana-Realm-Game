
// Music functionality
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const volumeSlider = document.getElementById('volumeSlider');

// Initialize music state from localStorage
let isMusicPlaying = localStorage.getItem('musicPlaying') === 'true';
let volume = localStorage.getItem('musicVolume') || 0.7;
let musicEnabled = false;

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
        musicToggle.textContent = '🔈';
    } else if (isMusicPlaying) {
        musicToggle.textContent = '🔊';
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isMusicPlaying) {
        backgroundMusic.pause();
    } else if (!document.hidden && isMusicPlaying && musicEnabled) {
        backgroundMusic.play().catch(e => {
            console.log('Resume failed:', e);
        });
    }
});

// Handle audio errors
backgroundMusic.addEventListener('error', function(e) {
    console.error('Audio error:', e);
    musicToggle.style.color = '#ff4444';
    musicToggle.title = 'Audio file not found. Please check audio files.';
    musicToggle.textContent = '❌';
});


let selectedGame = null;

const games = {
  jungleExplorer: {
    title: "JUNGLE EXPLORER",
    description: "Embark on an epic journey through uncharted jungles. Discover ancient ruins, solve puzzles, and collect rare bananas while avoiding dangerous wildlife.",
    difficulty: "Medium"
  },
  bananaRanger: {
    title: "BANANA RANGER", 
    description: "Protect the precious banana groves from mischievous monkeys and other threats. Use your quick reflexes and strategic thinking to keep the bananas safe!",
    difficulty: "Easy"
  },
  realmGuardian: {
    title: "REALM GUARDIAN",
    description: "Defend the Banana Realm from ancient evil forces. Master powerful abilities and lead the defense against darkness in this challenging adventure.",
    difficulty: "Hard"
  }
};

// Add click events to game cards
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', function() {
    // Remove selected class from all cards
    document.querySelectorAll('.game-card').forEach(c => {
      c.classList.remove('selected');
    });
    
    // Add selected class to clicked card
    this.classList.add('selected');
    
    // Get game ID and update preview
    const gameId = this.id;
    selectedGame = gameId;
    
    updateGamePreview(gameId);
    
    // Enable start game button
    document.getElementById('startGameBtn').disabled = false;
  });
});

function updateGamePreview(gameId) {
  const game = games[gameId];
  const preview = document.getElementById('gamePreview');
  
  document.getElementById('selectedGameTitle').textContent = game.title;
  document.getElementById('selectedGameDesc').textContent = game.description;
}

// Start game button functionality - UPDATED
document.getElementById('startGameBtn').addEventListener('click', function() {
  if (!selectedGame) return;
  
  // Show loading/starting message
  const btn = this;
  const originalText = btn.textContent;
  btn.textContent = "LOADING...";
  btn.disabled = true;
  
  // Store the selected game in localStorage for the how-to-play page
  localStorage.setItem('selectedGame', selectedGame);
  
  // Simulate brief loading then redirect to how-to-play page
  setTimeout(() => {
    // Redirect to how-to-play page instead of showing alert
    window.location.href = "how-to-play.html";
    
    // Reset button (though we're redirecting, this won't be visible)
    btn.textContent = originalText;
    btn.disabled = false;
  }, 800);
});

// Back button functionality
document.getElementById('backBtn').addEventListener('click', function() {
  window.location.href = "game.html";
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    window.location.href = "game.html";
  }
});
// Initialize music when page loads
window.addEventListener('DOMContentLoaded', function() {
  initializeMusic();
});