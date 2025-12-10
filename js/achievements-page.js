import { achievementManager, ACHIEVEMENTS } from './achievements.js';
import { auth } from './firebaseAuthentication.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        console.log('User logged in:', user.uid, 'Username:', user.displayName);
        await loadUserData();
    } else {
        alert('Please log in to view achievements!');
        window.location.href = "login.html";
    }
});

async function loadUserData() {
    try {
        console.log('Loading user data...');
        
        // Load user stats
        const stats = await achievementManager.getUserStats();
        console.log('User stats:', stats);
        if (stats) {
            updateStatsOverview(stats);
        }

        // Load difficulty progress
        const progress = await achievementManager.getDifficultyStats();
        console.log('Difficulty stats:', progress);
        if (progress) {
            updateDifficultyStats(progress);
        }

        // Load achievements
        const achievements = await achievementManager.getUserAchievements();
        console.log('User achievements:', achievements);
        displayAchievements(achievements);

    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function updateStatsOverview(stats) {
    document.getElementById('totalGames').textContent = stats.totalGames || 0;
    document.getElementById('totalScore').textContent = stats.totalScore || 0;
    document.getElementById('averageScore').textContent = stats.averageScore || 0;
    
    // Display username if available
    if (currentUser && currentUser.displayName) {
        document.getElementById('userGreeting').textContent = `${currentUser.displayName}'s Achievements`;
    }
}

function updateDifficultyStats(progress) {
    // Easy
    const easyStats = progress.easy || { highScore: 0, attempts: 0, completed: false };
    document.getElementById('easyHighScore').textContent = easyStats.highScore || 0;
    document.getElementById('easyGames').textContent = easyStats.attempts || 0;
    document.getElementById('easyCompleted').textContent = easyStats.completed ? 'Yes ✓' : 'No';
    document.getElementById('easyCompleted').style.color = easyStats.completed ? '#4CAF50' : '#f44336';

    // Medium
    const mediumStats = progress.medium || { highScore: 0, attempts: 0, completed: false };
    document.getElementById('mediumHighScore').textContent = mediumStats.highScore || 0;
    document.getElementById('mediumGames').textContent = mediumStats.attempts || 0;
    document.getElementById('mediumCompleted').textContent = mediumStats.completed ? 'Yes ✓' : 'No';
    document.getElementById('mediumCompleted').style.color = mediumStats.completed ? '#4CAF50' : '#f44336';

    // Hard
    const hardStats = progress.hard || { highScore: 0, attempts: 0, completed: false };
    document.getElementById('hardHighScore').textContent = hardStats.highScore || 0;
    document.getElementById('hardGames').textContent = hardStats.attempts || 0;
    document.getElementById('hardCompleted').textContent = hardStats.completed ? 'Yes ✓' : 'No';
    document.getElementById('hardCompleted').style.color = hardStats.completed ? '#4CAF50' : '#f44336';
}

function displayAchievements(userAchievements) {
    const achievementsGrid = document.getElementById('achievementsGrid');
    achievementsGrid.innerHTML = '';

    const unlockedIds = userAchievements.map(ach => ach.id);
    let unlockedCount = 0;

    // Display all achievements
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        if (isUnlocked) unlockedCount++;

        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        achievementCard.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-status">
                    <span class="achievement-points">${achievement.points} pts</span>
                    <span class="achievement-state">${isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}</span>
                </div>
            </div>
        `;

        achievementsGrid.appendChild(achievementCard);
    });

    // Update achievement count
    document.getElementById('achievementCount').textContent = unlockedCount;
    document.getElementById('totalAchievements').textContent = Object.keys(ACHIEVEMENTS).length;
}

// Navigation
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = "game.html";
});

document.getElementById('leaderboardBtn').addEventListener('click', () => {
    window.location.href = "leaderboard.html";
});

// Refresh button
document.getElementById('refreshBtn')?.addEventListener('click', () => {
    loadUserData();
});