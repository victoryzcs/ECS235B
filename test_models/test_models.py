import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models.policy_engine import PolicyEngine
from models.user import User
from models.object import Object
from models.role import Role
from models.dataset import Dataset
from models.conflict_class import ConflictClass

def test_basic_functionality():
    pe = PolicyEngine()
    print("Testing user creation...")
    user1 = User(id="test_user1", name="Test User 1")
    user2 = User(id="test_user2", name="Test User 2")
    pe.add_user(user1)
    pe.add_user(user2)
    print(f"Users created: {len(pe.users)}")
    
    print("\nTesting dataset creation...")
    dataset1 = Dataset(id="test_dataset1", name="Test Dataset 1")
    dataset2 = Dataset(id="test_dataset2", name="Test Dataset 2")
    pe.add_dataset(dataset1)
    pe.add_dataset(dataset2)
    print(f"Datasets created: {len(pe.datasets)}")
    
    print("\nTesting conflict class creation...")
    cc = ConflictClass(class_id="test_cc", name="Test Conflict Class", datasets=["test_dataset1", "test_dataset2"])
    pe.add_conflict_class(cc)
    print(f"Conflict classes created: {len(pe.conflict_classes)}")
    
    print("\nTesting object creation...")
    obj1 = Object(id="test_obj1", name="Test Object 1", dataset="test_dataset1", conflict_class="test_cc")
    obj2 = Object(id="test_obj2", name="Test Object 2", dataset="test_dataset2", conflict_class="test_cc")
    pe.add_object(obj1)
    pe.add_object(obj2)
    print(f"Objects created: {len(pe.objects)}")
    
    print("\nTesting role creation and permission assignment...")
    role = Role(id="test_role", name="Test Role")
    pe.add_role(role)
    pe.add_permission_to_role("test_role", "test_obj1", "read")
    print(f"Roles created: {len(pe.roles)}")
    print(f"Permissions for role: {len(pe.roles['test_role'].permissions)}")
    
    print("\nTesting role assignment...")
    pe.assign_role_to_user("test_user1", "test_role")
    print(f"User1 roles: {pe.users['test_user1'].roles}")
    
    print("\nTesting direct permission...")
    pe.grant_direct_permission("test_user2", "test_obj2", "read")
    
    print("\nTesting access control...")
    allowed1, reason1 = pe.check_access("test_user1", "test_obj1", "read")
    print(f"User1 access to obj1: {allowed1}, reason: {reason1}")
    
    allowed2, reason2 = pe.check_access("test_user2", "test_obj2", "read")
    print(f"User2 access to obj2: {allowed2}, reason: {reason2}")
    
    print("\nTesting Chinese Wall policy...")
    pe.record_access("test_user1", "test_obj1")
    allowed3, reason3 = pe.check_access("test_user1", "test_obj2", "read")
    print(f"User1 access to obj2 after accessing obj1: {allowed3}, reason: {reason3}")
    
    print("\nTesting user permissions...")
    permissions = pe.user_check_permissions("test_user1")
    print(f"User1 permissions: {permissions}")



if __name__ == "__main__":
    print("Running basic functionality tests...")
    test_basic_functionality()
    print("\nAll tests completed.")