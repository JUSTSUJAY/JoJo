from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from game import TicTacToe
import torch
from models import LinearNetwork
from agents import AlphaZeroAgent
import os
import numpy as np
from uuid import uuid4

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "docs"))
MODEL_PATH = os.path.join(BASE_DIR, "tictactoe", "one_dim", "out", "model.pth")

app = Flask(__name__, static_folder=DOCS_DIR, static_url_path="")
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
CORS(app)  # This enables CORS for all routes

@app.route("/")
def index():
    return send_from_directory(DOCS_DIR, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(DOCS_DIR, path)
    
# Load pre-trained model for Tic-Tac-Toe agent
model = LinearNetwork(input_shape=(9,), action_space=9)
model.load_state_dict(torch.load(MODEL_PATH, map_location=model.device))
agent = AlphaZeroAgent(model)

games = {}

def get_game():
    game_id = session.get("game_id")
    if not game_id or game_id not in games:
        game_id = str(uuid4())
        session["game_id"] = game_id
        games[game_id] = TicTacToe()
    return games[game_id]

def is_gameActive(game):
    return game.get_result() is None

# @app.route("/agent_move", methods=["POST"])
# def agent_move():
#     data = request.json
#     last_human_move = data['cellIndex']
#     game.step(last_human_move)
#     gameActive_after_human_action = is_gameActive(game)
#     if not gameActive_after_human_action:
#         winner = 'You Won!' if game.get_result() == 1 else "It's a Draw!"
#         return jsonify({
#             'gameActive': str(int(gameActive_after_human_action)),
#             'winner': winner
#         })
#     else:
#         action = np.argmax(agent.policy_fn(game))
#         game.step(action)
#         gameActive_after_agent_action = is_gameActive(game)
#         if not gameActive_after_agent_action:
#             winner = 'JoJo Won!' if game.get_result() == -1 else "It's a Draw!"
#             return jsonify({
#                 'gameActive': str(int(gameActive_after_agent_action)),
#                 'winner': winner,
#                 'agent_action': str(action)
#             })
#         return jsonify({
#             'gameActive': str(int(gameActive_after_agent_action)),
#             'agent_action': str(action)
#         })

@app.route("/agent_move", methods=["POST"])
def agent_move():
    game = get_game()
    data = request.json
    last_human_move = data['cellIndex']

    # Check if the move is legal
    if last_human_move not in game.get_legal_actions():
        return jsonify({
            'error': 'Illegal move',
            'message': f'Cell {last_human_move} is already occupied.'
        }), 400

    # Process the human move
    game.step(last_human_move)
    gameActive_after_human_action = is_gameActive(game)
    if not gameActive_after_human_action:
        winner = 'You Won!' if game.get_result() == 1 else "It's a Draw!"
        return jsonify({
            'gameActive': str(int(gameActive_after_human_action)),
            'winner': winner
        })
    else:
        # Process the agent's move
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
    game = get_game()
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
    game = get_game()
    game.reset()
    return jsonify({'num_legal_actions': str(len(game.get_legal_actions()))})

if __name__ == "__main__":
    app.run(debug=True)