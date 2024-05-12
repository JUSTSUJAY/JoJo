var player;
var gameActive = 1;
let darkTheme = true;
async function startGame() {
    // Generate a random number between 0 and 1
    const randomNumber = Math.random();
    player = randomNumber >= 0.5 ? 1 : -1;
    console.log(`Player: ${player}`)
    if(player===1){
        document.getElementById('game-status').innerText = "Your Turn...";
    }
    if(player===-1){
        document.getElementById('game-status').innerText = "JoJo's Turn";
    }
    const turn = await fetch('/startgame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player: player })
    })

    const data = await turn.json();
    if(data.agentMove !== '-1'){ // if it is not -1 then we have received the agent's action and we will need to update the board with it
        updateBoard(-1,data.agentMove)
        setTimeout(function() {
            document.getElementById('game-status').innerText = "Make a move";
        }, 1000); // 1000 milliseconds = 1 second
    }
    else{
        setTimeout(function() {
            document.getElementById('game-status').innerText = "Make a move";
        }, 1000); // 1000 milliseconds = 1 second
    }
}


async function handleMove(cellIndex) {
    if(gameActive)
    {
        updateBoard(1,cellIndex)
        const response = await fetch('/agent_move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cellIndex })
      });
      const data = await response.json();
      console.log(`gameActive':${data.gameActive}`)
      if(parseInt(data.gameActive) === 1){ // game has either drawn or somebody won
        updateBoard(-1,parseInt(data.agent_action))
      }
      else{
        if(data.winner === 'JoJo Won!'){
            updateBoard(-1,parseInt(data.agent_action));document.getElementById('game-status').innerText = data.winner;
        }
        else{
            document.getElementById('game-status').innerText = data.winner;
        }
      }


    }
}

function updateBoard(player, index) {
    var pos = document.getElementById(`cell${index}`).innerText = player === 1 ? 'X' : 'O';
    player = player*-1
}


async function resetGame() {

    gameActive = 1;
    const response = await fetch('/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    const data = await response.json();
    if(data.num_legal_actions == '9'){
        document.getElementById('game-status').innerText = 'Reset Successful';
    }
  
    // Reset UI
    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerText = '';
        cell.style.backgroundColor = 'transparent';
    });
    
    console.log("Reset")
} 

function toggleTheme() {
    darkTheme = !darkTheme;
    const body = document.querySelector('body');
    const buttons = document.querySelectorAll('button');
    const cells = document.querySelectorAll('.cell');
    
    if (darkTheme) {
        body.style.backgroundColor = 'black';
        body.style.color = 'white';
        buttons.forEach(button => {
            button.style.backgroundColor = 'rgb(69,79,89)';
            button.style.color = 'white';
        });
        cells.forEach(cell => {
            cell.style.borderColor = 'white';
        });
    } else {
        body.style.backgroundColor = '#f6e0b5';
        body.style.color = 'black';
        buttons.forEach(button => {
            button.style.backgroundColor = '#a39193';
            button.style.color = 'black';
        });
        cells.forEach(cell => {
            cell.style.borderColor = 'black';
        });
    }
    console.log('Theme toggled');
}