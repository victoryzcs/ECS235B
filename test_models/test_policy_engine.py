import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.policy_engine import PolicyEngine, User, Role, Permission, Object, Dataset, ConflictClass
print("=== Policy Engine Tests ===")

pe = PolicyEngine()

print("=== Setting up test environment ===")

# Create datasets
financial_dataset = Dataset(id="financial", name="Financial Data")
customer_dataset = Dataset(id="customer", name="Customer Data")
product_dataset = Dataset(id="product", name="Product Data")
public_dataset = Dataset(id="public", name="Public Data")

pe.add_dataset(financial_dataset)
pe.add_dataset(customer_dataset)
pe.add_dataset(product_dataset)
pe.add_dataset(public_dataset)
print(f"Added datasets: {list(pe.datasets.keys())}")

# Create conflict classes
financial_cc = ConflictClass(class_id="financial_cc", name="Financial Conflict Class")
financial_cc.datasets.append("financial")
financial_cc.datasets.append("customer")

product_cc = ConflictClass(class_id="product_cc", name="Product Conflict Class")
product_cc.datasets.append("product")

pe.add_conflict_class(financial_cc)
pe.add_conflict_class(product_cc)
print(f"Added conflict classes: {list(pe.conflict_classes.keys())}")

# Create objects
financial_report = Object(id="financial_report", name="Financial Report", dataset="financial", conflict_class="financial_cc")
customer_list = Object(id="customer_list", name="Customer List", dataset="customer", conflict_class="financial_cc")
product_specs = Object(id="product_specs", name="Product Specifications", dataset="product", conflict_class="product_cc")
public_doc = Object(id="public_doc", name="Public Document", dataset="public", conflict_class="")  # No conflict class for public data

pe.add_object(financial_report)
pe.add_object(customer_list)
pe.add_object(product_specs)
pe.add_object(public_doc)
print(f"Added objects: {list(pe.objects.keys())}")

# Create roles with permissions
admin_role = Role(
    id="admin", 
    name="Administrator",
    permissions=[
        Permission(object_id="financial_report", action="read"),
        Permission(object_id="financial_report", action="write"),
        Permission(object_id="customer_list", action="read"),
        Permission(object_id="customer_list", action="write"),
        Permission(object_id="product_specs", action="read"),
        Permission(object_id="product_specs", action="write"),
        Permission(object_id="public_doc", action="read"),
        Permission(object_id="public_doc", action="write"),
    ]
)

financial_analyst_role = Role(
    id="financial_analyst", 
    name="Financial Analyst",
    permissions=[
        Permission(object_id="financial_report", action="read"),
        Permission(object_id="financial_report", action="write"),
        Permission(object_id="public_doc", action="read"),
    ]
)

customer_rep_role = Role(
    id="customer_rep", 
    name="Customer Representative",
    permissions=[
        Permission(object_id="customer_list", action="read"),
        Permission(object_id="public_doc", action="read"),
    ]
)

product_manager_role = Role(
    id="product_manager", 
    name="Product Manager",
    permissions=[
        Permission(object_id="product_specs", action="read"),
        Permission(object_id="product_specs", action="write"),
        Permission(object_id="public_doc", action="read"),
    ]
)

guest_role = Role(
    id="guest", 
    name="Guest",
    permissions=[
        Permission(object_id="public_doc", action="read"),
    ]
)

pe.add_role(admin_role)
pe.add_role(financial_analyst_role)
pe.add_role(customer_rep_role)
pe.add_role(product_manager_role)
pe.add_role(guest_role)
print(f"Added roles: {list(pe.roles.keys())}")

# Create users with different roles
admin_user = User(id="admin_user", name="Admin User", roles=["admin"], access_history=[])
alice = User(id="alice", name="Alice", roles=["financial_analyst"], access_history=[])
bob = User(id="bob", name="Bob", roles=["customer_rep"], access_history=[])
charlie = User(id="charlie", name="Charlie", roles=["product_manager"], access_history=[])
dave = User(id="dave", name="Dave", roles=["guest"], access_history=[])
eve = User(id="eve", name="Eve", roles=["financial_analyst", "customer_rep"], access_history=[])

pe.add_user(admin_user)
pe.add_user(alice)
pe.add_user(bob)
pe.add_user(charlie)
pe.add_user(dave)
pe.add_user(eve)
print(f"Added users: {list(pe.users.keys())}")

# Add direct permissions (ACM)
pe.grant_direct_permission("alice", "public_doc", "write")  # Extra permission not in role
pe.grant_direct_permission("dave", "customer_list", "read")  # Guest with special permission
print("Added direct permissions to Alice and Dave")

print("\n=== Testing Access Control ===")

# Test 1: Basic RBAC permissions
print("\nTest 1: Basic RBAC permissions")
test_cases = [
    ("admin_user", "financial_report", "read", "Admin should read financial report"),
    ("alice", "financial_report", "read", "Financial analyst should read financial report"),
    ("alice", "customer_list", "read", "Financial analyst should NOT read customer list"),
    ("bob", "customer_list", "read", "Customer rep should read customer list"),
    ("bob", "financial_report", "read", "Customer rep should NOT read financial report"),
    ("charlie", "product_specs", "write", "Product manager should write product specs"),
    ("dave", "public_doc", "read", "Guest should read public doc"),
    ("dave", "financial_report", "read", "Guest should NOT read financial report"),
]

for user_id, object_id, action, description in test_cases:
    allowed, reason = pe.check_access(user_id, object_id, action)
    print(f"  {description}: {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

# Test 2: Direct ACM permissions
print("\nTest 2: Direct ACM permissions")
test_cases = [
    ("alice", "public_doc", "write", "Alice should write public doc via direct permission"),
    ("dave", "customer_list", "read", "Dave should read customer list via direct permission"),
]

for user_id, object_id, action, description in test_cases:
    allowed, reason = pe.check_access(user_id, object_id, action)
    print(f"  {description}: {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

# Test 3: Chinese Wall policy
print("\nTest 3: Chinese Wall policy")

# First access to financial dataset
print("  Eve accesses financial report...")
pe.record_access("eve", "financial_report")

# Try to access customer dataset (in same conflict class)
allowed, reason = pe.check_access("eve", "customer_list", "read")
print(f"  Eve tries to access customer list: {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

# Different user accessing customer dataset first
print("  Bob accesses customer list...")
pe.record_access("bob", "customer_list")

# Try to access financial dataset (in same conflict class)
allowed, reason = pe.check_access("bob", "financial_report", "read")
print(f"  Bob tries to access financial report: {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

# Access to dataset in different conflict class should be allowed
allowed, reason = pe.check_access("eve", "product_specs", "read")
print(f"  Eve tries to access product specs (different conflict class): {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

# Test 4: Role assignment and revocation
print("\nTest 4: Role assignment and revocation")

# Assign new role to user
print("  Assigning product_manager role to Alice...")
pe.assign_role_to_user("alice", "product_manager")

# Check if new permissions are effective
allowed, reason = pe.check_access("alice", "product_specs", "write")
print(f"  Alice tries to write product specs with new role: {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

# Revoke role
print("  Revoking financial_analyst role from Alice...")
pe.remoke_role_from_user("alice", "financial_analyst")

# Check if old permissions are revoked
allowed, reason = pe.check_access("alice", "financial_report", "read")
print(f"  Alice tries to read financial report after role revocation: {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

# Test 5: Complex scenario - multiple roles and policies
print("\nTest 5: Complex scenario - multiple roles and policies")

# Create a user with multiple roles
multi_role_user = User(id="multi_user", name="Multi-Role User", roles=["financial_analyst", "product_manager"], access_history=[])
pe.add_user(multi_role_user)

# Check permissions from different roles
allowed, reason = pe.check_access("multi_user", "financial_report", "read")
print(f"  Multi-role user reads financial report: {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

allowed, reason = pe.check_access("multi_user", "product_specs", "write")
print(f"  Multi-role user writes product specs: {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

# Record access to financial dataset
print("  Multi-role user accesses financial report...")
pe.record_access("multi_user", "financial_report")

# Try to access customer dataset (in same conflict class)
allowed, reason = pe.check_access("multi_user", "customer_list", "read")
print(f"  Multi-role user tries to access customer list: {'✅ Allowed' if allowed else '❌ Denied'} - {reason}")

# Test 6: Grant access and record history
print("\nTest 6: Grant access and record history")

# Grant access to Charlie for product specs
success, message = pe.grant_access("charlie", "product_specs", "read")
print(f"  Grant access to Charlie for product specs: {'✅ Success' if success else '❌ Failed'} - {message}")

# Check if access history is updated
has_history = "product" in pe.user_access_history.get("charlie", [])
print(f"  Charlie's access history includes product dataset: {'✅ Yes' if has_history else '❌ No'}")

# Try to grant access that should be denied by Chinese Wall
success, message = pe.grant_access("eve", "customer_list", "read")
print(f"  Grant access to Eve for customer list (should be denied by Chinese Wall): {'✅ Success' if success else '❌ Failed'} - {message}")

print("\n=== Test Summary ===")
print(f"Users: {len(pe.users)}")
print(f"Roles: {len(pe.roles)}")
print(f"Objects: {len(pe.objects)}")
print(f"Datasets: {len(pe.datasets)}")
print(f"Conflict Classes: {len(pe.conflict_classes)}")
print(f"User Access History: {pe.user_access_history}")