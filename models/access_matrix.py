from typing import Dict, List, Set, Optional

class AccessMatrix:
    
    def __init__(self):
        # Structure: {user_id: {object_id: set(permissions)}}
        # Example: {"Victor": {"top_secret.txt": {"read", "write"}, "public_report.txt": {"read","write","delete","share"}}}
        self.matrix: Dict[str, Dict[str, Set[str]]] = {}
    
    def add_permission(self, user_id: str, object_id: str, permission: str) -> None:
        if user_id not in self.matrix:
            self.matrix[user_id] = {}
        
        if object_id not in self.matrix[user_id]:
            self.matrix[user_id][object_id] = set()
            
        self.matrix[user_id][object_id].add(permission)
    
    def remove_permission(self, user_id: str, object_id: str, permission: str) -> None:
        if (user_id in self.matrix and 
            object_id in self.matrix[user_id] and 
            permission in self.matrix[user_id][object_id]):
            self.matrix[user_id][object_id].remove(permission)
            
            if not self.matrix[user_id][object_id]:
                del self.matrix[user_id][object_id]
            
            if not self.matrix[user_id]:
                del self.matrix[user_id]
    
    def check_permission(self, user_id: str, object_id: str, permission: str) -> bool:
        return (user_id in self.matrix and 
                object_id in self.matrix[user_id] and 
                permission in self.matrix[user_id][object_id])
    
    def to_dict(self) -> Dict:
        result = {}
        for user_id, obj_dict in self.matrix.items():
            result[user_id] = {
                obj_id: list(perms) for obj_id, perms in obj_dict.items()
            }
        return result
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'AccessMatrix':
        acm = cls()
        for user_id, obj_dict in data.items():
            for obj_id, perms in obj_dict.items():
                for perm in perms:
                    acm.add_permission(user_id, obj_id, perm)
        return acm

if __name__ == "__main__":
    acm = AccessMatrix()
    acm.add_permission("user1", "object1", "read")
    acm.add_permission("user1", "object1", "write")
    acm.add_permission("user1", "object2", "read")
    acm.add_permission("user2", "object1", "read")
    print(acm.to_dict())
    acm.remove_permission("user1", "object1", "read")
    print(acm.to_dict())
    print(acm.check_permission("user1", "object1", "read")) # False
    print(acm.check_permission("user1", "object1", "write")) # True
    print(AccessMatrix.from_dict(acm.to_dict()))