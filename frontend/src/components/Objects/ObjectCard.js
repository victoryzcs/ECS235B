import React from 'react';
import ObjectList from './ObjectList';
import ObjectForm from './ObjectForm';
import { Card, CardContent, Typography, Divider } from '@mui/material';

function ObjectCard({ objects, newObject, setNewObject, handleAddObject, datasets, conflictClasses }) {
  return (
    <Card sx={{ minWidth: 275, mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Objects
        </Typography>
        <ObjectList objects={objects} />
        <Divider sx={{ my: 2 }} />
        <ObjectForm 
          newObject={newObject} 
          setNewObject={setNewObject} 
          handleAddObject={handleAddObject}
          datasets={datasets}
          conflictClasses={conflictClasses}
        />
      </CardContent>
    </Card>
  );
}

export default ObjectCard;