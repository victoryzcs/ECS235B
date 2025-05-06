import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import NevigationTabs from './components/Nevigation/NevigationTabs';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Home from './pages/Home';
import Objects from './pages/Objects';
import Datasets from './pages/Datasets';
import ConflictClasses from './pages/ConflictClasses';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <main className='App-main'>
          <div className='dashboard'>
            <NevigationTabs />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/objects" element={<Objects />} />
              <Route path="/datasets" element={<Datasets />} />
              <Route path="/conflict-classes" element={<ConflictClasses />} />
            </Routes>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
