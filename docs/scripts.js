var player;
var gameActive = 1;
let darkTheme = true;
let gameStarted = false;

const BACKEND_URL = window.location.origin;
const WINNING_COMBINATIONS = [
    { cells: [0, 1, 2], lineClass: 'row-0' },
    { cells: [3, 4, 5], lineClass: 'row-1' },
    { cells: [6, 7, 8], lineClass: 'row-2' },
    { cells: [0, 3, 6], lineClass: 'col-0' },
    { cells: [1, 4, 7], lineClass: 'col-1' },
    { cells: [2, 5, 8], lineClass: 'col-2' },
    { cells: [0, 4, 8], lineClass: 'diag-main' },
    { cells: [2, 4, 6], lineClass: 'diag-anti' },
];

async function startGame() {
    await resetGame();
    gameStarted = true;
    const randomNumber = Math.random();
    player = randomNumber >= 0.5 ? 1 : -1;
    console.log(`Player: ${player}`);
    if (player === 1) {
        document.getElementById('game-status').innerText = "Your Turn...";
    }
    if (player === -1) {
        document.getElementById('game-status').innerText = "JoJo's Turn";
    }
    const turn = await fetch(`${BACKEND_URL}/startgame`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player: player })
    });

    const data = await turn.json();
    if (data.agentMove !== '-1') {
        updateBoard(-1, data.agentMove);
        setTimeout(function () {
            document.getElementById('game-status').innerText = "Make a move";
        }, 1000);
    }
    else {
        setTimeout(function () {
            document.getElementById('game-status').innerText = "Make a move";
        }, 1000);
    }
}

// async function handleMove(cellIndex) {
//     if (!gameStarted) {
//         document.getElementById('game-status').innerText = "Press Start to begin!";
//     }
//     else {
//         if (gameActive) {
//             updateBoard(1, cellIndex);
//             const response = await fetch(`${BACKEND_URL}/agent_move`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ cellIndex })
//             });
//             const data = await response.json();
//             console.log(`gameActive':${data.gameActive}`);
//             if (parseInt(data.gameActive) === 1) {
//                 updateBoard(-1, parseInt(data.agent_action));
//             }
//             else {
//                 if (data.winner === 'JoJo Won!') {
//                     updateBoard(-1, parseInt(data.agent_action));
//                     document.getElementById('game-status').innerText = data.winner;
//                 }
//                 else {
//                     document.getElementById('game-status').innerText = data.winner;
//                 }
//             }
//         }
//     }
// }

async function handleMove(cellIndex) {
    if (!gameStarted) {
        document.getElementById('game-status').innerText = "Press Start to begin!";
        return;
    }

    if (gameActive) {
        const cell = document.getElementById(`cell${cellIndex}`);

        // Prevent clicking on an already occupied cell
        if (cell.innerText !== '') {
            document.getElementById('game-status').innerText = "Being Smart, huh?";
            return;
        }

        updateBoard(1, cellIndex);

        try {
            const response = await fetch(`${BACKEND_URL}/agent_move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cellIndex })
            });

            if (!response.ok) {
                const errorData = await response.json();
                document.getElementById('game-status').innerText = errorData.message;
                // Revert the board state
                updateBoard('', cellIndex);
                return;
            }

            const data = await response.json();

            if (parseInt(data.gameActive) === 1) {
                updateBoard(-1, parseInt(data.agent_action));
            } else {
                gameActive = 0;
                if (data.winner === 'JoJo Won!') {
                    updateBoard(-1, parseInt(data.agent_action));
                }
                document.getElementById('game-status').innerText = data.winner;
                showGameResult(data.winner);
            }
        } catch (error) {
            console.error('Error during move:', error);
            document.getElementById('game-status').innerText = "An error occurred. Try again.";
        }
    }
}


function updateBoard(player, index) {
    const cell = document.getElementById(`cell${index}`);
    cell.classList.remove('x-mark', 'o-mark');

    if (player === '') {
        cell.innerText = '';
        return;
    }

    cell.innerText = player === 1 ? 'X' : 'O';
    cell.classList.add(player === 1 ? 'x-mark' : 'o-mark');
}

async function resetGame() {
    gameActive = 1;
    const response = await fetch(`${BACKEND_URL}/reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();
    if (data.num_legal_actions == '9') {
        document.getElementById('game-status').innerText = 'Reset Successful!';
    }

    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x-mark', 'o-mark', 'winner');
        cell.style.backgroundColor = '';
        cell.style.color = '';
    });
    clearWinningLine();
    closeResultModal();

    console.log("Reset");
}


function toggleTheme() {
    darkTheme = !darkTheme;
    document.body.classList.toggle('light-theme', !darkTheme);
}

function getWinningCombination() {
    const values = Array.from(document.querySelectorAll('.cell')).map(cell => cell.innerText);
    return WINNING_COMBINATIONS.find(({ cells }) => {
        const [a, b, c] = cells;
        return values[a] && values[a] === values[b] && values[a] === values[c];
    });
}

function showWinningLine(winningCombination) {
    if (!winningCombination) return;
    const board = document.getElementById('game-board');
    const line = document.getElementById('win-line');
    line.className = winningCombination.lineClass;
    board.classList.add('has-win');
    highlightWinningCells(winningCombination.cells);
}

function clearWinningLine() {
    const board = document.getElementById('game-board');
    const line = document.getElementById('win-line');
    board.classList.remove('has-win');
    line.className = '';
}

function showGameResult(winner) {
    const winningCombination = getWinningCombination();
    showWinningLine(winningCombination);

    const title = document.getElementById('result-title');
    if (winner === 'You Won!') {
        title.innerText = 'X won';
    } else if (winner === 'JoJo Won!') {
        title.innerText = 'O won';
    } else {
        title.innerText = "It's a draw";
    }

    setTimeout(() => {
        document.getElementById('result-modal').classList.add('show');
        document.getElementById('result-modal').setAttribute('aria-hidden', 'false');
    }, winningCombination ? 650 : 120);
}

function closeResultModal() {
    const modal = document.getElementById('result-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
}

// Add winning animation
function highlightWinningCells(winningCombination) {
    winningCombination.forEach(index => {
        const cell = document.getElementById(`cell${index}`);
        cell.classList.add('winner');
    });
}
