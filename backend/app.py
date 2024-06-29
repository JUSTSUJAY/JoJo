from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from game import TicTacToe
import torch
from models import LinearNetwork
from agents import AlphaZeroAgent
import os
import numpy as np

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes

# Load pre-trained model for Tic-Tac-Toe agent
model = LinearNetwork(input_shape=(9,), action_space=9)
model.load_state_dict(torch.load("./backend/tictactoe/one_dim/out/model.pth"))
agent = AlphaZeroAgent(model)

game = TicTacToe()

def is_gameActive(game):
    return game.get_result() is None

@app.route("/agent_move", methods=["POST"])
def agent_move():
    data = request.json
    last_human_move = data['cellIndex']
    game.step(last_human_move)
    gameActive_after_human_action = is_gameActive(game)
    if not gameActive_after_human_action:
        winner = 'You Won!' if game.get_result() == 1 else "It's a Draw!"
        return jsonify({
            'gameActive': str(int(gameActive_after_human_action)),
            'winner': winner
        })
    else:
        action = np.argmax(agent.policy_fn(game))
        game.step(action)
        gameActive_after_agent_action = is_gameActive(game)
        if not gameActive_after_agent_action:
            winner = 'JoJo Won!' if game.get_result() == -1 else "It's a Draw!"
            return jsonify({
                'gameActive': str(int(gameActive_after_agent_action)),
                'winner': winner,
                'agent_action': str(action)
            })
        return jsonify({
            'gameActive': str(int(gameActive_after_agent_action)),
            'agent_action': str(action)
        })

@app.route("/startgame", methods=["POST"])
def startMove():
    data = request.json
    player = data['player']
    if player == -1:
        game.turn = -1
        action = np.argmax(agent.policy_fn(game))
        game.step(action)
        return jsonify({'agentMove': str(action)})
    else:
        return jsonify({'agentMove': '-1'})

@app.route("/reset", methods=["POST"])
def reset():
    game.reset()
    return jsonify({'num_legal_actions': str(len(game.get_legal_actions()))})

if __name__ == "__main__":
    app.run(debug=True)