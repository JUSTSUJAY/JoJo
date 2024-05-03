// Initialize game state
let gameState = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // Represents empty board
let currentPlayer = 1; // Player 1 starts the game
let gameActive = true;
let darkTheme = true; // Default to dark theme

// Function to handle player moves
function handleMove(cellIndex) {
    console.log(`Cell ${cellIndex} clicked`);
    // Check if cell is empty and game is active
    if (gameState[cellIndex] === 0 && gameActive) {
        // Update cell with current player's mark
        gameState[cellIndex] = currentPlayer;

        // Update UI with player's mark
        document.getElementById(`cell${cellIndex}`).innerText = currentPlayer === 1 ? 'X' : 'O';

        // Check for winner or draw
        if (checkWin() || checkDraw()) {
            gameActive = false;
            if (checkWin()) {
                // Highlight winning cells
                const winCells = getWinningCells();
                winCells.forEach(cell => {
                    document.getElementById(`cell${cell}`).style.backgroundColor = 'lightgreen';
                });
                document.getElementById('game-status').innerText = `Player ${currentPlayer} wins!`;
            } else {
                document.getElementById('game-status').innerText = 'It\'s a draw!';
            }
        } else {
            // Switch players
            currentPlayer = currentPlayer === 1 ? -1 : 1;
            document.getElementById('game-status').innerText = `Player ${currentPlayer}'s turn`;
        }
    }
}

// Function to check for a win
function checkWin() {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return true;
        }
    }

    return false;
}

// Function to get the winning cells
function getWinningCells() {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return condition;
        }
    }

    return [];
}

// Function to check for a draw
function checkDraw() {
    return !gameState.includes(0);
}

// Function to reset the game
function resetGame() {
    // Reset game state
    gameState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    currentPlayer = 1;
    gameActive = true;

    // Reset UI
    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerText = '';
        cell.style.backgroundColor = 'transparent';
    });
    document.getElementById('game-status').innerText = `Player ${currentPlayer}'s turn`;
}

// Function to toggle theme
function toggleTheme() {
    darkTheme = !darkTheme;
    const body = document.querySelector('body');
    const buttons = document.querySelectorAll('button');
    const cells = document.querySelectorAll('.cell');
    
    if (darkTheme) {
        body.style.backgroundColor = 'black';
        body.style.color = 'white';
        buttons.forEach(button => {
            button.style.backgroundColor = '#007bff';
            button.style.color = 'white';
        });
        cells.forEach(cell => {
            cell.style.borderColor = 'white';
        });
    } else {
        body.style.backgroundColor = 'white';
        body.style.color = 'black';
        buttons.forEach(button => {
            button.style.backgroundColor = 'lightgray';
            button.style.color = 'black';
        });
        cells.forEach(cell => {
            cell.style.borderColor = 'black';
        });
    }
    console.log('Theme toggled');
}
