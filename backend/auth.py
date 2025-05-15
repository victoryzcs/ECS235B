from flask import Blueprint, request, jsonify
import jwt
import datetime
import os
import sys

sys_path_appended = False # To prevent adding path multiple times in some environments
if not sys_path_appended and os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) not in sys.path:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    sys_path_appended = True

from models.user import User

auth = Blueprint('auth', __name__, url_prefix='/api/auth')

def ensure_admin_exists():
    # Deferred import of policy_engine to break cycle
    from backend.app import policy_engine
    admin_user_id = 'admin'
    admin_user = User.get_by_id(admin_user_id)
    if not admin_user:
        admin_name = 'Administrator'
        admin_password_plain = 'admin123'
        
        try:
            # PolicyEngine's add_user will use hash_password_util internally via User model
            admin_user_obj = policy_engine.add_user(user_id=admin_user_id, name=admin_name, password_str=admin_password_plain)
            # User object itself doesn't handle role assignment; PolicyEngine does.
            policy_engine.assign_role_to_user(user_id=admin_user_obj.id, role_id='admin')
            print(f"Default admin user '{admin_user_id}' created with password '{admin_password_plain}' and assigned admin role.")
        except Exception as e:
            print(f"Error creating default admin user '{admin_user_id}': {str(e)}")

# ensure_admin_exists() is called in app.py during initialization

@auth.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Auth service is running"})

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = User.get_by_id(username)
    
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    if user.check_password(password): # Use the User model's method
        token = generate_token(user)
        user_roles = user.roles if user.roles else ['worker']
        primary_role = user_roles[0].lower()
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'role': primary_role
            }
        })
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

def generate_token(user: User) -> str:
    user_roles = user.roles if user.roles else ['worker']
    primary_role = user_roles[0].lower()
    payload = {
        'user_id': user.id,
        'role': primary_role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    return jwt.encode(payload, 'your-secret-key', algorithm='HS256')

@auth.route('/register', methods=['POST'])
def register():
    # Deferred import of policy_engine to break cycle
    from backend.app import policy_engine
    data = request.get_json()
    username = data.get('username')
    plain_password = data.get('password')
    name = data.get('name')
    role_id = data.get('role', 'worker').lower()
    
    if not all([username, plain_password, name]):
        return jsonify({'message': 'Username, password, and name are required'}), 400
    
    if role_id not in ['worker', 'manager', 'admin']:
        return jsonify({'message': 'Invalid role specified. Must be worker, manager, or admin.'}), 400
    
    existing_user = User.get_by_id(username)
    if existing_user:
        return jsonify({'message': 'User already exists'}), 400

    try:
        new_user_obj = policy_engine.add_user(user_id=username, name=name, password_str=plain_password)
        policy_engine.assign_role_to_user(user_id=new_user_obj.id, role_id=role_id)
        return jsonify({'message': 'User registered successfully', 'user': new_user_obj.to_dict()}), 201
    except Exception as e:
        print(f"Error during user registration for '{username}': {str(e)}")
        return jsonify({'message': f"Failed to register user: {str(e)}"}), 500
