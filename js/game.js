// Add functionality to menu items
document.getElementById("playBtn").addEventListener("click", function() {
  alert("Starting your adventure!");
   window.location.href = "level-select.html"; // Uncomment when level select page is ready
});

document.getElementById("leaderBtn").addEventListener("click", function() {
  alert("Opening leaderboard!");
  // window.location.href = "leaderboard.html"; // Uncomment when leaderboard page is ready
});

document.getElementById("creditBtn").addEventListener("click", function() {
  alert("Showing credits!");
  // window.location.href = "credits.html"; // Uncomment when credits page is ready
});

document.getElementById("achievementBtn").addEventListener("click", function() {
  alert("Viewing achievements!");
  // window.location.href = "achievements.html"; // Uncomment when achievements page is ready
});

document.getElementById("quietBtn").addEventListener("click", function() {
  alert("Opening settings!");
  // window.location.href = "settings.html"; // Uncomment when settings page is ready
});

document.getElementById("boardBtn").addEventListener("click", function() {
  alert("Opening message board!");
  // window.location.href = "board.html"; // Uncomment when board page is ready
});

// Add logout functionality (optional)
// You can add a logout button in the footer or header if needed
function logout() {
  if(confirm("Are you sure you want to logout?")) {
    // Clear any session data if needed
    // localStorage.removeItem('currentUser'); // Example
    window.location.href = "login.html";
  }
}

// Display current user if available
window.addEventListener('DOMContentLoaded', function() {
  const currentUser = localStorage.getItem('username') || 'player1';
  const welcomeElement = document.createElement('div');
  welcomeElement.className = 'welcome-user';
  welcomeElement.innerHTML = `Welcome, <span class="username">${currentUser}</span>!`;
  welcomeElement.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0,0,0,0.7);
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 14px;
  `;
  
  const usernameSpan = welcomeElement.querySelector('.username');
  usernameSpan.style.color = '#ffcc33';
  usernameSpan.style.fontWeight = 'bold';
  
  document.body.appendChild(welcomeElement);
});