import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar,
  Toolbar,
  Button,
  Box,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import './NevigationTabs.css';

function NevigationTabs() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Function to check if a path is active
    const isActive = (path) => location.pathname === path;
    
    // Calculate the current tab value based on path
    const getTabValue = () => {
      const pathMap = {
        '/': 0,
        '/users': 1,
        '/roles': 2,
        '/objects': 3,
        '/datasets': 4, 
        '/conflict-classes': 5
      };
      return pathMap[location.pathname] || 0;
    };
    
    const handleChange = (event, newValue) => {
      const valueMap = {
        0: '/',
        1: '/users',
        2: '/roles',
        3: '/objects',
        4: '/datasets',
        5: '/conflict-classes'
      };
      navigate(valueMap[newValue]);
    };

    // For mobile view, render buttons
    if (isMobile) {
      return (
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar sx={{ flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Button 
                color="inherit"
                onClick={() => navigate('/')}
                className={isActive('/') ? 'active-tab' : ''}
                sx={{ my: 0.5 }}
              >
                Home
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/users')}
                className={isActive('/users') ? 'active-tab' : ''}
                sx={{ my: 0.5 }}
              >
                Users
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/roles')}
                className={isActive('/roles') ? 'active-tab' : ''}
                sx={{ my: 0.5 }}
              >
                Roles
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/objects')}
                className={isActive('/objects') ? 'active-tab' : ''}
                sx={{ my: 0.5 }}
              >
                Objects
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/datasets')}
                className={isActive('/datasets') ? 'active-tab' : ''}
                sx={{ my: 0.5 }}
              >
                Datasets
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/conflict-classes')}
                className={isActive('/conflict-classes') ? 'active-tab' : ''}
                sx={{ my: 0.5 }}
              >
                Conflict Classes
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      );
    }

    // For desktop view, render tabs
    return (
        <AppBar position="static" color="default" elevation={1}>
          <Tabs
            value={getTabValue()}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="navigation tabs"
          >
            <Tab label="Home" />
            <Tab label="Users" />
            <Tab label="Roles" />
            <Tab label="Objects" />
            <Tab label="Datasets" />
            <Tab label="Conflict Classes" />
          </Tabs>
        </AppBar>
    );
}

export default NevigationTabs;
