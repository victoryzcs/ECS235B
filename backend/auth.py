from flask import Blueprint, request, jsonify
import jwt
import datetime
from datetime import timezone
import os
import sys
from functools import wraps

sys_path_appended = False
if not sys_path_appended and os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) not in sys.path:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    sys_path_appended = True

from models.user import User

auth = Blueprint('auth', __name__, url_prefix='/api/auth')

SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')

# Decorator for routes that require login
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"message": "Bearer token malformed"}), 401

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token is invalid!"}), 401
        except Exception as e:
            return jsonify({"message": f"Token validation error: {str(e)}"}), 401
        
        return f(*args, **kwargs)
    return decorated_function


def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if auth_header:
        try:
            token = auth_header.split(" ")[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"], options={"verify_exp": False})
            return data.get('user_id')
        except Exception as e:
            print(f"Error decoding token in get_current_user_id: {e}")
            return None
    return None

def ensure_admin_exists():
    from backend.app import policy_engine
    admin_user_id = 'admin'
    admin_user = User.get_by_id(admin_user_id)
    if not admin_user:
        admin_name = 'Administrator'
        admin_password_plain = 'admin123'
        
        try:
            admin_user_obj = policy_engine.add_user(user_id=admin_user_id, name=admin_name, password_str=admin_password_plain)
            policy_engine.assign_role_to_user(user_id=admin_user_obj.id, role_id='admin')
            print(f"Default admin user '{admin_user_id}' created with password '{admin_password_plain}' and assigned admin role.")
        except Exception as e:
            print(f"Error creating default admin user '{admin_user_id}': {str(e)}")

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
    
    if user.check_password(password):
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
        'exp': datetime.datetime.now(timezone.utc) + datetime.timedelta(days=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

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
