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
from models.user import User, hash_password_util
from typing import Tuple, Dict, Any, List
from models.base_model import BaseModel

class AccessHistoryEntry:
    def __init__(self, user_id: str, accessed_datasets: List[str]):
        self.user_id = user_id
        self.accessed_datasets = accessed_datasets

    def to_dict(self):
        return {'_id': self.user_id, 'user_id': self.user_id, 'accessed_datasets': self.accessed_datasets}

    @classmethod
    def from_dict(cls, data):
        return cls(user_id=data['user_id'], accessed_datasets=data.get('accessed_datasets', []))

class PolicyEngine:
    def __init__(self):
        # In-memory caches
        self.users: Dict[str, User] = {}
        self.roles: Dict[str, Role] = {}
        self.objects: Dict[str, Object] = {}
        self.datasets: Dict[str, Dataset] = {}
        self.conflict_classes: Dict[str, ConflictClass] = {}
        self.caps: CapabilityList = None
        self.user_access_history: Dict[str, List[str]] = {} # user_id -> list of dataset_ids
        self._load_data()
    
    def _load_data(self):
        """Load all data from MongoDB into memory using ORM methods."""
        self.users = {user.id: user for user in User.get_all()}
        self.roles = {role.id: role for role in Role.get_all()}
        self.objects = {obj.id: obj for obj in Object.get_all()}
        self.datasets = {ds.id: ds for ds in Dataset.get_all()}
        self.conflict_classes = {cc.id: cc for cc in ConflictClass.get_all()}
        
        self.caps = CapabilityList.load() # Loads the singleton capability list
        if not self.caps: # Should be instantiated by .load() even if DB is empty
            self.caps = CapabilityList()
            self.caps.save() # Save a default empty one if it didn't exist
        
        # Load access history
        # Access history will be loaded into user_access_history dict and also kept on User objects
        raw_history_docs = BaseModel.get_access_history_collection().find({})
        for doc in raw_history_docs:
            entry = AccessHistoryEntry.from_dict(doc)
            self.user_access_history[entry.user_id] = entry.accessed_datasets
            # Also update the in-memory User object if it exists
            if entry.user_id in self.users:
                self.users[entry.user_id].access_history = entry.accessed_datasets
        
        
    
    def add_user(self, user_id: str, name: str, password_str: str = "password"):
        if user_id in self.users:
            raise Exception(f"User {user_id} already exists.")
        hashed_pwd = hash_password_util(password_str)
        user = User(id=user_id, name=name, password_hash=hashed_pwd)
        user.save()
        self.users[user.id] = user
        return user
    
    def add_role(self, role_id: str, name: str):
        if role_id in self.roles:
            raise Exception(f"Role {role_id} already exists.")
        role = Role(id=role_id, name=name)
        role.save()
        self.roles[role.id] = role
        return role
    
    def update_role(self, role_id: str, name: str = None):
        role = self.roles.get(role_id)
        if not role:
            return None # Or raise Exception("Role not found")

        updated = False
        if name is not None and role.name != name:
            role.name = name
            updated = True
        
        # Permissions are managed via add_permission_to_role / revoke_permission_from_role

        if updated:
            role.save()
            self.roles[role.id] = role # Update cache
        return role

    def delete_role(self, role_id: str):
        role = self.roles.get(role_id)
        if not role:
            return False # Or raise Exception("Role not found")

        # Prevent deletion if the role is assigned to any user
        for user in self.users.values():
            if role_id in user.roles:
                raise Exception(f"Role {role_id} ({role.name}) cannot be deleted because it is assigned to user {user.id} ({user.name}). Unassign the role first.")

        # If a role is deleted, its permissions become meaningless with it, so they are effectively gone.
        # The Role model itself stores its permissions. Deleting the role document deletes them.

        role.delete() # Assumes Role model has a delete method
        del self.roles[role_id] # Remove from cache
        return True
    
    def add_object(self, obj_id: str, name: str, dataset_id: str):
        if obj_id in self.objects:
            raise Exception(f"Object {obj_id} already exists.")
        if dataset_id not in self.datasets:
            raise Exception(f"Dataset {dataset_id} does not exist. Please add it first.")
        
        all_conflict_classes = self.conflict_classes.values()
        conflict_class_id = None
        for cc in all_conflict_classes:
            if dataset_id in cc.datasets:
                conflict_class_id = cc.id
                break
        obj = Object(id=obj_id, name=name, dataset=dataset_id, conflict_class=conflict_class_id)
        obj.save()
        self.objects[obj.id] = obj
        
        dataset = self.datasets[dataset_id]
        if obj.id not in dataset.objects:
            dataset.objects.append(obj.id)
            dataset.save()
        return obj
    
    def update_object(self, obj_id: str, name: str = None, dataset_id: str = None):
        obj = self.objects.get(obj_id)
        if not obj:
            return None # Or raise Exception("Object not found")

        updated = False
        original_dataset_id = obj.dataset

        if name is not None and obj.name != name:
            obj.name = name
            updated = True
        
        if dataset_id is not None and obj.dataset != dataset_id:
            if dataset_id not in self.datasets:
                raise Exception(f"New dataset {dataset_id} does not exist.")
            obj.dataset = dataset_id
            # Re-evaluate conflict_class based on the new dataset
            new_conflict_class_id = None
            for cc in self.conflict_classes.values():
                if dataset_id in cc.datasets:
                    new_conflict_class_id = cc.id
                    break
            if obj.conflict_class != new_conflict_class_id:
                obj.conflict_class = new_conflict_class_id
            updated = True

        if updated:
            obj.save()
            self.objects[obj.id] = obj # Update cache

            # If dataset was changed, update the old and new dataset's object lists
            if dataset_id is not None and original_dataset_id != dataset_id:
                if original_dataset_id and original_dataset_id in self.datasets:
                    old_dataset = self.datasets[original_dataset_id]
                    if obj_id in old_dataset.objects:
                        old_dataset.objects.remove(obj_id)
                        old_dataset.save()
                
                new_dataset = self.datasets[dataset_id]
                if obj_id not in new_dataset.objects:
                    new_dataset.objects.append(obj_id)
                    new_dataset.save()
        return obj

    def delete_object(self, obj_id: str):
        obj = self.objects.get(obj_id)
        if not obj:
            return False # Or raise Exception("Object not found")

        # 1. Remove from its dataset's list of objects
        dataset_id = obj.dataset
        if dataset_id and dataset_id in self.datasets:
            dataset = self.datasets[dataset_id]
            if obj_id in dataset.objects:
                dataset.objects.remove(obj_id)
                dataset.save()

        # 2. Remove from any role permissions
        for role in self.roles.values():
            original_len = len(role.permissions)
            role.permissions = [p for p in role.permissions if p.object_id != obj_id]
            if len(role.permissions) != original_len:
                role.save()

        # 3. Remove from capabilities list
        if self.caps:
            self.caps.remove_all_permissions_for_object(obj_id)
            self.caps.save()

        # 4. Delete the object itself
        obj.delete()
        del self.objects[obj_id] # Remove from cache
        return True

    def add_dataset(self, dataset_id: str, name: str, description: str = None):
        if dataset_id in self.datasets:
            raise Exception(f"Dataset {dataset_id} already exists.")
        dataset = Dataset(id=dataset_id, name=name, description=description)
        dataset.save()
        self.datasets[dataset.id] = dataset
        return dataset
    
    def update_dataset(self, dataset_id: str, name: str = None, description: str = None):
        ds = self.datasets.get(dataset_id)
        if not ds:
            return None # Or raise Exception("Dataset not found")

        updated = False
        if name is not None and ds.name != name:
            ds.name = name
            updated = True
        
        if description is not None and ds.description != description:
            ds.description = description
            updated = True
        
        # Note: Managing dataset.objects list (if it contains object actual instances or full dicts)
        # would be more complex. Currently, Dataset model seems to store object_ids.
        # If we need to update which objects belong to a dataset, it's usually done via object creation/update.

        if updated:
            ds.save()
            self.datasets[ds.id] = ds # Update cache
        return ds

    def delete_dataset(self, dataset_id: str):
        ds = self.datasets.get(dataset_id)
        if not ds:
            return False # Or raise Exception("Dataset not found")

        # Prevent deletion if the dataset contains objects
        # This requires checking all objects in self.objects
        if any(obj.dataset == dataset_id for obj in self.objects.values()):
            raise Exception(f"Dataset {dataset_id} cannot be deleted because it contains objects. Remove objects first.")

        # Also, consider implications for Conflict Classes that might reference this dataset
        # For now, we are not cascading deletes or disassociations from conflict classes here.
        # This might be a future enhancement or a manual step required by an admin.
        
        ds.delete()
        del self.datasets[dataset_id]
        return True
    
    def add_conflict_class(self, cc_id: str, name: str, dataset_ids: List[str]):
        if cc_id in self.conflict_classes:
            raise Exception(f"Conflict Class {cc_id} already exists.")
        for ds_id in dataset_ids:
            if ds_id not in self.datasets:
                raise Exception(f"Dataset {ds_id} for conflict class does not exist.")
        cc = ConflictClass(class_id=cc_id, name=name, datasets=dataset_ids)
        cc.save()
        self.conflict_classes[cc.id] = cc
        return cc
    
    def update_conflict_class(self, cc_id: str, name: str = None, dataset_ids: List[str] = None):
        cc = self.conflict_classes.get(cc_id)
        if not cc:
            return None  # Or raise Exception("Conflict Class not found")

        updated = False
        if name is not None and cc.name != name:
            cc.name = name
            updated = True
        
        if dataset_ids is not None:
            # Validate dataset_ids
            for ds_id in dataset_ids:
                if ds_id not in self.datasets:
                    raise Exception(f"Dataset {ds_id} for conflict class update does not exist.")
            if set(cc.datasets) != set(dataset_ids): # Check if there's an actual change
                cc.datasets = dataset_ids
                updated = True

        if updated:
            cc.save() # Assumes ConflictClass has a save method
            self.conflict_classes[cc.id] = cc # Update cache
        return cc

    def delete_conflict_class(self, cc_id: str):
        cc = self.conflict_classes.get(cc_id)
        if not cc:
            return False # Or raise Exception("Conflict Class not found")

        # Optional: Add logic to check if this conflict class is in use by any objects
        # and prevent deletion or handle accordingly.
        # For now, we will directly delete.

        cc.delete() # Assumes ConflictClass has a delete method
        del self.conflict_classes[cc_id] # Remove from cache
        return True
    
    def assign_role_to_user(self, user_id: str, role_id: str):
        user = self.users.get(user_id)
        role = self.roles.get(role_id)
        if not user:
            raise ValueError(f"User {user_id} not found.")
        if not role:
            raise ValueError(f"Role {role_id} not found.")

        if role_id not in user.roles:
            user.roles.append(role_id)
            user.save()
        return user
    
    def grant_direct_permission(self, user_id: str, object_id: str, action: str):
        if user_id not in self.users:
             raise ValueError(f"User {user_id} not found.")
        if object_id not in self.objects:
            raise ValueError(f"Object {object_id} not found.")
            
        self.caps.add_permission(user_id, object_id, action)
        self.caps.save() # Save the entire caps list document
        return True
    
    def record_access(self, user_id: str, object_id: str):
        user = self.users.get(user_id)
        obj = self.objects.get(object_id)
        if not user:
            raise ValueError(f"User {user_id} not found during record_access.")
        if not obj:
            raise ValueError(f"Object {object_id} not found during record_access.")

        dataset_id = obj.dataset
        
        # Update in-memory cache for user_access_history
        if user_id not in self.user_access_history:
            self.user_access_history[user_id] = []
        
        needs_db_update = False
        if dataset_id not in self.user_access_history[user_id]:
            self.user_access_history[user_id].append(dataset_id)
            needs_db_update = True

        # Update user object's access history (in memory and persist)
        if dataset_id not in user.access_history:
            user.access_history.append(dataset_id)
            user.save() 
           
            needs_db_update = True # Marked for saving the standalone history doc too
        
        if needs_db_update:
            # Save/update the specific access history document for this user
            history_doc_data = AccessHistoryEntry(user_id=user_id, accessed_datasets=self.user_access_history[user_id]).to_dict()
            BaseModel.get_access_history_collection().update_one(
                {'_id': user_id},
                {'$set': history_doc_data},
                upsert=True
            )
        return True
    
    def add_permission_to_role(self, role_id: str, object_id: str, action: str):
        role = self.roles.get(role_id)
        if not role:
            raise ValueError(f"Role {role_id} not found.")
        if object_id not in self.objects:
            raise ValueError(f"Object {object_id} not found.")
            
        # Avoid duplicate permissions
        for p in role.permissions:
            if p.object_id == object_id and p.action == action:
                return True # Permission already exists
        
        permission = Permission(object_id=object_id, action=action)
        role.permissions.append(permission)
        role.save()
        return True
        
    def revoke_permission_from_role(self, role_id: str, object_id: str, action: str):
        role = self.roles.get(role_id)
        if not role:
            raise ValueError(f"Role {role_id} not found.")

        original_length = len(role.permissions)
        role.permissions = [p for p in role.permissions 
                           if not (p.object_id == object_id and p.action == action)]
        
        if len(role.permissions) < original_length:
            role.save()
            return True
        return False # No permission was revoked
    
    def revoke_direct_permission(self, user_id: str, object_id: str, action: str):
        if user_id not in self.users:
             raise ValueError(f"User {user_id} not found.")
        if object_id not in self.objects:
            raise ValueError(f"Object {object_id} not found.")

        self.caps.remove_permission(user_id, object_id, action)
        self.caps.save()
        
        # Optional: Warning if permission still exists via RBAC (as in original code)
        rbac_allowed, _ = self._check_rbac(user_id, object_id, action)
        if rbac_allowed:
            print(f"WARNING: Direct permission '{action}' on object '{self.objects[object_id].name}' removed for user '{self.users[user_id].name}', but permission remains via RBAC.")
        return True
    
    def revoke_role_from_user(self, user_id: str, role_id: str):
        user = self.users.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found.")
        if role_id not in self.roles:
            raise ValueError(f"Role {role_id} not found or not loaded.")
        
        if role_id in user.roles:
            user.roles.remove(role_id)
            user.save()
            return True
        return False # Role was not assigned to user
    
    def _check_chinese_wall(self, user_id: str, object_id: str) -> Tuple[bool, str]:
        obj = self.objects.get(object_id)
        if not obj:
            raise ValueError(f"Object {object_id} not found for Chinese Wall check.")
        
        dataset_id = obj.dataset

        # If object's dataset is not in any conflict class, access is allowed
        if not any(dataset_id in cc.datasets for cc in self.conflict_classes.values()):
            return True, "Dataset not in any conflict class."
        
        target_conflict_class: ConflictClass = None
        for cc_instance in self.conflict_classes.values():
            if dataset_id in cc_instance.datasets:
                target_conflict_class = cc_instance
                break
        
        if not target_conflict_class:
            # Should not happen if previous check passed, but good for safety
            return True, "Dataset not associated with a known conflict class."

        # Use the consistent user_access_history cache
        user_accessed_datasets = self.user_access_history.get(user_id, [])
        for accessed_ds_id in user_accessed_datasets:
            if accessed_ds_id != dataset_id and accessed_ds_id in target_conflict_class.datasets:
                return False, f"Chinese Wall conflict: User has accessed '{self.datasets.get(accessed_ds_id, Dataset(id=accessed_ds_id, name='Unknown')).name}' which conflicts with dataset of current object."
        
        return True, "Access allowed by Chinese Wall policy."
    
    def _check_rbac(self, user_id: str, object_id: str, action: str) -> Tuple[bool, str]:
        user = self.users.get(user_id)
        if not user:
            return False, f"User {user_id} not found for RBAC check."

        for role_id in user.roles:
            role = self.roles.get(role_id)
            if not role:
                continue # Role ID present in user but role itself not loaded/defined
            
            for perm in role.permissions:
                if perm.object_id == object_id and perm.action == action:
                    return True, f"Permission '{action}' on object '{self.objects.get(object_id).name if object_id in self.objects else object_id}' granted via role '{role.name}'."
        
        return False, "Permission denied by RBAC policy."
    
    def _check_caps(self, user_id: str, object_id: str, action: str) -> Tuple[bool, str]:
        if self.caps.check_permission(user_id, object_id, action):
            return True, f"Permission '{action}' on object '{self.objects.get(object_id).name if object_id in self.objects else object_id}' granted by direct capability."
        return False, "Permission denied by direct capabilities."
    
    def check_access(self, user_id: str, object_id: str, action: str) -> Tuple[bool, str]:
        try:
            cw_allowed, cw_reason = self._check_chinese_wall(user_id, object_id)
            if not cw_allowed:
                return False, cw_reason
        except ValueError as e: # Catch specific errors like object not found
            return False, str(e)
        except Exception as e: # Catch other unexpected errors
            print(f"Error during Chinese Wall check: {e}")
            return False, "Error during Chinese Wall policy check."

        try:
            rbac_allowed, rbac_reason = self._check_rbac(user_id, object_id, action)
            if rbac_allowed:
                return True, rbac_reason
        except Exception as e:
            print(f"Error during RBAC check: {e}")
            return False, "Error during RBAC policy check."
        
        try:
            caps_allowed, caps_reason = self._check_caps(user_id, object_id, action)
            if caps_allowed:
                return True, caps_reason
        except Exception as e:
            print(f"Error during Capabilities check: {e}")
            return False, "Error during direct capabilities policy check."
            
        return False, "Access denied: No applicable permissions found."
    
    def grant_access(self, user_id: str, object_id: str, action: str) -> Tuple[bool, str]:
        allowed, reason = self.check_access(user_id, object_id, action)
        if not allowed:
            return False, f"Cannot grant access: {reason}"
        
        self.record_access(user_id, object_id) # Records access if allowed
        return True, f"Access granted for '{action}' on object '{self.objects.get(object_id).name if object_id in self.objects else object_id}'. {reason}"
        
    def user_check_permissions(self, user_id: str) -> Dict[str, Dict[str, Any]]:
        user = self.users.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found.")
            
        user_perms_summary: Dict[str, Dict[str, Any]] = {}

        # Permissions from roles
        for role_id in user.roles:
            role = self.roles.get(role_id)
            if not role: continue
            for perm in role.permissions:
                obj = self.objects.get(perm.object_id)
                if not obj: continue
                if obj.id not in user_perms_summary:
                    user_perms_summary[obj.id] = {"name": obj.name, "permissions": set()}
                user_perms_summary[obj.id]["permissions"].add(perm.action)
        
        # Direct permissions from capabilities
        if self.caps and user_id in self.caps.matrix: # Added self.caps check
            for obj_id, actions in self.caps.matrix[user_id].items():
                obj = self.objects.get(obj_id)
                if not obj: continue
                if obj.id not in user_perms_summary:
                    user_perms_summary[obj.id] = {"name": obj.name, "permissions": set()}
                for action in actions:
                    user_perms_summary[obj.id]["permissions"].add(action)
        
        # Convert sets to lists for JSON serialization
        for obj_id in user_perms_summary:
            user_perms_summary[obj_id]["permissions"] = sorted(list(user_perms_summary[obj_id]["permissions"]))
        
        return user_perms_summary

    def get_users(self):
        return [user.to_dict() for user in self.users.values()] 
    def get_roles(self):
        return [role.to_dict() for role in self.roles.values()]
    def get_objects(self):
        return [obj.to_dict() for obj in self.objects.values()]
    def get_datasets(self):
        return [ds.to_dict() for ds in self.datasets.values()]
    def get_conflict_classes(self):
        return [cc.to_dict() for cc in self.conflict_classes.values()]
        
    def get_conflict_datasets(self, conflict_class_id):
        '''
        Returns a list of datasets that are in the same conflict class as the given dataset.
        '''
        if not self.conflict_classes:
            raise ValueError("No conflict classes found")
        other_conflict_class = []
        cc_list = []
        for cc in self.conflict_classes:
            ds = list(self.conflict_classes[cc].datasets)
            if conflict_class_id in ds:
                cleaned_ds = [d for d in ds if d != conflict_class_id]
                other_conflict_class.extend(cleaned_ds)
                cc_list.append(cc)
            else:
                pass
        print(other_conflict_class, "----")

        return other_conflict_class, cc_list

    def get_access_history(self, user_id):
        """
        Returns the access history for a given user.
        """
        if user_id not in self.users:
            raise ValueError("Invalid user ID")

        user = self.users[user_id]
        return user.access_history

    def user_check_conflict_classes(self, user_id):
        """
        Returns a list of conflict classes that the user belongs to.
        """

    def update_user(self, user_id: str, name: str = None, password_str: str = None):
        user = self.users.get(user_id)
        if not user:
            return None # Or raise Exception("User not found")

        updated = False
        if name is not None and user.name != name:
            user.name = name
            updated = True
        
        if password_str is not None and password_str != "": 
            user.password_hash = hash_password_util(password_str)
            updated = True
        
        if updated:
            user.save()
            self.users[user.id] = user # Update cache
        return user

    def delete_user(self, user_id: str):
        user = self.users.get(user_id)
        if not user:
            return False # Or raise Exception("User not found")

        if user_id == 'admin':
            raise Exception("Cannot delete the primary admin user.")

        if self.caps and user_id in self.caps.matrix:
            del self.caps.matrix[user_id]
            self.caps.save()

        if user_id in self.user_access_history:
            del self.user_access_history[user_id]
            BaseModel.get_access_history_collection().delete_one({'_id': user_id})

        user.delete()
        del self.users[user_id] 
        return True

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
    pe.revoke_role_from_user(user_id=user1.id, role_id=role2.id) 
    print(pe.users.get(user1.id).roles) # Should be ['role1'] since user1 has not been assigned role2

    pe.revoke_role_from_user(user_id=user1.id, role_id=role1.id)
    print(pe.users.get(user1.id).roles) # Should be [] 

    print()
    print(pe.users.get(user1.id))
    print(pe.user_check_permissions(user_id="user1")) 
    
    print(pe.grant_access(user_id=user1.id, object_id=obj1.id, action="read")) # Should be False
