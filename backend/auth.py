from flask import Flask, Blueprint, request, jsonify
import bcrypt
import sys
auth = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth.route('/', methods=['GET'])
def index():
    return "Auth is running"

def hash_password(password: str) -> bytes:
    """
    Hashes the given password using bcrypt with a generated salt.

    Args:
        password: The plaintext password string.

    Returns:
        bytes: The resulting bcrypt hash (including salt and cost factor),
               ready to be stored (e.g., in a database bytea/blob column).
               Returns None if input is invalid.
    """
    if not password:
        print("Error: Password cannot be empty.", file=sys.stderr)
        return None
    try:
        # Encode the password string to bytes (UTF-8 is standard)
        password_bytes = password.encode('utf-8')

        # Generate a salt. bcrypt.gensalt() automatically creates a
        # random salt with a reasonable default work factor (cost).
        salt = bcrypt.gensalt()

        # Hash the password
        hashed_password = bcrypt.hashpw(password_bytes, salt)
        return hashed_password
    except Exception as e:
        print(f"Error hashing password: {e}", file=sys.stderr)
        return None

def check_password(stored_hash: bytes, provided_password: str) -> bool:
    """
    Verifies a provided password against a stored bcrypt hash.

    Args:
        stored_hash: The bcrypt hash retrieved from storage (as bytes).
        provided_password: The plaintext password the user entered.

    Returns:
        bool: True if the password matches the hash, False otherwise.
    """
    if not stored_hash or not provided_password:
        return False
    try:
        provided_password_bytes = provided_password.encode('utf-8')
        return bcrypt.checkpw(provided_password_bytes, stored_hash)
    except Exception as e:
        print(f"Error checking password: {e}", file=sys.stderr)
        return False
