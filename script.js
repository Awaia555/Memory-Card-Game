// Game configuration
const config = {
    easy: { pairs: 6, timeLimit: 60 },
    medium: { pairs: 8, timeLimit: 90 },
    hard: { pairs: 12, timeLimit: 120 }
};

// Game state
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    playerName: '',
    difficulty: 'easy',
    isPlaying: false
};

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const scoreScreen = document.getElementById('score-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');
const playerNameInput = document.getElementById('player-name');
const startGameBtn = document.getElementById('start-game');
const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const finalTimeDisplay = document.getElementById('final-time');
const finalMovesDisplay = document.getElementById('final-moves');
const playAgainBtn = document.getElementById('play-again');
const viewLeaderboardBtn = document.getElementById('view-leaderboard');
const backToGameBtn = document.getElementById('back-to-game');
const leaderboardList = document.getElementById('leaderboard-list');

// Event Listeners
startGameBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', resetGame);
viewLeaderboardBtn.addEventListener('click', showLeaderboard);
backToGameBtn.addEventListener('click', () => {
    leaderboardScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
});

document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        gameState.difficulty = btn.dataset.level;
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

// Initialize game
function initGame() {
    const { pairs } = config[gameState.difficulty];
    const emojis = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎫', '🎬', '🎵', '🎹', '🎸', '🎺'];
    const selectedEmojis = emojis.slice(0, pairs);
    gameState.cards = [...selectedEmojis, ...selectedEmojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
            id: index,
            emoji: emoji,
            isFlipped: false,
            isMatched: false
        }));
}

// Create card elements
function createCards() {
    gameBoard.innerHTML = '';
    gameState.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = card.emoji;
        
        cardElement.appendChild(cardFront);
        cardElement.appendChild(cardBack);
        
        cardElement.addEventListener('click', () => flipCard(card.id));
        gameBoard.appendChild(cardElement);
    });
}

// Flip card
function flipCard(cardId) {
    if (!gameState.isPlaying) return;
    if (gameState.flippedCards.length >= 2) return;
    
    const card = gameState.cards.find(c => c.id === cardId);
    if (card.isFlipped || card.isMatched) return;
    
    card.isFlipped = true;
    gameState.flippedCards.push(card);
    
    const cardElement = document.querySelector(`[data-id="${cardId}"]`);
    cardElement.classList.add('flipped');
    
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        movesDisplay.textContent = gameState.moves;
        checkMatch();
    }
}

// Check for match
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    
    if (card1.emoji === card2.emoji) {
        card1.isMatched = card2.isMatched = true;
        gameState.matchedPairs++;
        
        // Add celebration animation
        const cardElements = document.querySelectorAll(`[data-id="${card1.id}"], [data-id="${card2.id}"]`);
        cardElements.forEach(card => card.classList.add('celebration'));
        
        if (gameState.matchedPairs === config[gameState.difficulty].pairs) {
            endGame();
        }
    } else {
        setTimeout(() => {
            card1.isFlipped = card2.isFlipped = false;
            const cardElements = document.querySelectorAll(`[data-id="${card1.id}"], [data-id="${card2.id}"]`);
            cardElements.forEach(card => card.classList.remove('flipped'));
        }, 1000);
    }
    
    gameState.flippedCards = [];
}

// Start game
function startGame() {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name to start the game!');
        return;
    }
    
    gameState.playerName = playerName;
    gameState.isPlaying = true;
    gameState.moves = 0;
    gameState.matchedPairs = 0;
    gameState.timer = 0;
    
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    scoreScreen.classList.add('hidden');
    
    initGame();
    createCards();
    startTimer();
}

// Start timer
function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        timerDisplay.textContent = gameState.timer;
        
        if (gameState.timer >= config[gameState.difficulty].timeLimit) {
            endGame();
        }
    }, 1000);
}

// End game
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerInterval);
    
    finalTimeDisplay.textContent = gameState.timer;
    finalMovesDisplay.textContent = gameState.moves;
    
    // Save score to leaderboard
    saveScore();
    
    gameScreen.classList.add('hidden');
    scoreScreen.classList.remove('hidden');
}

// Save score
function saveScore() {
    const scores = JSON.parse(localStorage.getItem('memoryGameScores') || '[]');
    scores.push({
        name: gameState.playerName,
        time: gameState.timer,
        moves: gameState.moves,
        difficulty: gameState.difficulty,
        date: new Date().toISOString()
    });
    
    // Sort by time and keep only top 10 scores
    scores.sort((a, b) => a.time - b.time);
    const topScores = scores.slice(0, 10);
    
    localStorage.setItem('memoryGameScores', JSON.stringify(topScores));
}

// Show leaderboard
function showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('memoryGameScores') || '[]');
    leaderboardList.innerHTML = '';
    
    scores.forEach((score, index) => {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'leaderboard-item';
        scoreElement.innerHTML = `
            <strong>${index + 1}.</strong> ${score.name} - 
            Time: ${score.time}s, Moves: ${score.moves} 
            (${score.difficulty})
        `;
        leaderboardList.appendChild(scoreElement);
    });
    
    scoreScreen.classList.add('hidden');
    leaderboardScreen.classList.remove('hidden');
}

// Reset game
function resetGame() {
    scoreScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    playerNameInput.value = '';
} 