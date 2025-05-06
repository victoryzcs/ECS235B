import React from 'react';
import DatasetList from './DatasetList';
import DatasetForm from './DatasetForm';
import { Card, CardContent, Typography, Divider } from '@mui/material';

function DatasetCard({ datasets, newDataset, setNewDataset, handleAddDataset }) {
  return (
    <Card sx={{ minWidth: 275, mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Datasets
        </Typography>
        <DatasetList datasets={datasets} />
        <Divider sx={{ my: 2 }} />
        <DatasetForm 
          newDataset={newDataset} 
          setNewDataset={setNewDataset} 
          handleAddDataset={handleAddDataset}
        />
      </CardContent>
    </Card>
  );
}

export default DatasetCard;