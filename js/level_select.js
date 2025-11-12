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

// Start game button functionality
document.getElementById('startGameBtn').addEventListener('click', function() {
  if (!selectedGame) return;
  
  // Show loading/starting message
  const btn = this;
  const originalText = btn.textContent;
  btn.textContent = "LOADING...";
  btn.disabled = true;
  
  // Simulate game loading
  setTimeout(() => {
    alert(`Starting ${games[selectedGame].title}!\n\nThis would launch the actual game in a complete implementation.`);
    
    // Reset button
    btn.textContent = originalText;
    btn.disabled = false;
    
    // In a real implementation, you would redirect to the actual game:
    // window.location.href = `games/${selectedGame}.html`;
  }, 1000);
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