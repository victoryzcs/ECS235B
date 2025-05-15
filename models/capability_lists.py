from typing import Dict, List, Any
from .base_model import BaseModel

# This model represents a single document in the 'capability_lists' collection.
# The document ID is fixed to 'caps_matrix'.
class CapabilityList(BaseModel):
    FIXED_ID = "caps_matrix"

    # Override collection name because it's 'capability_lists' not 'capabilitylists'
    @classmethod
    def _get_collection_name(cls) -> str:
        return 'capability_lists'

    def __init__(self, matrix: Dict[str, Dict[str, List[str]]] = None):
        self.id = self.FIXED_ID # Fixed ID for this singleton document
        self.matrix = matrix if matrix is not None else {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            '_id': self.id,
            'matrix': self.matrix
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CapabilityList':
        if not data:
            # Return a default/empty instance if no data found in DB for the fixed ID
            return cls(matrix={})
        return cls(
            matrix=data.get('matrix', {})
            # id is fixed, no need to get from data['_id'] explicitly for instantiation
        )
    
    @classmethod
    def load(cls) -> 'CapabilityList':
        """Loads the single capability list document from the database."""
        return cls.get_by_id(cls.FIXED_ID) or cls() # Ensure an instance is always returned

    def add_permission(self, user_id: str, object_id: str, action: str):
        if user_id not in self.matrix:
            self.matrix[user_id] = {}
        if object_id not in self.matrix[user_id]:
            self.matrix[user_id][object_id] = []
        if action not in self.matrix[user_id][object_id]:
            self.matrix[user_id][object_id].append(action)

    def remove_permission(self, user_id: str, object_id: str, action: str):
        if user_id in self.matrix and object_id in self.matrix[user_id] and action in self.matrix[user_id][object_id]:
            self.matrix[user_id][object_id].remove(action)
            if not self.matrix[user_id][object_id]: # Clean up empty list
                del self.matrix[user_id][object_id]
            if not self.matrix[user_id]: # Clean up empty user entry
                del self.matrix[user_id]

    def check_permission(self, user_id: str, object_id: str, action: str) -> bool:
        return user_id in self.matrix and \
               object_id in self.matrix[user_id] and \
               action in self.matrix[user_id][object_id]

if __name__ == "__main__":
    caps = CapabilityList()
    caps.add_permission("user1", "object1", "read")
    caps.add_permission("user1", "object1", "write")
    caps.add_permission("user1", "object2", "read")
    caps.add_permission("user2", "object1", "read")
    print(caps.to_dict())
    caps.remove_permission("user1", "object1", "read")
    print(caps.to_dict())
    print(caps.check_permission("user1", "object1", "read")) # False
    print(caps.check_permission("user1", "object1", "write")) # True
    print(CapabilityList.from_dict(caps.to_dict()))