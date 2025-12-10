import { auth, database } from './firebaseAuthentication.js';
import { ref, set, get, update } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

let currentUser = null;

// Define achievements with their requirements
export const ACHIEVEMENTS = {
  BEGINNER: {
    id: 'beginner',
    title: 'First Steps',
    description: 'Score your first 100 points',
    icon: '🥉',
    condition: (score) => score >= 100,
    points: 10
  },
  ADVANCED: {
    id: 'advanced',
    title: 'Advanced Explorer',
    description: 'Score 500 points in one game',
    icon: '🥈',
    condition: (score) => score >= 500,
    points: 25
  },
  MASTER: {
    id: 'master',
    title: 'Banana Master',
    description: 'Score 1000 points in one game',
    icon: '🥇',
    condition: (score) => score >= 1000,
    points: 50
  },
  EASY_COMPLETER: {
    id: 'easy_completer',
    title: 'Easy Explorer',
    description: 'Complete all easy puzzles',
    icon: '🍌',
    condition: (progress) => progress.easy?.completed === true,
    points: 15
  },
  MEDIUM_COMPLETER: {
    id: 'medium_completer',
    title: 'Medium Master',
    description: 'Complete all medium puzzles',
    icon: '🍌🍌',
    condition: (progress) => progress.medium?.completed === true,
    points: 30
  },
  HARD_COMPLETER: {
    id: 'hard_completer',
    title: 'Hardcore Hero',
    description: 'Complete all hard puzzles',
    icon: '🍌🍌🍌',
    condition: (progress) => progress.hard?.completed === true,
    points: 60
  },
  PERFECT_GAME: {
    id: 'perfect_game',
    title: 'Perfect Game',
    description: 'Complete a level without using hints',
    icon: '⭐',
    condition: (gameData) => gameData.hintsUsed === 0,
    points: 20
  },
  SPEED_RUNNER: {
    id: 'speed_runner',
    title: 'Speed Runner',
    description: 'Complete a level with more than 30 seconds remaining',
    icon: '⚡',
    condition: (gameData) => gameData.timeLeft >= 30,
    points: 25
  },
  FIRST_BLOOD: {
    id: 'first_blood',
    title: 'First Blood',
    description: 'Complete your first puzzle',
    icon: '🎮',
    condition: (stats) => stats.totalGames >= 1,
    points: 5
  },
  DEDICATED: {
    id: 'dedicated',
    title: 'Dedicated Player',
    description: 'Play 10 games',
    icon: '🏆',
    condition: (stats) => stats.totalGames >= 10,
    points: 30
  }
};

export class AchievementManager {
  constructor() {
    console.log('AchievementManager constructor called');
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        console.log('User authenticated:', user.uid, 'Username:', user.displayName);
      } else {
        console.log('No user authenticated');
      }
    });
  }

  // Helper function to get username from database
  async getUsername(userId) {
    try {
      if (!userId) return 'Anonymous';
      
      const userRef = ref(database, `Users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        // Return username or displayName or email part
        if (userData.username) return userData.username;
        if (userData.displayName) return userData.displayName;
        if (userData.email) return userData.email.split('@')[0];
      }
      
      // Fallback: Check if this is current user's displayName
      if (currentUser && userId === currentUser.uid && currentUser.displayName) {
        return currentUser.displayName;
      }
      
      return 'Anonymous';
    } catch (error) {
      console.error('Error getting username:', error);
      return 'Anonymous';
    }
  }

  // Save score to database
  async saveGameScore(gameData) {
    console.log('saveGameScore called with:', gameData);
    
    if (!currentUser) {
      console.error('No user logged in');
      return null;
    }

    try {
      // Get username
      const username = await this.getUsername(currentUser.uid);
      
      const scoreData = {
        userId: currentUser.uid,
        username: username,
        score: gameData.score,
        difficulty: gameData.difficulty,
        level: gameData.level,
        hintsUsed: gameData.hintsUsed,
        timeLeft: gameData.timeLeft,
        completed: gameData.completed || false,
        timestamp: Date.now(),
        date: new Date().toISOString()
      };

      console.log('Saving score data for user:', username);

      // Save to scores collection
      const scoreRef = ref(database, `scores/${currentUser.uid}/${Date.now()}`);
      await set(scoreRef, scoreData);
      console.log('Score saved successfully');

      // Update leaderboard for this difficulty
      await this.updateLeaderboard(scoreData);

      // Update user's highest score for this difficulty
      await this.updateUserProgress(gameData);

      // Check and unlock achievements
      await this.checkAchievements(gameData);

      return scoreData;
    } catch (error) {
      console.error('Error saving score:', error);
      return null;
    }
  }

  // Update leaderboard
  async updateLeaderboard(scoreData) {
    try {
      const leaderboardRef = ref(database, `leaderboard/${scoreData.difficulty}/${currentUser.uid}`);
      
      // Get current best score
      const snapshot = await get(leaderboardRef);
      
      if (!snapshot.exists() || scoreData.score > snapshot.val().score) {
        // Get fresh username from database
        const username = await this.getUsername(currentUser.uid);
        
        // Update with new high score
        await set(leaderboardRef, {
          username: username,
          score: scoreData.score,
          timestamp: scoreData.timestamp,
          date: scoreData.date,
          difficulty: scoreData.difficulty
        });
        console.log('Leaderboard updated for', scoreData.difficulty, 'user:', username);
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  // Update user progress
  async updateUserProgress(gameData) {
    try {
      const progressRef = ref(database, `userProgress/${currentUser.uid}/${gameData.difficulty}`);
      const snapshot = await get(progressRef);
      
      let progress = snapshot.exists() ? snapshot.val() : {
        highScore: 0,
        attempts: 0,
        totalScore: 0,
        completed: false,
        lastPlayed: null
      };

      // Update progress
      progress.attempts = (progress.attempts || 0) + 1;
      progress.totalScore = (progress.totalScore || 0) + gameData.score;
      progress.lastPlayed = new Date().toISOString();
      
      if (gameData.score > (progress.highScore || 0)) {
        progress.highScore = gameData.score;
      }

      // Check if level was completed
      if (gameData.completed) {
        progress.completed = true;
      }

      await set(progressRef, progress);
      console.log('User progress updated for', gameData.difficulty);

      // Update global stats
      await this.updateGlobalStats(gameData);

    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  }

  // Update global statistics
  async updateGlobalStats(gameData) {
    try {
      const statsRef = ref(database, `globalStats/${currentUser.uid}`);
      const snapshot = await get(statsRef);
      
      let stats = snapshot.exists() ? snapshot.val() : {
        totalGames: 0,
        totalScore: 0,
        totalPuzzles: 0,
        hintlessGames: 0,
        averageScore: 0,
        lastPlayed: null
      };

      stats.totalGames = (stats.totalGames || 0) + 1;
      stats.totalScore = (stats.totalScore || 0) + gameData.score;
      stats.totalPuzzles = (stats.totalPuzzles || 0) + gameData.level;
      stats.lastPlayed = new Date().toISOString();
      
      if (gameData.hintsUsed === 0) {
        stats.hintlessGames = (stats.hintlessGames || 0) + 1;
      }

      // Calculate average score
      if (stats.totalGames > 0) {
        stats.averageScore = Math.round(stats.totalScore / stats.totalGames);
      }

      await set(statsRef, stats);
      console.log('Global stats updated');

    } catch (error) {
      console.error('Error updating global stats:', error);
    }
  }

  // Check and unlock achievements
  async checkAchievements(gameData) {
    try {
      const achievementsRef = ref(database, `achievements/${currentUser.uid}`);
      const snapshot = await get(achievementsRef);
      
      const userAchievements = snapshot.exists() ? snapshot.val() : {};
      const unlockedAchievements = [];

      // Get user's stats for achievement checks
      const statsRef = ref(database, `globalStats/${currentUser.uid}`);
      const statsSnapshot = await get(statsRef);
      const userStats = statsSnapshot.exists() ? statsSnapshot.val() : {};

      // Get user's progress for difficulty-based achievements
      const progressRef = ref(database, `userProgress/${currentUser.uid}`);
      const progressSnapshot = await get(progressRef);
      const userProgress = progressSnapshot.exists() ? progressSnapshot.val() : {};

      // Check each achievement
      for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
        // Skip if already unlocked
        if (userAchievements[achievement.id]) continue;

        let conditionMet = false;

        // Check condition based on achievement type
        switch (key) {
          case 'BEGINNER':
          case 'ADVANCED':
          case 'MASTER':
            conditionMet = achievement.condition(gameData.score);
            break;
          case 'EASY_COMPLETER':
          case 'MEDIUM_COMPLETER':
          case 'HARD_COMPLETER':
            conditionMet = achievement.condition(userProgress);
            break;
          case 'PERFECT_GAME':
          case 'SPEED_RUNNER':
            conditionMet = achievement.condition(gameData);
            break;
          case 'FIRST_BLOOD':
          case 'DEDICATED':
            conditionMet = achievement.condition(userStats);
            break;
          default:
            conditionMet = false;
        }

        if (conditionMet) {
          // Unlock achievement
          const achievementData = {
            ...achievement,
            unlockedAt: Date.now(),
            unlockedDate: new Date().toISOString(),
            unlockedInGame: gameData.difficulty || 'unknown'
          };

          userAchievements[achievement.id] = achievementData;
          unlockedAchievements.push(achievementData);

          // Show notification
          this.showAchievementNotification(achievementData);
        }
      }

      // Save updated achievements
      if (unlockedAchievements.length > 0) {
        await set(achievementsRef, userAchievements);
        console.log('Achievements unlocked:', unlockedAchievements.map(a => a.title));
      }

      return unlockedAchievements;

    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Show achievement notification
  showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">🎉 Achievement Unlocked!</div>
        <div class="achievement-name">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
        <div class="achievement-points">+${achievement.points} points</div>
      </div>
    `;

    // Style the notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 15px;
      max-width: 350px;
      animation: slideInRight 0.5s ease-out;
      border-left: 5px solid gold;
      font-family: Arial, sans-serif;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.5s ease-out forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 5000);
  }

  // Get user's achievements
  async getUserAchievements(userId = null) {
    const targetUserId = userId || currentUser?.uid;
    if (!targetUserId) return [];

    try {
      const achievementsRef = ref(database, `achievements/${targetUserId}`);
      const snapshot = await get(achievementsRef);
      
      return snapshot.exists() ? Object.values(snapshot.val()) : [];
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  // Get user's stats
  async getUserStats(userId = null) {
    const targetUserId = userId || currentUser?.uid;
    if (!targetUserId) return null;

    try {
      const statsRef = ref(database, `globalStats/${targetUserId}`);
      const snapshot = await get(statsRef);
      
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Get difficulty statistics
  async getDifficultyStats(userId = null) {
    const targetUserId = userId || currentUser?.uid;
    if (!targetUserId) return null;

    try {
      const progressRef = ref(database, `userProgress/${targetUserId}`);
      const snapshot = await get(progressRef);
      
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting difficulty stats:', error);
      return null;
    }
  }

  // Get leaderboard data - UPDATED TO FETCH USERNAMES PROPERLY
  async getLeaderboard(difficulty = 'easy', limit = 100) {
    try {
      const leaderboardRef = ref(database, `leaderboard/${difficulty}`);
      const snapshot = await get(leaderboardRef);

      if (!snapshot.exists()) return [];

      const leaderboardData = [];
      const entries = snapshot.val();
      
      // Process all entries
      for (const [userId, entry] of Object.entries(entries)) {
        // Get fresh username from database for each entry
        const username = await this.getUsername(userId);
        
        leaderboardData.push({
          userId: userId,
          username: username,
          score: entry.score || 0,
          timestamp: entry.timestamp || Date.now(),
          date: entry.date || new Date().toISOString(),
          difficulty: entry.difficulty || difficulty
        });
      }

      // Sort by score descending
      leaderboardData.sort((a, b) => b.score - a.score);

      // Limit results
      return leaderboardData.slice(0, limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Get user's rank on leaderboard
  async getUserRank(difficulty = 'easy') {
    if (!currentUser) return null;

    try {
      const leaderboardData = await this.getLeaderboard(difficulty, 1000);
      const userEntry = leaderboardData.find(entry => entry.userId === currentUser.uid);
      
      if (userEntry) {
        return leaderboardData.indexOf(userEntry) + 1;
      }
      return null;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  // NEW: Function to update existing leaderboard entries with usernames
  async updateExistingLeaderboardUsernames() {
    try {
      const difficulties = ['easy', 'medium', 'hard'];
      const updates = {};
      
      for (const difficulty of difficulties) {
        const leaderboardRef = ref(database, `leaderboard/${difficulty}`);
        const snapshot = await get(leaderboardRef);
        
        if (snapshot.exists()) {
          const entries = snapshot.val();
          
          for (const [userId, entry] of Object.entries(entries)) {
            // Get username from database
            const username = await this.getUsername(userId);
            
            // Only update if username is different
            if (username !== 'Anonymous' && entry.username !== username) {
              updates[`leaderboard/${difficulty}/${userId}/username`] = username;
            }
          }
        }
      }
      
      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
        console.log('Updated existing leaderboard entries with usernames');
      }
      
    } catch (error) {
      console.error('Error updating leaderboard usernames:', error);
    }
  }
}

// Create and export a single instance
export const achievementManager = new AchievementManager();