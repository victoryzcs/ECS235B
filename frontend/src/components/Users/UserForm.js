import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Box,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function UserForm({ 
  userData,
  setUserData,
  handleUserFormSubmit,
  isEditMode,
  handleAssignRole,
  handleGrantPermission,
  users
}) {
  const [roles, setRoles] = useState([]);
  const [objects, setObjects] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [permissionData, setPermissionData] = useState({
    userId: '',
    objectId: '',
    action: ''
  });
  
  const auth = useAuth();
  const isManager = auth?.isManager;
  const isAdmin = auth?.isAdmin;
  useEffect(() => {
    fetchRoles();
    fetchObjects();
    if (isEditMode && userData) {
      setUserData(prevData => ({...prevData, password: ''}));
    } else if (!isEditMode) {
    }
  }, [isEditMode, userData, setUserData]);
  
  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/roles');
      const data = await response.json();
      setRoles(Object.values(data));
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchObjects = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/objects');
      const data = await response.json();
      console.log('Objects:', data);
      setObjects(Object.values(data));
    } catch (error) {
      console.error('Error fetching objects:', error);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePermissionChange = (e) => {
    const { name, value } = e.target;
    setPermissionData({
      ...permissionData,
      [name]: value
    });
  };

  const handlePermissionSubmit = (e) => {
    e.preventDefault();
    console.log('Permission Data:', permissionData);
    handleGrantPermission(permissionData.userId, permissionData.objectId, permissionData.action);
    setPermissionData({
      userId: '',
      objectId: '',
      action: ''
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Add User" />
          <Tab label="Assign Role" />
          <Tab label="Grant Permission" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {isEditMode ? 'Edit User' : 'Add New User'}
          </Typography>
          <form onSubmit={(e) => { e.preventDefault(); handleUserFormSubmit(); }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={isEditMode ? 6 : 5}>
                <TextField
                  fullWidth
                  label="User ID"
                  value={userData.id || ''}
                  onChange={e => setUserData({...userData, id: e.target.value})}
                  required
                  variant="outlined"
                  margin="normal"
                  disabled={isEditMode}
                />
              </Grid>
              <Grid item xs={12} md={isEditMode ? 6 : 5}>
                <TextField
                  fullWidth
                  label="User Name"
                  value={userData.name || ''}
                  onChange={e => setUserData({...userData, name: e.target.value})}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              {isEditMode && (
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="New Password (optional)"
                    type="password"
                    value={userData.password || ''}
                    onChange={e => setUserData({...userData, password: e.target.value})}
                    variant="outlined"
                    margin="normal"
                    helperText="Leave blank to keep current password."
                  />
                </Grid>
              )}
              <Grid item xs={12} md={isEditMode ? 12 : 2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: isEditMode ? 0 : 2 }}>
                <Button type="submit" variant="contained" color="primary">
                  {isEditMode ? 'Update User' : 'Add User'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAssignRole(selectedUserId, selectedRole);
            setSelectedUserId('');
            setSelectedRole('');
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>User</InputLabel>
                  <Select
                    value={selectedUserId}
                    onChange={e => {
                      console.log('Assign Role - Selected User ID:', e.target.value);
                      setSelectedUserId(e.target.value);
                    }}
                    label="User"
                    required
                  >
                    <MenuItem value="">
                      <em>Select a user</em>
                    </MenuItem>
                    {users
                    .filter(user => {
                      if (isManager) {
                        if (typeof user?._id !== 'string') {
                          return false;
                        }
                        return user._id.toLowerCase()!=='admin' && !user._id.toLowerCase().startsWith("manager");
                      }
                      return true;
                    })
                    .map((user, index) => (
                      <MenuItem key={user._id != null ? user._id : `user-${index}`} value={user._id != null ? user._id : ''}>
                        {(user._id != null ? user._id : 'N/A')} - {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select user to assign a role</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedRole}
                    onChange={e => {
                      console.log('Assign Role - Selected Role ID:', e.target.value);
                      setSelectedRole(e.target.value);
                    }}
                    label="Role"
                    required
                  >
                    <MenuItem value="">
                      <em>Select a role</em>
                    </MenuItem>
                    {roles
                    .filter(role => {
                      if (isManager) {
                        return role._id.toLowerCase() !== 'manager' && role._id.toLowerCase() !== 'admin';
                      }
                      return true;
                    })
                    .map((role, index) => (
                      <MenuItem key={role._id != null ? role._id : `role-${index}`} value={role._id != null ? role._id : ''}>
                        {(role._id != null ? role._id : 'N/A')} - {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select role to assign</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                  Assign Role
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <form onSubmit={handlePermissionSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>User</InputLabel>
                  <Select
                    name="userId"
                    value={permissionData.userId}
                    onChange={handlePermissionChange}
                    label="User"
                    required
                  >
                    <MenuItem value="">
                      <em>Select a user</em>
                    </MenuItem>
                    {users
                    .filter(user => {
                      if (isAdmin) {
                        return !user.roles.includes("admin"); // Admin can grant to managers and workers
                      } else if (isManager) {
                        return !user.roles.includes("admin") && !user.roles.includes("manager"); // Managers can only grant to workers
                      }
                      return false; // Other roles cannot grant permissions
                    })
                    .map(user => (
                      <MenuItem key={user._id} value={user._id}>
                        {user._id} - {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select user for the permission</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel id='object-select-label'>Object</InputLabel>
                  <Select
                    name="objectId"
                    value={permissionData.objectId}
                    onChange={handlePermissionChange}
                    label="Object"
                    required
                  >
                    <MenuItem value="">
                      <em>Select an object</em>
                    </MenuItem>
                    {objects.map(obj => (
                      <MenuItem key={obj._id} value={obj._id}>
                        {obj._id} - {obj.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select object for the permission</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel id="action-select-label">Permission Action</InputLabel>
                  <Select
                    name="action"
                    value={permissionData.action}
                    onChange={handlePermissionChange}
                    label="Permission Action"
                    labelId="action-select-label"
                    required
                  >
                    <MenuItem value="">
                      <em>Select an action</em>
                    </MenuItem>
                    <MenuItem value="read">Read</MenuItem>
                    {!isManager && <MenuItem value="write">Write</MenuItem>}
                  </Select>
                  <FormHelperText>
                    {isManager ? "Managers can only grant read permissions to workers" : "Select the permission to grant"}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                  Grant Permission
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
      </Paper>
    </Box>
  );
}

UserForm.propTypes = {
  userData: PropTypes.object.isRequired,
  setUserData: PropTypes.func.isRequired,
  handleUserFormSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
  handleAssignRole: PropTypes.func.isRequired,
  handleGrantPermission: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
};

export default UserForm;