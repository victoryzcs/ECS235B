import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import unittest
from models.policy_engine import PolicyEngine
from models.user import User
from models.role import Role, Permission
from models.dataset import Dataset
from models.object import Object
from models.conflict_class import ConflictClass
from models.capability_lists import CapabilityList

# Dummy in-memory DB to override real database operations
class DummyDatabase:
    def __init__(self):
        self.data = {
            'roles': {},
            'users': {},
            'objects': {},
            'datasets': {},
            'conflict_classes': {},
            'capability_lists': {},
            'access_history': {}
        }
    def get_all_documents(self, collection):
        return list(self.data.get(collection, {}).values())
    def save_document(self, collection, document):
        doc_id = document.get('_id')
        self.data.setdefault(collection, {})[doc_id] = document

class TestPolicyEngine(unittest.TestCase):
    def setUp(self):
        self.pe = PolicyEngine()
        # Override with dummy DB and reinitialize internal data
        self.pe.db = DummyDatabase()
        self.pe.roles = {}
        self.pe.users = {}
        self.pe.objects = {}
        self.pe.datasets = {}
        self.pe.conflict_classes = {}
        self.pe.user_access_history = {}
        self.pe.caps = CapabilityList()

    def test_add_user_and_role(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        self.assertIn("user1", self.pe.users)
        
        role = Role(id="role1", name="Test Role")
        self.pe.add_role(role)
        self.assertIn("role1", self.pe.roles)
        
        # Valid role assignment
        self.pe.assign_role_to_user("user1", "role1")
        self.assertIn("role1", self.pe.users["user1"].roles)
        
        # Invalid user/role
        with self.assertRaises(ValueError):
            self.pe.assign_role_to_user("nonexistent", "role1")
        with self.assertRaises(ValueError):
            self.pe.assign_role_to_user("user1", "nonexistent")

    def test_add_object_and_dataset(self):
        ds = Dataset(id="ds1", name="Dataset 1")
        self.pe.add_dataset(ds)
        self.assertIn("ds1", self.pe.datasets)
        
        # Valid object addition
        obj = Object(id="obj1", name="Object 1", dataset="ds1", conflict_class="")
        self.pe.add_object(obj)
        self.assertIn("obj1", self.pe.objects)
        self.assertIn("obj1", self.pe.datasets["ds1"].objects)
        
        # Object with invalid dataset
        obj_invalid = Object(id="obj2", name="Object 2", dataset="invalid_ds", conflict_class="")
        with self.assertRaises(Exception):
            self.pe.add_object(obj_invalid)

    def test_direct_permission_and_caps(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        ds = Dataset(id="ds1", name="Dataset 1")
        self.pe.add_dataset(ds)
        obj = Object(id="obj1", name="Object 1", dataset="ds1", conflict_class="")
        self.pe.add_object(obj)
        
        # Grant direct permission and check
        res = self.pe.grant_direct_permission("user1", "obj1", "read")
        self.assertTrue(res)
        self.assertTrue(self.pe.caps.check_permission("user1", "obj1", "read"))
        
        # Invalid grant parameters
        with self.assertRaises(ValueError):
            self.pe.grant_direct_permission("nonexistent", "obj1", "read")
        with self.assertRaises(ValueError):
            self.pe.grant_direct_permission("user1", "nonexistent", "read")

    def test_record_access(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        ds = Dataset(id="ds1", name="Dataset 1")
        ds.objects = []
        self.pe.add_dataset(ds)
        obj = Object(id="obj1", name="Object 1", dataset="ds1", conflict_class="")
        self.pe.add_object(obj)
        
        # Record access once
        res = self.pe.record_access("user1", "obj1")
        self.assertTrue(res)
        self.assertIn("ds1", self.pe.user_access_history.get("user1", []))
        self.assertIn("ds1", self.pe.users["user1"].access_history)
        
        # Second call should not duplicate
        self.pe.record_access("user1", "obj1")
        self.assertEqual(self.pe.user_access_history["user1"].count("ds1"), 1)

    def test_permission_role_management(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        role = Role(id="role1", name="Test Role")
        self.pe.add_role(role)
        ds = Dataset(id="ds1", name="Dataset 1")
        self.pe.add_dataset(ds)
        obj = Object(id="obj1", name="Object 1", dataset="ds1", conflict_class="")
        self.pe.add_object(obj)
        
        # Add and revoke permission on role
        res = self.pe.add_permission_to_role("role1", "obj1", "read")
        self.assertTrue(res)
        self.assertTrue(any(p.action == "read" for p in self.pe.roles["role1"].permissions))
        
        res = self.pe.revoke_permission_from_role("role1", "obj1", "read")
        self.assertTrue(res)
        self.assertFalse(any(p.action == "read" for p in self.pe.roles["role1"].permissions))
        res = self.pe.revoke_permission_from_role("role1", "obj1", "read")
        self.assertFalse(res)

    def test_revoked_direct_permission_warning(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        ds = Dataset(id="ds1", name="Dataset 1")
        self.pe.add_dataset(ds)
        obj = Object(id="obj1", name="Object 1", dataset="ds1", conflict_class="")
        self.pe.add_object(obj)
        
        # Grant then revoke direct permission
        self.pe.grant_direct_permission("user1", "obj1", "read")
        self.assertTrue(self.pe.caps.check_permission("user1", "obj1", "read"))
        res = self.pe.revoke_direct_permission("user1", "obj1", "read")
        self.assertTrue(res)
        self.assertFalse(self.pe.caps.check_permission("user1", "obj1", "read"))

    def test_chinese_wall(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        ds1 = Dataset(id="ds1", name="Dataset 1")
        ds2 = Dataset(id="ds2", name="Dataset 2")
        self.pe.add_dataset(ds1)
        self.pe.add_dataset(ds2)
        obj1 = Object(id="obj1", name="Object 1", dataset="ds1", conflict_class="cc1")
        obj2 = Object(id="obj2", name="Object 2", dataset="ds2", conflict_class="cc1")
        self.pe.add_object(obj1)
        self.pe.add_object(obj2)
        conflict = ConflictClass(class_id="cc1", name="Conflict 1", datasets=["ds1", "ds2"])
        self.pe.add_conflict_class(conflict)
        
        allowed, _ = self.pe._check_chinese_wall("user1", "obj1")
        self.assertTrue(allowed)
        self.pe.record_access("user1", "obj1")
        allowed, _ = self.pe._check_chinese_wall("user1", "obj2")
        self.assertFalse(allowed)
    
    def test_rbac_and_caps_check_in_access(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        role = Role(id="role1", name="Test Role")
        self.pe.add_role(role)
        ds = Dataset(id="ds1", name="Dataset 1")
        self.pe.add_dataset(ds)
        obj = Object(id="obj1", name="Object 1", dataset="ds1", conflict_class="")
        self.pe.add_object(obj)
        
        allowed, _ = self.pe.check_access("user1", "obj1", "read")
        self.assertFalse(allowed)
        self.pe.grant_direct_permission("user1", "obj1", "read")
        allowed, _ = self.pe.check_access("user1", "obj1", "read")
        self.assertTrue(allowed)
        self.pe.revoke_direct_permission("user1", "obj1", "read")
        self.pe.add_permission_to_role("role1", "obj1", "read")
        self.pe.assign_role_to_user("user1", "role1")
        allowed, _ = self.pe.check_access("user1", "obj1", "read")
        self.assertTrue(allowed)

    def test_grant_access(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        ds = Dataset(id="ds1", name="Dataset 1")
        self.pe.add_dataset(ds)
        obj = Object(id="obj1", name="Object 1", dataset="ds1", conflict_class="")
        self.pe.add_object(obj)
        success, _ = self.pe.grant_access("user1", "obj1", "read")
        self.assertFalse(success)
        role = Role(id="role1", name="Test Role")
        self.pe.add_role(role)
        self.pe.add_permission_to_role("role1", "obj1", "read")
        self.pe.assign_role_to_user("user1", "role1")
        success, _ = self.pe.grant_access("user1", "obj1", "read")
        self.assertTrue(success)
    
    def test_user_check_permissions(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        ds = Dataset(id="ds1", name="Dataset 1")
        self.pe.add_dataset(ds)
        obj1 = Object(id="obj1", name="Object 1", dataset="ds1", conflict_class="")
        obj2 = Object(id="obj2", name="Object 2", dataset="ds1", conflict_class="")
        self.pe.add_object(obj1)
        self.pe.add_object(obj2)
        role = Role(id="role1", name="Test Role")
        self.pe.add_role(role)
        self.pe.add_permission_to_role("role1", "obj1", "read")
        self.pe.assign_role_to_user("user1", "role1")
        self.pe.grant_direct_permission("user1", "obj2", "write")
        perms = self.pe.user_check_permissions("user1")
        self.assertIn("obj1", perms)
        self.assertIn("read", perms["obj1"]["permissions"])
        self.assertIn("obj2", perms)
        self.assertIn("write", perms["obj2"]["permissions"])
    
    def test_remoke_role_from_user(self):
        user = User(id="user1", name="Test User")
        self.pe.add_user(user)
        role1 = Role(id="role1", name="Role1")
        role2 = Role(id="role2", name="Role2")
        self.pe.add_role(role1)
        self.pe.add_role(role2)
        self.pe.assign_role_to_user("user1", "role1")
        self.pe.assign_role_to_user("user1", "role2")
        with self.assertRaises(ValueError):
            self.pe.remoke_role_from_user("user1", "nonexistent")
        self.assertEqual(set(self.pe.users["user1"].roles), {"role1", "role2"})
        self.pe.remoke_role_from_user("user1", "role1")
        self.assertNotIn("role1", self.pe.users["user1"].roles)
        
    def test_edge_cases(self):
        with self.assertRaises(ValueError):
            self.pe.assign_role_to_user("", "role1")
        with self.assertRaises(ValueError):
            self.pe.grant_direct_permission("", "obj1", "read")
        with self.assertRaises(ValueError):
            self.pe.record_access("", "obj1")
        
        allowed, _ = self.pe.check_access("", "", "read")
        self.assertFalse(allowed)

if __name__ == "__main__":
    unittest.main()