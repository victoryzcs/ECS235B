from types import resolve_bases
from flask import Flask, Blueprint, request, jsonify
from pymongo import MongoClient
import jwt
import datetime
import bcrypt  
import os
import sys


client = MongoClient('mongodb://localhost:27017/')
db = client['security_policy_db']
users_collection = db['users']

auth = Blueprint('auth', __name__, url_prefix='/api/auth')

def hash_password(password):
    if isinstance(password, str):
        password = password.encode('utf-8')
    return bcrypt.hashpw(password, bcrypt.gensalt())

def ensure_admin_exists():
    admin = users_collection.find_one({'roles': ['admin']})
    if not admin:
        admin_password = hash_password('admin123')
        admin_user = {
            'id': 'admin',
            'password': admin_password,
            'name': 'Administrator',
            'roles': ['admin'],
            'access_history': []
        }
        users_collection.insert_one(admin_user)
        print("Default admin user created with username: 'admin' and password: 'admin123'")

ensure_admin_exists()

@auth.route('/', methods=['GET'])
def index():
    return "Auth is running"

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = users_collection.find_one({'id': username})
    
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    if user.get('password') == password:
        token = generate_token(user)
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'role': user.get('roles', ['worker'])[0].lower() if user.get('roles') else 'worker'
            }
        })
    
    try:
        stored_password = user.get('password', '')
        
        if isinstance(password, str):
            password = password.encode('utf-8')
        
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')
        
        if bcrypt.checkpw(password, stored_password):
            token = generate_token(user)
            
            return jsonify({
                'token': token,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'role': user.get('roles', ['worker'])[0] if user.get('roles') else 'worker'
                }
            })
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except ValueError as e:
        print(f"Password verification error: {str(e)}")
        return jsonify({'message': 'Authentication error. Please contact administrator.'}), 500

def generate_token(user):
    payload = {
        'user_id': user['id'],
        'role': user.get('roles', ['worker'])[0] if user.get('roles') else 'worker',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    return jwt.encode(payload, 'your-secret-key', algorithm='HS256')



@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'worker').lower()
    
    if role not in ['worker', 'manager', 'admin']:
        return jsonify({'message': 'Invalid role specified'}), 400
    
    if users_collection.find_one({'id': username}):
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = hash_password(password)
    
    new_user = {
        'id': username,
        'password': hashed_password,
        'name': name,
        'roles': [role],
        'access_history': []
    }
    
    users_collection.insert_one(new_user)
    
    try:
        # sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from backend.app import PolicyEngine   
        policy_engine = PolicyEngine()

        policy_engine.add_user(username, name)
        
        if role != 'worker':
            policy_engine.assign_role(username, role)
    except ImportError:
        print("Warning: Could not import policy engine. User added to database but not to policy engine.")
    except Exception as e:
        print(f"Warning: Could not add user to policy engine: {str(e)}")

    return jsonify({'message': 'User registered successfully'}), 201
