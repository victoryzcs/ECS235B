from collections import UserDict
import json
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models.conflict_class import ConflictClass
from models.capability_lists import CapabilityList
from models.dataset import Dataset
from models.object import Object
from models.role import Role, Permission
from models.user import User
from models.database import Database
from typing import Tuple, Dict, Any

class PolicyEngine:
    def __init__(self):
        self.db = Database()
        self.caps = CapabilityList()
        self._load_data()
    
    def _load_data(self):
        """Load all data from MongoDB into memory"""
        self.roles = {doc['_id']: Role.from_dict(doc) for doc in self.db.get_all_documents('roles')}
        self.users = {doc['_id']: User.from_dict(doc) for doc in self.db.get_all_documents('users')}
        self.objects = {doc['_id']: Object.from_dict(doc) for doc in self.db.get_all_documents('objects')}
        self.datasets = {doc['_id']: Dataset.from_dict(doc) for doc in self.db.get_all_documents('datasets')}
        self.conflict_classes = {doc['_id']: ConflictClass.from_dict(doc) for doc in self.db.get_all_documents('conflict_classes')}
        
        # Load capability lists
        caps_data = self.db.get_all_documents('capability_lists')
        if caps_data:
            self.caps = CapabilityList.from_dict(caps_data[0].get('matrix', {}))
        
        # Load access history
        self.user_access_history = {}
        for doc in self.db.get_all_documents('access_history'):
            self.user_access_history[doc['user_id']] = doc.get('accessed_datasets', [])
    
    def add_user(self, user: User):
        self.users[user.id] = user
        self.db.save_document('users', {'_id': user.id, **user.to_dict()})
    
    def add_role(self, role: Role):
        self.roles[role.id] = role
        self.db.save_document('roles', {'_id': role.id, **role.to_dict()})
    
    def add_object(self, obj: Object):
        if obj.dataset not in self.datasets:
            raise Exception(f"Dataset {obj.dataset} does not exist")
        
        self.objects[obj.id] = obj
        if obj.id not in self.datasets[obj.dataset].objects:
            self.datasets[obj.dataset].objects.append(obj.id)
            self.db.save_document('datasets', {'_id': obj.dataset, **self.datasets[obj.dataset].to_dict()})
        
        self.db.save_document('objects', {'_id': obj.id, **obj.to_dict()})
    
    def add_dataset(self, dataset: Dataset):
        self.datasets[dataset.id] = dataset
        self.db.save_document('datasets', {'_id': dataset.id, **dataset.to_dict()})
    
    def add_conflict_class(self, conflict_class: ConflictClass):
        self.conflict_classes[conflict_class.class_id] = conflict_class
        self.db.save_document('conflict_classes', {'_id': conflict_class.class_id, **conflict_class.to_dict()})
    
    def assign_role_to_user(self, user_id: str, role_id: str):
        if user_id not in self.users or role_id not in self.roles:
            raise ValueError("Invalid user or role ID")
        
        if role_id not in self.users[user_id].roles:
            self.users[user_id].roles.append(role_id)
            self.db.save_document('users', {'_id': user_id, **self.users[user_id].to_dict()})
    
    def grant_direct_permission(self, user_id: str, object_id: str, action: str):
        if user_id not in self.users or object_id not in self.objects:
            raise ValueError("Invalid user or object ID")
        
        self.caps.add_permission(user_id, object_id, action)
        self.db.save_document('capability_lists', {'_id': 'caps_matrix', 'matrix': self.caps.to_dict()})
        return True
    
    def record_access(self, user_id: str, object_id: str):
        if user_id not in self.users or object_id not in self.objects:
            raise ValueError("Invalid user or object ID")
        
        obj = self.objects[object_id]
        dataset_id = obj.dataset
        
        if user_id not in self.user_access_history:
            self.user_access_history[user_id] = []
        
        if dataset_id not in self.user_access_history[user_id]:
            self.user_access_history[user_id].append(dataset_id)
            self.db.save_document('access_history', {
                '_id': user_id,
                'user_id': user_id,
                'accessed_datasets': self.user_access_history[user_id]
            })
            
            if dataset_id not in self.users[user_id].access_history:
                self.users[user_id].access_history.append(dataset_id)
                self.db.save_document('users', {'_id': user_id, **self.users[user_id].to_dict()})
        return True
    
    def add_permission_to_role(self, role_id, object_id, action):
        """
        Adds a permission to a role.
        """
        if role_id not in self.roles:
            raise ValueError("Invalid role ID")
        if object_id not in self.objects:
            raise ValueError("Invalid object ID")
            
        permission = Permission(object_id=object_id, action=action)
        self.roles[role_id].permissions.append(permission)
        self.db.save_document('roles', {'_id': role_id, **self.roles[role_id].to_dict()})
        return True
        
    def revoke_permission_from_role(self, role_id, object_id, action):
        """
        Revokes a permission from a role.
        """
        if role_id not in self.roles:
            raise ValueError("Invalid role ID")
            
        role = self.roles[role_id]
        original_length = len(role.permissions)
        role.permissions = [p for p in role.permissions 
                           if not (p.object_id == object_id and p.action == action)]
        
        self.db.save_document('roles', {'_id': role_id, **role.to_dict()})
        return len(role.permissions) < original_length
    
    def revoke_direct_permission(self, user_id, object_id, action):
        if user_id not in self.users or object_id not in self.objects:
            raise ValueError("Invalid user or object ID")
    
        self.caps.remove_permission(user_id, object_id, action)
        self.db.save_document('capability_lists', {'_id': 'caps_matrix', 'matrix': self.caps.to_dict()})
        
        # Check if user still has this permission through roles
        rbac_allowed, _ = self._check_rbac(user_id, object_id, action)
        if rbac_allowed:
            print(f"WARNING: Direct permission '{action}' on '{self.objects[object_id].name}' was removed for user '{self.users[user_id].name}', "
                  f"but they still have this permission through their assigned role(s). "
                  f"Use user_check_permissions() to verify current permissions.")
            
        return True
    
    def remoke_role_from_user(self, user_id, role_id):
        if user_id not in self.users or role_id not in self.roles:
            raise ValueError("Invalid user or role ID")
        
        if role_id in self.users[user_id].roles:
            self.users[user_id].roles.remove(role_id)
            self.db.save_document('users', {'_id': user_id, **self.users[user_id].to_dict()})
    
    def _check_chinese_wall(self, user_id, object_id):
        if object_id not in self.objects:
            raise ValueError("Invalid object ID")
        
        obj = self.objects[object_id]
        dataset_id = obj.dataset
    
        # If object's dataset is not in any conflict class, return True, eg. public dataset
        if not any(dataset_id in cc.datasets for cc in self.conflict_classes.values()):
            return True, "Dataset not in any conflict class"
        
        # Find the conflict class this dataset belongs to
        conflict_class = None # eg. class_id='cc1' name='Test Conflict Class' datasets=['dataset1', 'dataset2']
        for cc in self.conflict_classes.values():
            
            if dataset_id in cc.datasets:
                conflict_class = cc
                break
    
        if not conflict_class:
            return True, "Dataset not in any conflict class"

        user_history = self.user_access_history.get(user_id, [])
        # Check if user has accessed any other dataset in the same conflict class
        for accessed_dataset in user_history:
            if accessed_dataset != dataset_id and accessed_dataset in conflict_class.datasets:
                return False, "User has accessed a dataset in the same conflict class"
        # If all checks pass, return True
        return True, "Access allowed"
    
    def _check_rbac(self, user_id, object_id, action):
        if user_id not in self.users:
            return False, "User not found"
        
        user = self.users[user_id]
    
        # Check each role the user has
        for role_id in user.roles:
            if role_id not in self.roles:
                continue
    
            role = self.roles[role_id]
    
            for permission in role.permissions:
                if permission.object_id == object_id and permission.action == action:
                    return True, "Permission granted"
    
        return False, "Permission denied"
    
    def _check_caps(self, user_id, object_id, action):
        if self.caps.check_permission(user_id, object_id, action):
            return True, "Permission granted by caps"
        return False, "Permission denied by caps"
    
    def check_access(self, user_id, object_id, action):
        '''
        Check if a user can access an object with a given action.
        1. Chinese Wall check
        2. RBAC check
        3. caps check
        Returns True if access is allowed, False otherwise.
        '''
        # Check Chinese Wall
        cw_allowed, cw_reason = self._check_chinese_wall(user_id, object_id)
        if not cw_allowed:
            return False, cw_reason
    
        # Check RBAC
        rbac_allowed, rbac_reason = self._check_rbac(user_id, object_id, action)
        if rbac_allowed:
            return True, rbac_reason
    
        # Check direct caps permissions
        caps_allowed, caps_reason = self._check_caps(user_id, object_id, action)
        if caps_allowed:
            return True, caps_reason
            
        return False, "No permission found"
    
    def grant_access(self, user_id: str, object_id: str, action: str) -> Tuple[bool, str]:
    
        allowed, reason = self.check_access(user_id, object_id, action)
        
        if not allowed:
            return False, f"Cannot grant access: {reason}"
        
        # Record the access in history
        self.record_access(user_id, object_id)
        
        return True, "Access granted"
        
    def user_check_permissions(self, user_id: str) -> dict:
        """
        Returns a dictionary of objects and the permissions the user has on them.
        """
        if user_id not in self.users:
            raise ValueError("Invalid user ID")
            
        user_permissions = {}
        
        # Check permissions from roles
        for role_id in self.users[user_id].roles:
            if role_id not in self.roles:
                continue
                
            role = self.roles[role_id]
            for permission in role.permissions:
                obj_id = permission.object_id
                if obj_id not in self.objects:
                    continue
                    
                if obj_id not in user_permissions:
                    user_permissions[obj_id] = {
                        "name": self.objects[obj_id].name,
                        "permissions": []
                    }
                
                if permission.action not in user_permissions[obj_id]["permissions"]:
                    user_permissions[obj_id]["permissions"].append(permission.action)
        
        # Check direct permissions from caps
        for obj_id in self.objects:
            for action in ["read", "write", "delete", "download", "execute"]:  # Common actions
                if self.caps.check_permission(user_id, obj_id, action):
                    if obj_id not in user_permissions:
                        user_permissions[obj_id] = {
                            "name": self.objects[obj_id].name,
                            "permissions": []
                        }
                    
                    if action not in user_permissions[obj_id]["permissions"]:
                        user_permissions[obj_id]["permissions"].append(action)
        
        return user_permissions
    def get_users(self):
        return [user.to_dict() for user in self.users.values()]

if __name__ == "__main__":
    pe = PolicyEngine()
    
    # Got users
    user1 = User(id = "user1", name = "Victor")
    user2 = User(id = "user2", name = "Yuzhang")
    user3 = User(id = "user3", name = "Unauthorized")
    pe.add_user(user1)
    pe.add_user(user2)
    pe.add_user(user3)
    print(pe.users, end="\n\n")

    # Got roles
    role1 = Role(id = "role1", name = "Admin")
    role2 = Role(id = "role2", name = "Editor")
    pe.add_role(role1)
    pe.add_role(role2)

    # Got datasets
    dataset1 = Dataset(id = "vicdataset", name = "Victor Dataset 1")
    dataset2 = Dataset(id = "anti-vicdataset", name = "Anti Victor Dataset 2")
    dataset3 = Dataset(id = "dataset3", name = "Dataset 3")
    pe.add_dataset(dataset1)
    pe.add_dataset(dataset2)
    pe.add_dataset(dataset3)
    print(pe.datasets, end="\n\n")

    # Got conflict classes
    conflict_class1 = ConflictClass(class_id = "cc1", name = "Test Conflict Class", datasets = ["vicdataset", "anti-vicdataset"])
    pe.add_conflict_class(conflict_class1)
    print(pe.conflict_classes, end="\n\n")

    # Got objects
    obj1 = Object(id = "obj_vic1", name = "victor file", dataset = "vicdataset", conflict_class = "cc1")
    obj2 = Object(id = "obj_vic2", name = "anti-victor file", dataset = "anti-vicdataset", conflict_class = "cc1")
    obj3 = Object(id = "obj3", name = "obj3", dataset = "dataset3", conflict_class = "")
    pe.add_object(obj1)
    pe.add_object(obj2)
    pe.add_object(obj3)
    print(pe.objects, end="\n\n")
    
    # Add permissions to roles
    pe.add_permission_to_role("role1", "obj_vic1", "read")
    pe.add_permission_to_role("role1", "obj_vic1", "write")
    pe.add_permission_to_role("role2", "obj_vic2", "write")
    pe.add_permission_to_role("role2", "obj3", "read")
    
    # Assign roles
    pe.assign_role_to_user(user1.id, role1.id)
    pe.assign_role_to_user(user2.id, role2.id)
    pe.assign_role_to_user(user3.id, role2.id)
    print(pe.users, end="\n\n")

    # Add permission to a role
    pe.add_permission_to_role(role_id = "role1", object_id="obj_vic1", action="read")
    pe.add_permission_to_role(role_id = "role1", object_id="obj_vic1", action="write")
    pe.add_permission_to_role(role_id = "role1", object_id="obj_vic1", action="download")



    '''
    {'user1': User(id='user1', name='Victor', roles=['role1'], access_history=[]), 
    'user2': User(id='user2', name='Yuzhang', roles=['role2'], access_history=[]), 
    'user3': User(id='user3', name='Unauthorized', roles=['role2'], access_history=[])}
    '''

    # Grant permissions
    pe.grant_direct_permission(user1.id, obj1.id, "read")
    pe.grant_direct_permission(user2.id, obj2.id, "write")
    pe.grant_direct_permission(user3.id, obj3.id, "read")
    print(pe.caps.matrix, end="\n\n")

    # Check access
    print(pe.check_access(user1.id, obj1.id, "read"))
    print(pe.check_access(user2.id, obj2.id, "write"))
    print(pe.check_access(user3.id, obj3.id, "read"))

    # Access a file 
    pe.record_access(user1.id, obj1.id) # user1 access vicdataset
    print(pe.user_access_history)

    # user1 try to access obj2
    print(pe.check_access(user1.id, obj2.id, "read")) # Should be False
    print(pe.check_access(user1.id, obj1.id, "read")) # Should be True
    print(pe.check_access(user2.id, obj2.id, "write")) # Should be True
    print(pe.check_access(user2.id, obj2.id, "download")) # Should be False
    print(pe.check_access(user2.id, obj2.id, "write")) # Should be True

    # revoke direct permission from user1
    pe.revoke_direct_permission(user_id= user1.id, object_id=obj1.id, action="read") # Should send warning and still have 'read', 'write', 'download'
    print(pe.user_check_permissions(user_id=user1.id))

    # rovoke role from user1
    pe.revoke_permission_from_role(role_id="role1", object_id= obj1.id, action="read") # Should only have 'write', 'download' permissions
    print(pe.user_check_permissions(user_id=user1.id))

    # Assign another user
    user_sarah = User(id = "sarah", name = "Sarah")
    pe.add_user(user_sarah)
    print(pe.users)
    print(pe.user_check_permissions(user_id="sarah"))
    
    # caps grant direct permission for user sarah
    pe.grant_direct_permission(user_id="sarah", object_id=obj1.id, action="delete")
    print(pe.user_check_permissions(user_id="sarah"))

    # Remove direct permission 
    pe.revoke_direct_permission(user_id="sarah", object_id= obj2.id, action="delete") # Should change nothing
    print(pe.user_check_permissions(user_id="sarah"))

    # Remove direct permission 
    pe.revoke_direct_permission(user_id="sarah", object_id= obj1.id, action="read") # Should change nothing
    print(pe.user_check_permissions(user_id="sarah"))

    pe.revoke_direct_permission(user_id="sarah", object_id= obj1.id, action="delete")
    print(pe.user_check_permissions(user_id="sarah")) # Should have no permissions on any files
    print()
    print(pe.users)    

    # remove role from user1 (Victor)
    pe.remoke_role_from_user(user_id=user1.id, role_id=role2.id) 
    print(pe.users.get(user1.id).roles) # Should be ['role1'] since user1 has not been assigned role2

    pe.remoke_role_from_user(user_id=user1.id, role_id=role1.id)
    print(pe.users.get(user1.id).roles) # Should be [] 

    print()
    print(pe.users.get(user1.id))
    print(pe.user_check_permissions(user_id="user1")) 
    
    print(pe.grant_access(user_id=user1.id, object_id=obj1.id, action="read")) # Should be False