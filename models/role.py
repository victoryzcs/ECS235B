from typing import List, Dict
from pydantic import BaseModel, Field

# Role and permission Models
class Permission(BaseModel):
    """Represent an action on an object"""
    action: str
    object_id: str

    def to_dict(self) -> Dict:
        return {
            "action": self.action,
            "object_id": self.object_id
        }

class Role(BaseModel):
    """Representing a collection of permissions"""
    id: str
    name: str
    permissions: List[Permission] = Field(default_factory=list)
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name or self.id,
            "permissions": [p.to_dict() for p in self.permissions]
        }
    @classmethod
    def from_dict(cls, data: Dict):
        permissions = [Permission(**p) for p in data.get("permissions", [])]
        return cls(
            id=data.get("id"),
            name=data.get("name", data.get("id")),
            permissions=permissions
        )
if __name__ == "__main__":
    role = Role(id="1", name="Admin", permissions=[Permission(action="read", object_id="1"), Permission(action="write", object_id="2")])
    print(role.to_dict())