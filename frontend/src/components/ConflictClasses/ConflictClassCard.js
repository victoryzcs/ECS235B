import React from 'react';
import ConflictClassList from './ConflictClassList';
import ConflictClassForm from './ConflictClassForm';
import { Card, CardContent, Typography, Divider } from '@mui/material';

function ConflictClassCard({ 
  conflictClasses, 
  newConflictClass, 
  setNewConflictClass, 
  handleAddConflictClass, 
  datasets,
  onEditConflictClass,
  onDeleteConflictClass,
  isEditMode,
  initialData,
  handleUpdateConflictClass
}) {
  return (
    <Card sx={{ minWidth: 275, mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Conflict Classes
        </Typography>
        <ConflictClassList 
          conflictClasses={conflictClasses} 
          onEdit={onEditConflictClass}
          onDelete={onDeleteConflictClass}
        />
        <Divider sx={{ my: 2 }} />
        <ConflictClassForm 
          newConflictClass={newConflictClass} 
          setNewConflictClass={setNewConflictClass} 
          handleAddConflictClass={handleAddConflictClass}
          datasets={datasets}
          isEditMode={isEditMode}
          initialData={initialData}
          handleUpdateConflictClass={handleUpdateConflictClass}
        />
      </CardContent>
    </Card>
  );
}

export default ConflictClassCard;