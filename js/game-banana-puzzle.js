import { achievementManager } from './achievements.js';

class BananaMathPuzzle {
    constructor() {
        // Get difficulty from sessionStorage
        this.difficulty = sessionStorage.getItem('gameDifficulty') || 'easy';
        this.difficultySettings = {
            easy: { puzzles: 6, timePerPuzzle: 60, minScore: 300, multiplier: 1 },
            medium: { puzzles: 6, timePerPuzzle: 45, minScore: 500, multiplier: 1.5 },
            hard: { puzzles: 6, timePerPuzzle: 30, minScore: 800, multiplier: 2 }
        };
        
        const settings = this.difficultySettings[this.difficulty];
        
        // Game state
        this.timeLeft = settings.timePerPuzzle;
        this.timer = null;
        this.score = 0;
        this.hints = 5;
        this.selectedNumber = null;
        this.isGameOver = false;
        this.hintsUsed = 0;
        this.startTime = null;
        this.lives = 3;
        this.currentLives = 3;
        this.timerRunning = false;
        
        // Puzzle progression
        this.currentLevel = 1;
        this.totalLevels = settings.puzzles;
        this.currentPuzzle = null;
        this.scoreMultiplier = settings.multiplier;
        this.minScoreRequired = settings.minScore;
        this.timePerPuzzle = settings.timePerPuzzle;
        
        this.initializeGame();
    }

    async initializeGame() {
        this.updateUIForDifficulty();
        this.bindEvents();
        this.createNumberPad();
        this.updateLivesDisplay();
        await this.loadNewPuzzle();
        this.startTimer();
        this.startTime = Date.now();
    }

    updateUIForDifficulty() {
        const difficultyDisplay = document.getElementById('difficultyDisplay');
        if (difficultyDisplay) {
            difficultyDisplay.textContent = this.difficulty.toUpperCase();
            difficultyDisplay.style.color = 
                this.difficulty === 'easy' ? '#4CAF50' :
                this.difficulty === 'medium' ? '#FF9800' : '#f44336';
        }
    }

    updateLivesDisplay() {
        const livesElement = document.getElementById('livesValue');
        if (livesElement) {
            livesElement.textContent = this.currentLives;
            if (this.currentLives === 1) {
                livesElement.style.color = '#ff4444';
                livesElement.style.animation = 'pulse 0.5s infinite';
            } else if (this.currentLives === 2) {
                livesElement.style.color = '#FF9800';
                livesElement.style.animation = 'none';
            } else {
                livesElement.style.color = '#FFD700';
                livesElement.style.animation = 'none';
            }
        }
    }

    async loadNewPuzzle() {
        try {
            this.showLoadingState(`Loading Puzzle ${this.currentLevel}...`);
            
            const puzzleData = await this.fetchPuzzleWithProxy();
            
            if (!puzzleData) {
                throw new Error('Failed to load puzzle from API');
            }
            
            this.currentPuzzle = {
                question: puzzleData.question,
                solution: parseInt(puzzleData.solution),
                level: this.currentLevel
            };
            
            this.displayCurrentPuzzle();
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Error loading puzzle from API:', error);
            this.showErrorState('Failed to load puzzle from API. Click RETRY to try again.');
        }
    }

    async fetchPuzzleWithProxy() {
        try {
            const proxies = [
                'https://api.allorigins.win/raw?url=',
                'https://corsproxy.io/?',
                'https://api.codetabs.com/v1/proxy?quest='
            ];
            
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(7);
            const apiUrl = `http://marcconrad.com/uob/banana/api.php?out=json&base64=yes&t=${timestamp}&r=${randomId}`;
            
            for (let proxy of proxies) {
                try {
                    const response = await fetch(proxy + encodeURIComponent(apiUrl), {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });
                    
                    if (!response.ok) continue;
                    
                    const data = await response.json();
                    
                    if (data && data.question && data.solution !== undefined) {
                        data.question = `data:image/png;base64,${data.question}`;
                        return data;
                    }
                } catch (err) {
                    console.warn(`Proxy ${proxy} failed:`, err);
                    continue;
                }
            }
            
            return await this.fetchPuzzleDirect();
            
        } catch (error) {
            console.error('All fetch methods failed:', error);
            throw error;
        }
    }

    async fetchPuzzleDirect() {
        try {
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(7);
            
            const response = await fetch(`http://marcconrad.com/uob/banana/api.php?out=json&base64=yes&t=${timestamp}&r=${randomId}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            
            if (!response.ok) throw new Error('Direct fetch failed');
            
            const data = await response.json();
            
            if (data && data.question && data.solution !== undefined) {
                data.question = `data:image/png;base64,${data.question}`;
                return data;
            }
            
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('Direct fetch error:', error);
            throw error;
        }
    }

    displayCurrentPuzzle() {
        const equationsGrid = document.getElementById('equationsGrid');
        
        equationsGrid.innerHTML = `
            <div class="api-puzzle-display">
                <div class="level-indicator">PUZZLE ${this.currentLevel} of ${this.totalLevels}</div>
                <img src="${this.currentPuzzle.question}" alt="Math Puzzle Level ${this.currentLevel}" class="puzzle-image">
                <div class="puzzle-instruction">
                    <p>Find the value of the banana 🍌 that solves this equation!</p>
                    <div class="progress-tracker">
                        ${this.getProgressDots()}
                    </div>
                </div>
            </div>
        `;
        
        this.updateLevelDisplay();
    }

    getProgressDots() {
        let dots = '';
        for (let i = 1; i <= this.totalLevels; i++) {
            const isActive = i === this.currentLevel;
            const isCompleted = i < this.currentLevel;
            dots += `<span class="progress-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">${i}</span>`;
        }
        return dots;
    }

    showLoadingState(message) {
        const equationsGrid = document.getElementById('equationsGrid');
        equationsGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">🍌</div>
                <p>${message}</p>
                <p class="loading-subtext">Loading from Banana API...</p>
            </div>
        `;
    }

    hideLoadingState() {}

    showErrorState(message) {
        const equationsGrid = document.getElementById('equationsGrid');
        equationsGrid.innerHTML = `
            <div class="error-state">
                <p>${message}</p>
                <button class="retry-btn" id="retryButton">🔄 RETRY</button>
            </div>
        `;
        
        document.getElementById('retryButton').addEventListener('click', () => {
            this.loadNewPuzzle();
        });
    }

    bindEvents() {
        document.getElementById('numberPad').addEventListener('click', (e) => {
            if (e.target.classList.contains('number-btn')) {
                this.selectNumber(parseInt(e.target.textContent));
            }
        });

        document.getElementById('submitAnswer').addEventListener('click', () => {
            this.checkAnswer();
        });

        document.getElementById('hintButton').addEventListener('click', () => {
            this.useHint();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('menuButton').addEventListener('click', () => {
            this.returnToMenu();
        });

        document.getElementById('closeHint').addEventListener('click', () => {
            this.closeHintModal();
        });

        document.getElementById('playAgain').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('nextLevel').addEventListener('click', () => {
            this.goToNextLevel();
        });

        document.getElementById('backToMenu').addEventListener('click', () => {
            window.location.href = "level-select.html";
        });

        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            if (e.key >= '0' && e.key <= '9') {
                this.selectNumber(parseInt(e.key));
            } else if (e.key === 'Enter') {
                this.checkAnswer();
            } else if (e.key === 'Escape') {
                this.returnToMenu();
            } else if (e.key === 'h' || e.key === 'H') {
                this.useHint();
            } else if (e.key === 'r' || e.key === 'R') {
                this.restartGame();
            }
        });
    }

    createNumberPad() {
        const numberPad = document.getElementById('numberPad');
        numberPad.innerHTML = '';
        
        for (let i = 0; i <= 9; i++) {
            const button = document.createElement('button');
            button.className = 'number-btn';
            button.textContent = i;
            button.setAttribute('data-number', i);
            numberPad.appendChild(button);
        }
    }

    selectNumber(number) {
        if (this.isGameOver) return;
        
        this.selectedNumber = number;
        document.getElementById('currentAnswer').textContent = number;
        
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.querySelector(`[data-number="${number}"]`).classList.add('selected');
        
        this.playSound('clickSound');
    }

    async checkAnswer() {
        if (this.isGameOver || this.selectedNumber === null) {
            if (this.selectedNumber === null) {
                this.showTemporaryMessage('Please select a number first!', 'error');
            }
            return;
        }

        if (this.selectedNumber === this.currentPuzzle.solution) {
            this.playSound('correctSound');
            await this.handleCorrectAnswer();
        } else {
            this.playSound('wrongSound');
            this.currentLives--;
            this.updateLivesDisplay();
            
            if (this.currentLives <= 0) {
                this.showTemporaryMessage('❌ Lives used up! Game Over!', 'error');
                setTimeout(() => this.endGame(false, 'lives_lost'), 1500);
            } else {
                this.showTemporaryMessage(`Wrong answer! Lives left: ${this.currentLives}`, 'error');
            }
            
            this.score = Math.max(0, this.score - 10);
            this.updateScoreDisplay();
        }
    }

    async handleCorrectAnswer() {
        const levelBonus = Math.floor(this.currentLevel * 25 * this.scoreMultiplier);
        this.score += levelBonus;
        this.updateScoreDisplay();
        
        if (this.currentLevel < this.totalLevels) {
            this.showTemporaryMessage(`Correct! 🎉 Level ${this.currentLevel} completed! +${levelBonus} points`, 'success');
            this.currentLevel++;
            
            this.timeLeft = this.timePerPuzzle;
            this.updateTimerDisplay();
            
            setTimeout(async () => {
                this.selectedNumber = null;
                document.getElementById('currentAnswer').textContent = '?';
                document.querySelectorAll('.number-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                await this.loadNewPuzzle();
            }, 2000);
        } else {
            this.showTemporaryMessage('Perfect! All puzzles solved! 🎉', 'success');
            setTimeout(() => this.endGame(true, 'completed'), 2000);
        }
    }

    useHint() {
        if (this.isGameOver || this.hints <= 0) return;

        this.hints--;
        this.hintsUsed++;
        this.updateHintDisplay();

        const hints = [
            "Look carefully at the mathematical operations in the puzzle",
            "The banana represents the same number throughout the entire equation",
            "Try working backwards from the result to find the banana's value",
            "Remember basic arithmetic operations: addition, subtraction, multiplication, division",
            "The answer is always a single digit between 0 and 9",
            "Check if the banana appears multiple times in the same equation",
            "Look for patterns in how numbers are arranged",
            "Try substituting different values to see which one works",
            "Pay attention to the order of operations (PEMDAS/BODMAS)",
            "Sometimes the banana value is simpler than you think!",
            "Look at the relationship between the numbers and the result",
            "The banana might be part of a larger mathematical expression"
        ];

        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        document.getElementById('hintMessage').textContent = randomHint;
        this.showHintModal();

        this.playSound('clickSound');
    }

    showHintModal() {
        document.getElementById('hintModal').style.display = 'flex';
    }

    closeHintModal() {
        document.getElementById('hintModal').style.display = 'none';
    }

    startTimer() {
        if (this.timerRunning) return;
        this.timerRunning = true;
        
        this.timer = setInterval(() => {
            if (this.isGameOver) {
                clearInterval(this.timer);
                this.timerRunning = false;
                return;
            }
            
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.timerRunning = false;
                this.handleTimeOut();
            }
        }, 1000);
    }

    handleTimeOut() {
        this.currentLives--;
        this.updateLivesDisplay();
        
        if (this.currentLives <= 0) {
            this.endGame(false, 'lives_lost');
        } else {
            this.showTemporaryMessage(`⏰ Time's up! Lives left: ${this.currentLives}. Next puzzle...`, 'error');
            setTimeout(() => {
                this.currentLevel++;
                if (this.currentLevel <= this.totalLevels) {
                    this.timeLeft = this.timePerPuzzle;
                    this.selectedNumber = null;
                    document.getElementById('currentAnswer').textContent = '?';
                    document.querySelectorAll('.number-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    this.loadNewPuzzle();
                    this.startTimer();
                } else {
                    this.endGame(false, 'lives_lost');
                }
            }, 2000);
        }
    }

    updateTimerDisplay() {
        document.getElementById('timerValue').textContent = this.timeLeft;
        
        const timerElement = document.getElementById('timerValue');
        if (this.timeLeft > 10) {
            timerElement.style.color = '#FFD700';
            timerElement.style.animation = 'none';
        } else {
            timerElement.style.color = '#ff4444';
            timerElement.style.animation = 'pulse 0.5s infinite';
        }
    }

    updateLevelDisplay() {
        const titleElement = document.querySelector('.puzzle-title h2');
        if (titleElement) {
            titleElement.textContent = `FIND THE VALUE OF BANANA 🍌 - LEVEL ${this.currentLevel}`;
        }
    }

    updateHintDisplay() {
        document.getElementById('hintCount').textContent = this.hints;
        
        if (this.hints === 0) {
            document.getElementById('hintButton').disabled = true;
            document.getElementById('hintButton').style.opacity = '0.6';
        }
    }

    updateScoreDisplay() {
        document.getElementById('scoreValue').textContent = this.score;
    }

    async endGame(isWin, reason = 'completed') {
        this.isGameOver = true;
        if (this.timer) clearInterval(this.timer);
        this.timerRunning = false;

        const finalScore = Math.max(0, this.score);
        const passedMinScore = finalScore >= this.minScoreRequired;
        const canProgressToNext = isWin && passedMinScore;
        
        // Save game data to Firebase achievements system
        const gameData = {
            score: finalScore,
            difficulty: this.difficulty,
            level: this.currentLevel,
            hintsUsed: this.hintsUsed,
            timeLeft: this.timeLeft,
            completed: canProgressToNext
        };
        
        try {
            // Save to Firebase achievements and leaderboard
            await achievementManager.saveGameScore(gameData);
        } catch (error) {
            console.error('Error saving game score:', error);
            // Continue with game even if saving fails
        }
        
        // Update results based on outcome
        if (canProgressToNext) {
            this.playSound('winSound');
            
            document.getElementById('resultTitle').textContent = 'ALL PUZZLES SOLVED! 🎉';
            document.getElementById('resultMessage').textContent = 
                `Congratulations! You completed all ${this.totalLevels} ${this.difficulty.toUpperCase()} puzzles!`;
            document.getElementById('levelPassStatus').innerHTML = 
                `<span style="color: #4CAF50; font-size: 1.2em;">✓ LEVEL PASSED - Score: ${finalScore} (Required: ${this.minScoreRequired})</span>`;
            
            // Show next level button if not on hard
            const nextLevelBtn = document.getElementById('nextLevel');
            if (this.difficulty !== 'hard' && nextLevelBtn) {
                nextLevelBtn.style.display = 'inline-block';
            }
            
            this.saveLevelProgression(true);
        } else {
            this.playSound('wrongSound');
            
            if (!passedMinScore && reason === 'completed') {
                document.getElementById('resultTitle').textContent = 'SCORE TOO LOW! ❌';
                document.getElementById('resultMessage').textContent = 
                    `Score: ${finalScore} / Required: ${this.minScoreRequired}. Try again to get ${this.minScoreRequired - finalScore} more points!`;
                document.getElementById('levelPassStatus').innerHTML = 
                    `<span style="color: #f44336; font-size: 1.1em;">✗ FAILED - Score too low</span>`;
            } else {
                document.getElementById('resultTitle').textContent = 'LIVES USED UP! ⏰';
                document.getElementById('resultMessage').textContent = 
                    `You reached level ${this.currentLevel} out of ${this.totalLevels} with a score of ${finalScore}.`;
                document.getElementById('levelPassStatus').innerHTML = 
                    `<span style="color: #FF9800; font-size: 1.1em;">⚠ OUT OF LIVES</span>`;
            }
        }

        document.getElementById('baseScore').textContent = this.score;
        document.getElementById('hintPenalty').textContent = `${this.hintsUsed * 15}`;
        document.getElementById('totalScore').textContent = finalScore;
        
        if (this.currentPuzzle) {
            document.getElementById('bananaValue').textContent = this.currentPuzzle.solution;
        }

        this.updateScoreDisplay();
        
        // Show game over modal
        setTimeout(() => {
            document.getElementById('gameOverModal').style.display = 'flex';
        }, 500);
    }

    saveLevelProgression(passed) {
        let progression = JSON.parse(localStorage.getItem('levelProgression') || '{}');
        if (!progression[this.difficulty]) {
            progression[this.difficulty] = { passed: false, score: 0 };
        }
        if (passed) {
            progression[this.difficulty].passed = true;
            progression[this.difficulty].score = this.score;
        }
        localStorage.setItem('levelProgression', JSON.stringify(progression));
    }

    goToNextLevel() {
        const nextDifficulty = 
            this.difficulty === 'easy' ? 'medium' :
            this.difficulty === 'medium' ? 'hard' : 'easy';
        
        sessionStorage.setItem('gameDifficulty', nextDifficulty);
        window.location.href = "how-to-play.html";
    }

    showTemporaryMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `temp-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 2000;
            border: 3px solid #FFD700;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            font-size: 1.2em;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                document.body.removeChild(messageDiv);
            }
        }, 2000);
    }

    playSound(soundId) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    restartGame() {
        location.reload();
    }

    returnToMenu() {
        if (confirm('Are you sure? Your progress will be lost.')) {
            window.location.href = "level-select.html";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BananaMathPuzzle();
});