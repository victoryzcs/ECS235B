import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import ObjectViewer from './ObjectViewer';

function ObjectList({ objects: allObjects, onEditObject, onDeleteObject }) {
  const [filteredObjects, setFilteredObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedObject, setSelectedObject] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const isAdmin = auth?.isAdmin;
  const isManager = auth?.isManager;

  useEffect(() => {
    if (isAdmin) {
      setFilteredObjects(allObjects);
      setLoading(false);
      return;
    }

    const checkObjectPermissions = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const permittedObjects = [];
      console.log('allObjects:', allObjects);
      for (const object of allObjects) {
        try {
          if (isManager) {
            permittedObjects.push(object);
            continue;
          }
          
          const response = await fetch('http://localhost:8080/api/check_access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              user_id: currentUser?.id,
              object_id: object._id,
              action: 'read'
            })
          });
          
          const data = await response.json();
          
          if (response.ok && data.allowed === true) {
            permittedObjects.push(object);
          }
        } catch (error) {
          console.error(`Error checking permission for object ${object.id}:`, error);
        }
      }
      
      setFilteredObjects(permittedObjects);
      setLoading(false);
    };
    
    if (currentUser && allObjects.length > 0) {
      checkObjectPermissions();
    } else {
      setFilteredObjects([]);
      setLoading(false);
    }
  }, [allObjects, currentUser, isAdmin, isManager]);

  const handleObjectClick = (object) => {
    setSelectedObject(object);
    setViewerOpen(true);
  };

  const handleViewerClose = () => {
    setViewerOpen(false);
    setSelectedObject(null);
  };

  const handleAccessRecorded = () => {
    // Refresh the objects list to reflect any changes
    //setLoading(true);
    // You might want to add a refresh function here if needed
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {filteredObjects.length === 0 ? (
        <Typography variant="body1">
          {allObjects.length === 0 
            ? "No objects found" 
            : "You don't have permission to view any objects"}
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table stickyHeader aria-label="objects table">
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Dataset</strong></TableCell>
                  <TableCell><strong>Conflict Class</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredObjects.map(object => (
                  <TableRow 
                    key={object._id} 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell component="th" scope="row">{object._id}</TableCell>
                    <TableCell>{object.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={object.dataset} 
                        size="small" 
                        sx={{ background: '#e3f2fd' }} 
                      />
                    </TableCell>
                    <TableCell>
                      {object.conflict_class ? (
                        <Chip 
                          label={object.conflict_class} 
                          size="small" 
                          sx={{ background: '#fff8e1' }} 
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">None</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Object">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleObjectClick(object);
                          }}
                          sx={{ mr: 0.5 }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {(isAdmin || isManager) && (
                        <Tooltip title="Edit Object">
                          <IconButton 
                            size="small" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onEditObject(object); 
                            }}
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(isAdmin || isManager) && (
                        <Tooltip title="Delete Object">
                          <IconButton 
                            aria-label="delete" 
                            size="small" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onDeleteObject(object._id); 
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <ObjectViewer
            open={viewerOpen}
            onClose={handleViewerClose}
            object={selectedObject}
            onAccessRecorded={handleAccessRecorded}
          />
        </>
      )}
    </Box>
  );
}

ObjectList.propTypes = {
  objects: PropTypes.array.isRequired,
  onEditObject: PropTypes.func.isRequired,
  onDeleteObject: PropTypes.func.isRequired,
};

export default ObjectList;