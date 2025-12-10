
// Music functionality
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const volumeSlider = document.getElementById('volumeSlider');

let isMusicPlaying = localStorage.getItem('musicPlaying') === 'true';
let volume = localStorage.getItem('musicVolume') || 0.7;
let musicEnabled = false;

backgroundMusic.volume = volume;
volumeSlider.value = volume;

function initializeMusic() {
    isMusicPlaying = false;
    musicToggle.textContent = '🔇';
    backgroundMusic.pause();
    musicToggle.title = 'Click anywhere first to enable music';
    musicToggle.style.opacity = '0.7';
    enableMusicInteraction();
}

function enableMusicInteraction() {
    const enableMusic = () => {
        musicEnabled = true;
        document.removeEventListener('click', enableMusic);
        document.removeEventListener('keydown', enableMusic);
        musicToggle.style.cursor = 'pointer';
        musicToggle.style.opacity = '1';
        musicToggle.title = 'Click to play music';
        if (isMusicPlaying) {
            playMusic();
        }
    };
    
    document.addEventListener('click', enableMusic, { once: true });
    document.addEventListener('keydown', enableMusic, { once: true });
}

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

function pauseMusic() {
    backgroundMusic.pause();
    musicToggle.textContent = '🔇';
    isMusicPlaying = false;
    localStorage.setItem('musicPlaying', false);
}

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

volumeSlider.addEventListener('input', function() {
    backgroundMusic.volume = this.value;
    localStorage.setItem('musicVolume', this.value);
    
    if (this.value == 0 && isMusicPlaying) {
        musicToggle.textContent = '🔈';
    } else if (isMusicPlaying) {
        musicToggle.textContent = '🔊';
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden && isMusicPlaying) {
        backgroundMusic.pause();
    } else if (!document.hidden && isMusicPlaying && musicEnabled) {
        backgroundMusic.play().catch(e => {
            console.log('Resume failed:', e);
        });
    }
});

backgroundMusic.addEventListener('error', function(e) {
    console.error('Audio error:', e);
    musicToggle.style.color = '#ff4444';
    musicToggle.title = 'Audio file not found. Please check audio files.';
    musicToggle.textContent = '❌';
});

// Game selection logic
let selectedGame = null;

const games = {
  bananaRanger: {
    title: "BANANA RANGER",
    description: "Start your journey! Master the basics of banana mathematics in this introductory adventure.",
    difficulty: "Easy",
    difficultyLevel: "easy",
    icon: "🍌"
  },
  jungleExplorer: {
    title: "JUNGLE EXPLORER",
    description: "Embark on an epic journey through uncharted jungles with increasingly challenging puzzles.",
    difficulty: "Medium",
    difficultyLevel: "medium",
    icon: "🌴"
  },
  realmGuardian: {
    title: "REALM GUARDIAN",
    description: "Defend the Banana Realm from ancient evil forces. Only the most skilled can succeed!",
    difficulty: "Hard",
    difficultyLevel: "hard",
    icon: "🛡️"
  }
};

// Game progression requirements
const progressionRequirements = {
    easy: { unlocked: true, required: false },
    medium: { unlocked: false, required: 'easy' },
    hard: { unlocked: false, required: 'medium' }
};

// Add click events to game cards
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', function() {
    const gameId = this.id;
    const game = games[gameId];
    
    // Check if game is unlocked
    if (!progressionRequirements[game.difficultyLevel].unlocked) {
        const requiredLevel = progressionRequirements[game.difficultyLevel].required;
        alert(`⚠️ You must complete ${games[Object.keys(games).find(k => games[k].difficultyLevel === requiredLevel)].title} (${requiredLevel.toUpperCase()}) first!`);
        return;
    }
    
    document.querySelectorAll('.game-card').forEach(c => {
      c.classList.remove('selected');
    });
    
    this.classList.add('selected');
    selectedGame = gameId;
    
    updateGamePreview(gameId);
    document.getElementById('startGameBtn').disabled = false;
  });
});

function updateGamePreview(gameId) {
  const game = games[gameId];
  const preview = document.getElementById('gamePreview');
  
  document.getElementById('selectedGameTitle').textContent = game.title;
  document.getElementById('selectedGameDesc').textContent = game.description;
}

// Unlock levels based on progression
function updateGameAvailability() {
    const progression = JSON.parse(localStorage.getItem('levelProgression') || '{}');
    
    // Easy is always unlocked
    progressionRequirements.easy.unlocked = true;
    
    // Medium unlocked if Easy is completed
    if (progression.easy && progression.easy.passed) {
        progressionRequirements.medium.unlocked = true;
        const mediumCard = document.getElementById('jungleExplorer');
        if (mediumCard) mediumCard.classList.add('unlocked');
    } else {
        const mediumCard = document.getElementById('jungleExplorer');
        if (mediumCard) mediumCard.classList.add('locked');
    }
    
    // Hard unlocked if Medium is completed
    if (progression.medium && progression.medium.passed) {
        progressionRequirements.hard.unlocked = true;
        const hardCard = document.getElementById('realmGuardian');
        if (hardCard) hardCard.classList.add('unlocked');
    } else {
        const hardCard = document.getElementById('realmGuardian');
        if (hardCard) hardCard.classList.add('locked');
    }
}

// Start game button functionality
document.getElementById('startGameBtn').addEventListener('click', function() {
  if (!selectedGame) return;
  
  const game = games[selectedGame];
  const btn = this;
  const originalText = btn.textContent;
  btn.textContent = "LOADING...";
  btn.disabled = true;
  
  // Store the difficulty level in sessionStorage
  sessionStorage.setItem('gameDifficulty', game.difficultyLevel);
  localStorage.setItem('selectedGame', selectedGame);
  
  setTimeout(() => {
    window.location.href = "game-banana-puzzle.html";
    btn.textContent = originalText;
    btn.disabled = false;
  }, 800);
});

// Back button functionality
document.getElementById('backBtn').addEventListener('click', function() {
  window.location.href = "game.html";
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    window.location.href = "game.html";
  }
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
  initializeMusic();
  updateGameAvailability();
});