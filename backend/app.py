import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Flask, request, jsonify
from flask_cors import CORS
from models.policy_engine import PolicyEngine

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  

policy_engine = PolicyEngine()

@app.route('/')
def index():
    return "Flask backend is running"


if __name__ == '__main__':
    app.run(debug=True,  port=8080) 