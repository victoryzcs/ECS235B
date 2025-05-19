import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
from models.policy_engine import PolicyEngine
from models.object import Object as PolicyObject
from models.role import Role
from backend.auth import auth, ensure_admin_exists, login_required, get_current_user_id

app = Flask(__name__)

policy_engine = PolicyEngine()

general_api = Blueprint('general_api', __name__, url_prefix='/api')

@general_api.route('/users', methods=['GET'])
def get_users():
    users = policy_engine.get_users()
    return jsonify(users)

@general_api.route('/users', methods=['POST'])
def add_user_route():
    data = request.json
    try:
        user = policy_engine.add_user(
            user_id=data.get('id'),
            name=data.get('name'),
            password_str=data.get('password')
        )
        return jsonify({"message": f"User {user.id} added successfully", "user": user.to_dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/users/<user_id>', methods=['PUT'])
def update_user_route(user_id: str):
    data = request.json
    try:
        updated_user = policy_engine.update_user(
            user_id=user_id,
            name=data.get('name'),
            password_str=data.get('password') # Optional: allow password update
        )
        if updated_user:
            return jsonify({"message": f"User {user_id} updated successfully", "user": updated_user.to_dict()}), 200
        return jsonify({"error": f"User {user_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/users/<user_id>', methods=['DELETE'])
def delete_user_route(user_id: str):
    try:
        if policy_engine.delete_user(user_id):
            return jsonify({"message": f"User {user_id} deleted successfully"}), 200
        return jsonify({"error": f"User {user_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/objects', methods=['GET'])
def get_objects():
    objects_data = policy_engine.get_objects()
    return jsonify(objects_data)

@general_api.route('/objects', methods=['POST'])
def add_object_route():
    data = request.json
    try:
        obj = policy_engine.add_object(
            obj_id=data.get('id'),
            name=data.get('name'),
            dataset_id=data.get('dataset')
        )
        return jsonify({"message": f"Object {obj.id} added successfully", "object": obj.to_dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/objects/<object_id>', methods=['PUT'])
def update_object_route(object_id: str):
    data = request.json
    try:
        updated_obj = policy_engine.update_object(
            obj_id=object_id,
            name=data.get('name'),
            dataset_id=data.get('dataset')
        )
        if updated_obj:
            return jsonify({"message": f"Object {object_id} updated successfully", "object": updated_obj.to_dict()}), 200
        return jsonify({"error": f"Object {object_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/objects/<object_id>', methods=['DELETE'])
def delete_object_route(object_id: str):
    try:
        if policy_engine.delete_object(object_id):
            return jsonify({"message": f"Object {object_id} deleted successfully"}), 200
        return jsonify({"error": f"Object {object_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/roles', methods=['GET'])
def get_roles():
    roles_data = policy_engine.get_roles()
    return jsonify(roles_data)

@general_api.route('/roles', methods=['POST'])
def add_role_route():
    data = request.json
    try:
        role = policy_engine.add_role(role_id=data.get('id'), name=data.get('name'))
        return jsonify({"message": f"Role {role.id} added successfully", "role": role.to_dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/roles/<role_id>', methods=['PUT'])
def update_role_route(role_id: str):
    data = request.json
    try:
        updated_role = policy_engine.update_role(
            role_id=role_id,
            name=data.get('name')
            # Permissions for roles are managed by a separate endpoint
        )
        if updated_role:
            return jsonify({"message": f"Role {role_id} updated successfully", "role": updated_role.to_dict()}), 200
        return jsonify({"error": f"Role {role_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/roles/<role_id>', methods=['DELETE'])
def delete_role_route(role_id: str):
    try:
        if policy_engine.delete_role(role_id):
            return jsonify({"message": f"Role {role_id} deleted successfully"}), 200
        return jsonify({"error": f"Role {role_id} not found or cannot be deleted."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/datasets', methods=['GET'])
def get_datasets():
    datasets_data = policy_engine.get_datasets()
    return jsonify(datasets_data)

@general_api.route('/datasets', methods=['POST'])
def add_dataset_route():
    data = request.json
    try:
        dataset = policy_engine.add_dataset(dataset_id=data.get('id'), name=data.get('name'),)
        return jsonify({"message": f"Dataset {dataset.id} added successfully", "dataset": dataset.to_dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/datasets/<dataset_id>', methods=['PUT'])
def update_dataset_route(dataset_id: str):
    data = request.json
    try:
        updated_ds = policy_engine.update_dataset(
            dataset_id=dataset_id,
            name=data.get('name'),
            description=data.get('description')
            # objects will be managed via object endpoints primarily
        )
        if updated_ds:
            return jsonify({"message": f"Dataset {dataset_id} updated successfully", "dataset": updated_ds.to_dict()}), 200
        return jsonify({"error": f"Dataset {dataset_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/datasets/<dataset_id>', methods=['DELETE'])
def delete_dataset_route(dataset_id: str):
    try:
        if policy_engine.delete_dataset(dataset_id):
            return jsonify({"message": f"Dataset {dataset_id} deleted successfully"}), 200
        return jsonify({"error": f"Dataset {dataset_id} not found or cannot be deleted (e.g., contains objects)"}), 404 # Or 400/409 if specific logic added
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/conflict_classes', methods=['GET'])
def get_conflict_classes():
    cc_data = policy_engine.get_conflict_classes()
    return jsonify(cc_data)

@general_api.route('/conflict_classes', methods=['POST'])
def add_conflict_class_route():
    data = request.json
    try:
        cc = policy_engine.add_conflict_class(
            cc_id=data.get('class_id'),
            name=data.get('name'),
            dataset_ids=data.get('datasets', [])
        )
        return jsonify({"message": f"Conflict class {cc.id} added successfully", "conflict_class": cc.to_dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/conflict_classes/<cc_id>', methods=['PUT'])
def update_conflict_class_route(cc_id: str):
    data = request.json
    try:
        updated_cc = policy_engine.update_conflict_class(
            cc_id=cc_id,
            name=data.get('name'),
            dataset_ids=data.get('datasets')
        )
        if updated_cc:
            return jsonify({"message": f"Conflict class {cc_id} updated successfully", "conflict_class": updated_cc.to_dict()}), 200
        return jsonify({"error": f"Conflict class {cc_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/conflict_classes/<cc_id>', methods=['DELETE'])
def delete_conflict_class_route(cc_id: str):
    try:
        if policy_engine.delete_conflict_class(cc_id):
            return jsonify({"message": f"Conflict class {cc_id} deleted successfully"}), 200
        return jsonify({"error": f"Conflict class {cc_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/assign_role', methods=['POST'])
def assign_role():
    data = request.json
    user_id = data.get('user_id')
    role_id = data.get('role_id')
    try:
        user = policy_engine.assign_role_to_user(user_id, role_id)
        return jsonify({"message": f"Role {role_id} assigned to user {user_id}", "user": user.to_dict()})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/add_permission_to_role', methods=['POST'])
def add_permission_to_role_route():
    data = request.json
    role_id = data.get('role_id')
    object_id = data.get('object_id')
    action = data.get('action')
    try:
        policy_engine.add_permission_to_role(role_id, object_id, action)
        updated_role = Role.get_by_id(role_id)
        return jsonify({"message": f"Permission {action} on {object_id} added to role {role_id}", "role": updated_role.to_dict() if updated_role else None})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/grant_direct_permission', methods=['POST'])
def grant_direct_permission_route():
    data = request.json
    user_id = data.get('user_id')
    object_id = data.get('object_id')
    action = data.get('action')
    try:
        policy_engine.grant_direct_permission(user_id, object_id, action)
        return jsonify({"message": f"Direct permission {action} on {object_id} granted to user {user_id}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/check_access', methods=['POST'])
def check_access_route():
    data = request.json
    user_id = data.get('user_id')
    object_id = data.get('object_id')
    action = data.get('action')
    if not all([user_id, object_id, action]):
        return jsonify({"error": "Missing required parameters (user_id, object_id, action)"}), 400
    try:
        allowed, reason = policy_engine.check_access(user_id, object_id, action)
        return jsonify({"allowed": allowed, "reason": reason})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/record_access', methods=['POST'])
def record_access_route():
    data = request.json
    user_id = data.get('user_id')
    object_id = data.get('object_id')
    if not all([user_id, object_id]):
        return jsonify({"error": "Missing required parameters (user_id, object_id)"}), 400
    try:
        policy_engine.record_access(user_id, object_id)
        return jsonify({"success": True, "message": "Access recorded successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/grant_access', methods=['POST'])
def grant_access_route():
    data = request.json
    user_id = data.get('user_id')
    object_id = data.get('object_id')
    action = data.get('action')
    if not all([user_id, object_id, action]):
        return jsonify({"error": "Missing required parameters"}), 400
    try:
        granted, message = policy_engine.grant_access(user_id, object_id, action)
        return jsonify({"granted": granted, "message": message})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/user_permissions/<user_id>', methods=['GET'])
def get_user_permissions_route(user_id: str):
    try:
        permissions = policy_engine.user_check_permissions(user_id)
        return jsonify(permissions)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/conflict_datasets/<dataset_id>', methods=['GET'])
def get_conflict_datasets_route(dataset_id: str):
    try:
        conflicting_ds, involved_ccs = policy_engine.get_conflict_datasets_info(dataset_id)
        return jsonify({"conflicting_datasets": conflicting_ds, "involved_conflict_classes": involved_ccs})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@general_api.route('/user/change-password', methods=['POST'])
@login_required
def change_password_route():
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    user_id = get_current_user_id()

    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401
    if not current_password or not new_password:
        return jsonify({"error": "Missing current_password or new_password"}), 400

    try:
        success = policy_engine.change_user_password(user_id, current_password, new_password)
        if success:
            return jsonify({"message": "Password changed successfully"}), 200
        else:
            return jsonify({"error": "Failed to change password. Current password might be incorrect or user not found."}), 400
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

app.register_blueprint(general_api)
app.register_blueprint(auth)
CORS(app)

def initialize_system():
    print("Initializing system data...")
    ensure_admin_exists()

    PREDEFINED_ROLES = [
        {"id": "admin", "name": "Administrator"},
        {"id": "manager", "name": "Manager"},
        {"id": "worker", "name": "Worker"}
    ]
    existing_roles_data = policy_engine.get_roles()
    existing_role_ids = [r['_id'] for r in existing_roles_data]

    for role_data in PREDEFINED_ROLES:
        if role_data['id'] not in existing_role_ids:
            try:
                policy_engine.add_role(role_id=role_data['id'], name=role_data['name'])
                print(f"Added predefined role: {role_data['name']}")
            except Exception as e:
                print(f"Error adding predefined role {role_data['name']}: {str(e)}")
    print("System initialization complete.")

initialize_system()

@app.route('/')
def index():
    return jsonify({"message": "Flask backend is running"})

if __name__ == "__main__":
    print("Starting Flask application...")
    app.run(host='0.0.0.0', port=8080, debug=False)
