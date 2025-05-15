from typing import List, Dict, Any
import bcrypt # Added for password hashing
from .base_model import BaseModel

# Password utility functions
def hash_password_util(password: str) -> str:
    if isinstance(password, str):
        password_bytes = password.encode('utf-8')
    else: # Already bytes
        password_bytes = password
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

def verify_password_util(plain_password: str, hashed_password_str: str) -> bool:
    if not plain_password or not hashed_password_str:
        return False
    plain_password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password_str.encode('utf-8')
    return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)

class User(BaseModel):
    def __init__(self, id: str, name: str, roles: List[str] = None, access_history: List[str] = None, password_hash: str = None):
        self.id = id  # This will be used as _id in MongoDB
        self.name = name
        self.roles = roles if roles is not None else []
        self.access_history = access_history if access_history is not None else []
        self.password_hash = password_hash # Store hashed password

    def to_dict(self) -> Dict[str, Any]:
        data = {
            '_id': self.id,
            'name': self.name,
            'roles': self.roles,
            'access_history': self.access_history
        }
        if self.password_hash:
            data['password'] = self.password_hash # Save as 'password' in DB
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        if not data:
            return None
        return cls(
            id=data['_id'],
            name=data.get('name'),
            roles=data.get('roles', []),
            access_history=data.get('access_history', []),
            password_hash=data.get('password') # Load from 'password' in DB
        )



    # Methods for password management using the utility functions
    def set_password(self, plain_password: str):
        self.password_hash = hash_password_util(plain_password)

    def check_password(self, plain_password: str) -> bool:
        if not self.password_hash:
            return False
        return verify_password_util(plain_password, self.password_hash)

if __name__ == "__main__":
    user = User(
        id = "1",
        name = "John Doe",
        roles = ["worker"],
        access_history = ["APPLE", "NVIDIA", "TESLA"]
    )

    user2 = User(
        id = "2",
        name = "Jane Doe",
        roles = ["user"],
        access_history = ["APPLE", "NVIDIA", "TESLA"]
    )
    print(type(user.from_dict(user.to_dict())))
    print(user.from_dict(user.to_dict()))
    # check all users 
    print(User)