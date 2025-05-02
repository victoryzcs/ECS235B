from crypt import methods
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
from models.policy_engine import PolicyEngine
from models.user import User
from models.object import Object
from models.role import Role
from models.dataset import Dataset
from models.conflict_class import ConflictClass
from backend.auth import auth

app = Flask(__name__)
general = Blueprint('app', __name__)
app.register_blueprint(general)
app.register_blueprint(auth)
CORS(app, resources={r"/*": {"origins": "*"}})  

policy_engine = PolicyEngine()

@app.route('/')
def index():
    return "Flask backend is running"

@app.route('/api/users', methods=['GET'])
def get_users():
    users = policy_engine.get_users()
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.json
    try:
        user = User(id=data.get('id'), name=data.get('name'))
        policy_engine.add_user(user)
        return jsonify({"message": f"User {user.id} added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/objects', methods=['GET'])
def get_objects():
    objects_dict = {obj_id: obj.__dict__ for obj_id, obj in policy_engine.objects.items()}
    return jsonify(objects_dict)

@app.route('/api/objects', methods=['POST'])
def add_object():
    data = request.json
    try:
        obj = Object(
            id=data.get('id'), 
            name=data.get('name'), 
            dataset=data.get('dataset'), 
            conflict_class=data.get('conflict_class', '')
        )
        policy_engine.add_object(obj)
        return jsonify({"message": f"Object {obj.id} added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/roles', methods=['POST'])
def add_role():
    data = request.json
    try:
        role = Role(id=data.get('id'), name=data.get('name'))
        policy_engine.add_role(role)
        return jsonify({"message": f"Role {role.id} added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/roles', methods=['GET'])
def get_roles():
    roles_dict = {role_id: role.__dict__ for role_id, role in policy_engine.roles.items()}
    return jsonify(roles_dict)

@app.route('/api/datasets', methods=['GET'])
def get_datasets():
    datasets_dict = {dataset_id: dataset.__dict__ for dataset_id, dataset in policy_engine.datasets.items()}
    return jsonify(datasets_dict)

@app.route('/api/datasets', methods=['POST'])
def add_dataset():
    data = request.json
    try:
        dataset = Dataset(id=data.get('id'), name=data.get('name'))
        policy_engine.add_dataset(dataset)
        return jsonify({"message": f"Dataset {dataset.id} added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/conflict_classes', methods=['GET'])
def get_conflict_classes():
    cc_dict = {cc_id: cc.__dict__ for cc_id, cc in policy_engine.conflict_classes.items()}
    return jsonify(cc_dict)

@app.route('/api/conflict_classes', methods=['POST'])
def add_conflict_class():
    data = request.json
    try:
        cc = ConflictClass(
            class_id=data.get('class_id'), 
            name=data.get('name'), 
            datasets=data.get('datasets', [])
        )
        policy_engine.add_conflict_class(cc)
        return jsonify({"message": f"Conflict class {cc.class_id} added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/assign_role', methods=['POST'])
def assign_role():
    data = request.json
    user_id = data.get('user_id')
    role_id = data.get('role_id')


    try:
        policy_engine.assign_role_to_user(user_id, role_id)
        return jsonify({"message": f"Role {role_id} assigned to user {user_id}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/add_permission_to_role', methods=['POST'])
def add_permission_to_role():
    data = request.json
    role_id = data.get('role_id')
    object_id = data.get('object_id')
    action = data.get('action')
    
    try:
        policy_engine.add_permission_to_role(role_id, object_id, action)
        return jsonify({"message": f"Permission {action} on {object_id} added to role {role_id}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/grant_direct_permission', methods=['POST'])
def grant_direct_permission():
    data = request.json
    user_id = data.get('user_id')
    object_id = data.get('object_id')
    action = data.get('action')
    
    try:
        policy_engine.grant_direct_permission(user_id, object_id, action)
        return jsonify({"message": f"Direct permission {action} on {object_id} granted to user {user_id}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/check_access', methods=['POST'])
def check_access():
    data = request.json
    user_id = data.get('user_id')
    object_id = data.get('object_id')
    action = data.get('action')
    
    if not all([user_id, object_id, action]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    try:
        allowed, reason = policy_engine.check_access(user_id, object_id, action)
        return jsonify({
            "allowed": allowed,
            "reason": reason
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/grant_access', methods=['POST'])
def grant_access():
    data = request.json
    user_id = data.get('user_id')
    object_id = data.get('object_id')
    action = data.get('action')
    
    if not all([user_id, object_id, action]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    try:
        granted, message = policy_engine.grant_access(user_id, object_id, action)
        return jsonify({
            "granted": granted,
            "message": message
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/user_permissions/<user_id>', methods=['GET'])
def user_permissions(user_id):
    try:
        permissions = policy_engine.user_check_permissions(user_id)
        return jsonify(permissions)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True,  port=8080) 