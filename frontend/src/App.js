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
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Signup from './pages/Signup';
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
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <main className='App-main'>
            <div className='dashboard'>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={
                    <>
                      <NevigationTabs />
                      <Home />
                    </>
                  } />
                  <Route path="/users" element={
                    <>
                      <NevigationTabs />
                      <Users />
                    </>
                  } />
                  <Route path="/roles" element={
                    <>
                      <NevigationTabs />
                      <Roles />
                    </>
                  } />
                  <Route path="/objects" element={
                    <>
                      <NevigationTabs />
                      <Objects />
                    </>
                  } />
                  <Route path="/datasets" element={
                    <>
                      <NevigationTabs />
                      <Datasets />
                    </>
                  } />
                  <Route path="/conflict-classes" element={
                    <>
                      <NevigationTabs />
                      <ConflictClasses />
                    </>
                  } />
                </Route>
                <Route path="/signup" element={
                  <>
                    <Signup />
                  </>
                }/>
              </Routes>
            </div>
          </main>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
