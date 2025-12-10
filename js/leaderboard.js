import { achievementManager } from './achievements.js';
import { auth } from './firebaseAuthentication.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

let currentUser = null;
let currentDifficulty = 'easy';

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        console.log('User logged in:', user.uid, 'Username:', user.displayName);
        await loadLeaderboard(currentDifficulty);
    } else {
        alert('Please log in to view the leaderboard!');
        window.location.href = "login.html";
    }
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        
        // Get difficulty and load leaderboard
        currentDifficulty = btn.dataset.difficulty;
        await loadLeaderboard(currentDifficulty);
    });
});

async function loadLeaderboard(difficulty) {
    try {
        showLoading();
        
        console.log('Loading leaderboard for:', difficulty);
        
        // Get leaderboard data using achievement manager
        const leaderboardData = await achievementManager.getLeaderboard(difficulty, 100);
        
        console.log('Leaderboard data received:', leaderboardData);
        
        if (!leaderboardData || leaderboardData.length === 0) {
            showNoData();
            return;
        }
        
        displayLeaderboard(leaderboardData, difficulty);
        await displayYourStats(difficulty);
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError();
    }
}

function displayLeaderboard(data, difficulty) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    data.forEach((entry, index) => {
        const row = document.createElement('tr');
        const rank = index + 1;
        
        // Highlight current user's row
        if (currentUser && entry.userId === currentUser.uid) {
            row.classList.add('your-row');
        }
        
        // Medal emojis for top 3
        let rankDisplay = rank;
        if (rank === 1) rankDisplay = '🥇 1';
        else if (rank === 2) rankDisplay = '🥈 2';
        else if (rank === 3) rankDisplay = '🥉 3';
        
        // Format date
        let dateStr = 'N/A';
        if (entry.timestamp) {
            const date = new Date(entry.timestamp);
            dateStr = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
        } else if (entry.date) {
            const date = new Date(entry.date);
            dateStr = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
        }
        
        // Ensure username is displayed
        const username = entry.username || 'Anonymous';
        
        row.innerHTML = `
            <td class="rank-cell">${rankDisplay}</td>
            <td class="player-cell">${username}</td>
            <td class="score-cell">${entry.score || 0}</td>
            <td class="date-cell">${dateStr}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    hideLoading();
    document.getElementById('leaderboardTable').style.display = 'table';
}

async function displayYourStats(difficulty) {
    if (!currentUser) return;
    
    try {
        // Get user's rank
        const rank = await achievementManager.getUserRank(difficulty);
        
        // Get user's progress for this difficulty
        const progressData = await achievementManager.getDifficultyStats();
        const userProgress = progressData ? progressData[difficulty] : null;
        
        if (userProgress || rank) {
            const yourStatsDiv = document.getElementById('yourStats');
            yourStatsDiv.style.display = 'block';
            
            document.getElementById('yourRank').textContent = rank || '-';
            document.getElementById('yourScore').textContent = userProgress?.highScore || 0;
            document.getElementById('yourAttempts').textContent = userProgress?.attempts || 0;
        }
        
    } catch (error) {
        console.error('Error loading your stats:', error);
    }
}

function showLoading() {
    document.getElementById('loadingMessage').style.display = 'flex';
    document.getElementById('leaderboardTable').style.display = 'none';
    document.getElementById('yourStats').style.display = 'none';
    document.getElementById('noDataMessage').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingMessage').style.display = 'none';
}

function showNoData() {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('leaderboardTable').style.display = 'none';
    document.getElementById('yourStats').style.display = 'none';
    document.getElementById('noDataMessage').style.display = 'block';
    document.getElementById('noDataMessage').innerHTML = '<p>No scores yet for this difficulty. Be the first to play!</p>';
}

function showError() {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('leaderboardTable').style.display = 'none';
    document.getElementById('yourStats').style.display = 'none';
    const noDataDiv = document.getElementById('noDataMessage');
    noDataDiv.innerHTML = '<p style="color: #f44336;">Error loading leaderboard. Please try again later.</p>';
    noDataDiv.style.display = 'block';
}

// Navigation
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = "game.html";
});

// Optional: Add refresh button
document.getElementById('refreshBtn')?.addEventListener('click', () => {
    loadLeaderboard(currentDifficulty);
});