from typing import List, Dict, Any
from .base_model import BaseModel

# Role and permission Models
class Permission:
    def __init__(self, object_id: str, action: str):
        self.object_id = object_id
        self.action = action

    def to_dict(self) -> Dict[str, Any]:
        return {
            'object_id': self.object_id,
            'action': self.action
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Permission':
        if not data:
            return None
        return cls(
            object_id=data.get('object_id'),
            action=data.get('action')
        )

class Role(BaseModel):
    def __init__(self, id: str, name: str, permissions: List[Permission] = None):
        self.id = id # This will be used as _id in MongoDB
        self.name = name
        self.permissions = permissions if permissions is not None else []

    def to_dict(self) -> Dict[str, Any]:
        return {
            '_id': self.id,
            'name': self.name,
            'permissions': [p.to_dict() for p in self.permissions]
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Role':
        if not data:
            return None
        return cls(
            id=data['_id'],
            name=data.get('name'),
            permissions=[Permission.from_dict(p_data) for p_data in data.get('permissions', [])]
        )

if __name__ == "__main__":
    role = Role(id="1", name="Admin", permissions=[Permission(action="read", object_id="1"), Permission(action="write", object_id="2")])
    print(role.to_dict())