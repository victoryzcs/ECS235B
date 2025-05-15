import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Box,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function DatasetCard({ 
  datasets, 
  newDataset, 
  setNewDataset, 
  handleAddDataset,
  handleViewDataset,
  onEditDataset,
  onDeleteDataset,
  selectedDataset,
  conflictWarning,
  setConflictWarning,
  conflictingDatasetNames,
  confirmAccessDespiteConflicts,
  loading,
  accessDenied,
  isManager,
  isEditMode,
  initialFormDataset,
  handleUpdateDataset
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    if (isEditMode && initialFormDataset) {
      setNewDataset({
        id: initialFormDataset._id,
        name: initialFormDataset.name,
        description: initialFormDataset.description || '',
        objects: initialFormDataset.objects || []
      });
    } else if (!isEditMode) {
      // Reset form if not in edit mode (e.g., after an edit is completed)
      // setNewDataset({ id: '', name: '', description: '', objects: [] });
      // This reset is better handled in the parent component (Datasets.js) after add/update actions
    }
  }, [isEditMode, initialFormDataset, setNewDataset]);
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const onViewClick = (dataset) => {
    handleViewDataset(dataset);
    if (!isManager) {
      setDialogOpen(true);
    }
  };

  const datasetsArray = Array.isArray(datasets) ? datasets : Object.values(datasets || {});

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
     
      
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Datasets
      </Typography>
      
      {datasetsArray.length === 0 ? (
        <Typography variant="body1">No datasets found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader aria-label="datasets table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datasetsArray.map(dataset => (
                <TableRow key={dataset._id}>
                  <TableCell>{dataset._id}</TableCell>
                  <TableCell>{dataset.name}</TableCell>
                  <TableCell>{dataset.description || 'No description'}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined"
                      color="primary" 
                      size="small"
                      onClick={() => onViewClick(dataset)}
                      sx={{ mr: 1 }}
                    >
                      VIEW
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => onEditDataset(dataset)} 
                      startIcon={<EditIcon />} 
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <IconButton 
                      aria-label="delete" 
                      size="small" 
                      onClick={() => onDeleteDataset(dataset._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Dialog
        open={conflictWarning}
        onClose={() => setConflictWarning(false)}
      >
        <DialogTitle>Chinese Wall Security Warning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are about to access dataset "{selectedDataset?.name}".
            </Alert>
            
            <Typography variant="body1" gutterBottom>
              This may prevent you from accessing the following datasets in the future due to conflict of interest:
            </Typography>
            
            <Typography variant="body2" sx={{ fontWeight: 'bold', my: 1 }}>
              {conflictingDatasetNames || "No conflicting datasets"}
            </Typography>
            
            <Typography variant="body1" sx={{ mt: 2 }}>
              Do you want to proceed? This action will be recorded.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictWarning(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              confirmAccessDespiteConflicts();
              setConflictWarning(false);
            }} 
            color="error" 
            variant="contained"
          >
            Proceed Anyway
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="dataset-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="dataset-dialog-title">
          {selectedDataset ? `Dataset: ${selectedDataset.name}` : 'Dataset Details'}
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : accessDenied ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Access denied. You do not have permission to view this dataset.
            </Alert>
          ) : selectedDataset && (
            <>
              <Typography variant="body1">
                <strong>ID:</strong> {selectedDataset._id}
              </Typography>
              <Typography variant="body1">
                <strong>Description:</strong> {selectedDataset.name || 'No description'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Objects:</strong>
              </Typography>
              {selectedDataset.objects && selectedDataset.objects.length > 0 ? (
                <List>
                  {selectedDataset.objects.map(obj => (
                    <ListItem key={obj}>
                      <ListItemText primary={obj} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No objects in this dataset
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h6" gutterBottom>
        {isEditMode ? 'Edit Dataset' : 'Add New Dataset'}
      </Typography>
      
      <form onSubmit={isEditMode ? (e) => { e.preventDefault(); handleUpdateDataset(); } : handleAddDataset}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Dataset ID"
              value={newDataset.id}
              onChange={e => setNewDataset({...newDataset, id: e.target.value})}
              required
              variant="outlined"
              margin="normal"
              disabled={isEditMode}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Dataset Name"
              value={newDataset.name}
              onChange={e => setNewDataset({...newDataset, name: e.target.value})}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Description"
              value={newDataset.description}
              onChange={e => setNewDataset({...newDataset, description: e.target.value})}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary">
              {isEditMode ? 'Update Dataset' : 'Add Dataset'}
            </Button>
          </Grid>
        </Grid>
      </form>
      
    </Paper>

    
  );
}

export default DatasetCard;