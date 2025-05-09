# ECS 235B Final Project (Due June 6, 3:00 PM) – Checklist

- [x] Implemented several components (for logic and backend)
- [x] Implemented Flask backend
- [x] Add more test cases under `test_models` (especially for backend)
- [ ] Implement authentication modules (e.g., login, registration)
- [ ] Create frontend (React)
- [ ] Finalize and polish implementation  
- [ ] Submit by deadline (June 6, 3:00 PM)

## Core Components

### Policy Engine

The central component that coordinates all security policy enforcement. It manages:

- Users and their roles
- Objects and their datasets
- Conflict classes that define separation requirements
- Permission checking and enforcement
- Access history tracking

### Data Models

- **User**: Represents system users with unique identifiers, names, assigned roles, and access history. Users are the actors in the system who request access to protected objects.

- **Role**: Defines a collection of permissions that can be assigned to users. Roles enable group-based access control by bundling related permissions together, simplifying permission management for administrators.

- **Object**: Represents resources that need access control (documents, files, records, etc.). Each object has a unique identifier, name, belongs to a specific dataset, and is directly linked to a conflict class for efficient policy enforcement.

- **Dataset**: Defines a logical grouping of related objects with a unique identifier and descriptive name. Datasets organize objects that share similar characteristics or belong to the same entity (e.g., company data, project files).

- **Conflict Class**: Defines sets of datasets that have conflicts of interest. Each conflict class has a unique identifier (class_id), name, and contains a list of dataset identifiers that cannot be accessed by the same user according to the Chinese Wall policy.

- **Permission**: Defines specific actions (read, write, delete, etc.) that can be performed on objects. Permissions are associated with roles or granted directly to users through the capability lists.

## How It Works

### Chinese Wall Policy Enforcement

The Chinese Wall policy prevents conflicts of interest by ensuring that once a user accesses information from one dataset, they cannot access information from a conflicting dataset (within the same conflict class).

For example:
1. If datasets A and B are in the same conflict class (e.g., competing companies)
2. Once a user accesses an object in dataset A
3. The user is automatically prevented from accessing any objects in dataset B

### Permission Checking Process

When a user attempts to access an object, the policy engine performs these checks in sequence:

1. **Chinese Wall Check**: Ensures the access doesn't violate conflict of interest constraints
2. **RBAC Check**: Verifies if the user has permission through their assigned roles
3. **ACL Check**: Checks if the user has direct permission to the object

Access is granted only if all applicable checks pass.


## Issues
- [ ] When a user signed up, the Users Management portal is not updated.
- [ ] User's access history is not updated.
- [ ] Conflict class doesn't work properly.
    
