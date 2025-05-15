import React from 'react';
import PropTypes from 'prop-types';
import ObjectList from './ObjectList';
import ObjectForm from './ObjectForm';
import { Card, CardContent, Typography, Divider } from '@mui/material';

function ObjectCard({ 
  objects, 
  // Props for ObjectForm (add/edit)
  objectData, // Renamed from newObject
  setObjectData, // Renamed from setNewObject
  handleFormSubmit, // Renamed from handleAddObject
  isEditMode, // New prop for ObjectForm
  // Pass-through for ObjectForm
  datasets, 
  conflictClasses, 
  // Props for ObjectList
  onEditObject, 
  onDeleteObject 
}) {
  return (
    <Card sx={{ minWidth: 275, mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Objects
        </Typography>
        <ObjectList 
          objects={objects} 
          onEditObject={onEditObject} // Pass to ObjectList
          onDeleteObject={onDeleteObject} // Pass to ObjectList
        />
        <Divider sx={{ my: 2 }} />
        <ObjectForm 
          objectData={objectData} // Pass to ObjectForm
          setObjectData={setObjectData} // Pass to ObjectForm
          handleFormSubmit={handleFormSubmit} // Pass to ObjectForm
          isEditMode={isEditMode} // Pass to ObjectForm
          datasets={datasets} // Pass through
          conflictClasses={conflictClasses} // Pass through
        />
      </CardContent>
    </Card>
  );
}

ObjectCard.propTypes = {
  objects: PropTypes.array.isRequired,
  objectData: PropTypes.object.isRequired,
  setObjectData: PropTypes.func.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  datasets: PropTypes.array.isRequired,
  conflictClasses: PropTypes.array.isRequired,
  onEditObject: PropTypes.func.isRequired,
  onDeleteObject: PropTypes.func.isRequired,
};

export default ObjectCard;