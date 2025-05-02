from flask import Flask, Blueprint, request, jsonify

auth = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth.route('/', methods=['GET'])
def index():
    return "Auth is running"