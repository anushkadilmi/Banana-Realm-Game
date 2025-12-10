// Continue button functionality - Routes based on difficulty and progression
document.getElementById("continueBtn").addEventListener("click", function() {
  const difficulty = sessionStorage.getItem('gameDifficulty') || 'easy';
  
  // Show loading state
  const btn = this;
  const originalText = btn.textContent;
  btn.textContent = "LOADING...";
  btn.disabled = true;
  
  // Redirect to game with selected difficulty
  setTimeout(() => {
    window.location.href = "game-banana-puzzle.html";
  }, 1000);
});

// Back button functionality
document.getElementById("backBtn").addEventListener("click", function() {
  window.location.href = "level-select.html";
});

// Helper function to get game title
function getGameTitle(gameId) {
  const games = {
    jungleExplorer: "JUNGLE EXPLORER",
    bananaRanger: "BANANA RANGER", 
    realmGuardian: "REALM GUARDIAN"
  };
  return games[gameId] || "BANANA ADVENTURE";
}

// Helper function to get difficulty label
function getDifficultyLabel(difficulty) {
  const labels = {
    easy: "BANANA RANGER - EASY",
    medium: "JUNGLE EXPLORER - MEDIUM",
    hard: "REALM GUARDIAN - HARD"
  };
  return labels[difficulty] || "BANANA ADVENTURE";
}

// Display instructions and game title when page loads
window.addEventListener('DOMContentLoaded', function() {
  const difficulty = sessionStorage.getItem('gameDifficulty') || 'easy';
  
  // Update header with difficulty info
  const header = document.querySelector('.header h1');
  header.textContent = `HOW TO PLAY - ${getDifficultyLabel(difficulty)}`;
  
  // Update the intro text based on difficulty
  const introText = document.querySelector('.intro-text');
  if (introText) {
    const introMessages = {
      easy: "🍌 BANANA RANGER - EASY MODE 🍌\nSOLVE PUZZLES TO FIND THE BANANA'S SECRET VALUE!",
      medium: "🌴 JUNGLE EXPLORER - MEDIUM MODE 🌴\nTACKLE CHALLENGING PUZZLES IN LIMITED TIME!",
      hard: "🛡️ REALM GUARDIAN - HARD MODE 🛡️\nMASTER DIFFICULT PUZZLES TO BECOME A GUARDIAN!"
    };
    introText.textContent = introMessages[difficulty];
  }
  
  // Update instruction texts based on difficulty
  updateInstructionsForDifficulty(difficulty);
});

// Function to update instructions based on selected difficulty
function updateInstructionsForDifficulty(difficulty) {
  const instructionTexts = document.querySelectorAll('.instruction-text');
  
  const easyInstructions = [
    "SELECT A NUMBER FROM 0-9 THAT SOLVES THE MATH PUZZLE",
    "YOU HAVE 60 SECONDS TO SOLVE EACH PUZZLE",
    "USE HINTS WISELY - YOU HAVE UP TO 5 HINTS!",
    "EACH CORRECT ANSWER EARNS YOU 25-150 POINTS",
    "COMPLETE ALL 6 PUZZLES AND REACH 300+ POINTS TO PASS!"
  ];
  
  const mediumInstructions = [
    "SELECT A NUMBER FROM 0-9 THAT SOLVES THE PUZZLE",
    "YOU HAVE 45 SECONDS TO SOLVE EACH PUZZLE - TIME IS LIMITED!",
    "USE HINTS WISELY - YOU HAVE UP TO 5 HINTS!",
    "EACH CORRECT ANSWER EARNS YOU 37-225 POINTS (1.5x MULTIPLIER)",
    "COMPLETE ALL 6 PUZZLES AND REACH 500+ POINTS TO PASS!"
  ];
  
  const hardInstructions = [
    "SELECT A NUMBER FROM 0-9 THAT SOLVES THE PUZZLE",
    "YOU HAVE ONLY 30 SECONDS TO SOLVE EACH PUZZLE - HURRY!",
    "USE HINTS WISELY - YOU HAVE UP TO 5 HINTS!",
    "EACH CORRECT ANSWER EARNS YOU 50-300 POINTS (2x MULTIPLIER)",
    "COMPLETE ALL 6 PUZZLES AND REACH 800+ POINTS TO PASS!"
  ];
  
  let instructions;
  switch(difficulty) {
    case 'easy':
      instructions = easyInstructions;
      break;
    case 'medium':
      instructions = mediumInstructions;
      break;
    case 'hard':
      instructions = hardInstructions;
      break;
    default:
      instructions = easyInstructions;
  }
  
  instructionTexts.forEach((element, index) => {
    if (instructions[index]) {
      element.textContent = instructions[index];
    }
  });
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('continueBtn').click();
  } else if (e.key === 'Escape') {
    document.getElementById('backBtn').click();
  }
});