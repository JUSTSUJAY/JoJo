# backend/app.py
from flask import Flask, request, jsonify, render_template
from game import TicTacToe
import torch
from models import LinearNetwork
from agents import AlphaZeroAgent
import os
import numpy as np

# Get the absolute path to the parent directory of the current file
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))

# Create the Flask app instance
app = Flask(__name__, template_folder=os.path.join(parent_dir, 'frontend'), static_folder=os.path.join(parent_dir, 'frontend'))

# Define the route to render the index.html template
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/styles.css')
def styles():
    return app.send_static_file('styles.css')

@app.route('/scripts.js')
def script():
    return app.send_static_file('scripts.js')

# Load pre-trained model for Tic-Tac-Toe agent
model = LinearNetwork(input_shape=(9,), action_space=9)
model.load_state_dict(torch.load("./tictactoe/one_dim/out/model.pth"))
agent = AlphaZeroAgent(model)

game = TicTacToe()

# def move(game,cellIndex):
#     if game.get_result() is None: # means there have been less than 5 moves and nobody could win in this situation so just play
#         action = np.argmax(agent.policy_fn(game))
#         game.step(action) # move made
#         return action
#     elif(game.get_result() == 0): # no legal moves left, so it's a draw
#         print("It's a draw")
#     else:
#         print(f"Player {game.get_result() } won")
def is_gameActive(game):
    if game.get_result() is None:
        return True # no result yet, game continues
    return False # games has drawn or somebody won

@app.route("/agent_move", methods=["POST"])
def agent_move():
    data = request.json
    last_human_move = data['cellIndex']
    game.step(last_human_move)
    print(game.state)
    gameActive_after_human_action = is_gameActive(game)
    # if gameActive is True means aftre human made that move, there still open positions on the board and also winner hasn't been decided so agent should make a move
    print("gameActive_after_human_action: ", gameActive_after_human_action)
    if(not gameActive_after_human_action): 
        if(game.get_result() == 1):
            winner = 'You Won!'
        else:
            winner = "It's a Draw!"
        # game drawn or human won
        return jsonify(
                {

                    'gameActive':str(int(gameActive_after_human_action)),
                    'winner':winner
                }
            )
    else:
        action = np.argmax(agent.policy_fn(game))
        print("Action in agent_move: ", action)
        game.step(action)
        gameActive_after_agent_action = is_gameActive(game)
        print('gameActive_after_agent_action: ',gameActive_after_agent_action)
        if(not gameActive_after_agent_action):
            if(game.get_result() == -1):
                winner = 'JoJo Won!'
            else:
                winner = "It's a Draw!"
            return jsonify(
                    {

                        'gameActive':str(int(gameActive_after_agent_action)),
                        'winner':winner,
                        'agent_action':str(action)
                    }
                )
        return jsonify(
                    {
                        'gameActive':str(int(gameActive_after_agent_action)),
                        'agent_action':str(action)
                    }
                )

    


@app.route("/startgame", methods=["POST"])
def startMove():
    data = request.json
    player = data['player']
    if player == -1: # agent's move
        game.turn = -1
        action = np.argmax(agent.policy_fn(game))
        print("It was JoJo's first Move and she played : ", action)
        game.step(action)
        print(game.state)
        return jsonify(
            {
                'agentMove':str(action)
            }
        )
    else:
        return jsonify(
            {
                'agentMove':'-1'
            }
        )

@app.route("/reset", methods=["POST"])
def reset():
    # game = TicTacToe()
    game.reset()
    return jsonify(
            {
                'num_legal_actions':str(len(game.get_legal_actions()))
            }
        )


if __name__ == "__main__":
    app.run(debug=True)