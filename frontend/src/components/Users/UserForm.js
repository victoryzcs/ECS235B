import React, { useState, useEffect } from 'react';
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
  Divider,
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

function UserForm({ newUser, setNewUser, handleAddUser, handleAssignRole, handleGrantPermission, users }) {
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
  
  useEffect(() => {
    fetchRoles();
    fetchObjects();
  }, []);
  
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
          <form onSubmit={handleAddUser}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="User ID"
                  value={newUser.id}
                  onChange={e => setNewUser({...newUser, id: e.target.value})}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="User Name"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                  Add User
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
                    onChange={e => setSelectedUserId(e.target.value)}
                    label="User"
                    required
                  >
                    <MenuItem value="">
                      <em>Select a user</em>
                    </MenuItem>
                    {users
                    .filter(user => {
                      if (isManager) {
                        return user.id.toLowerCase()!=='admin' && !user.id.toLowerCase().startsWith("manager");
                      }
                      return true;
                    })
                    .map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.id} - {user.name}
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
                    onChange={e => setSelectedRole(e.target.value)}
                    label="Role"
                    required
                  >
                    <MenuItem value="">
                      <em>Select a role</em>
                    </MenuItem>
                    {roles
                    .filter(role => {
                      if (isManager) {
                        return role.name.toLowerCase() !== 'manager' && role.name.toLowerCase() !== 'admin';
                      }
                      return true;
                    })
                    .map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.id} - {role.name}
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
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.id} - {user.name}
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
                      <MenuItem key={obj.id} value={obj.id}>
                        {obj.id} - {obj.name}
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

export default UserForm;