import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Box, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import './NevigationTabs.css';
import { useAuth } from '../../contexts/AuthContext';

function NevigationTabs() {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    
    const currentUser = auth?.currentUser;
    const logout = auth?.logout;
    const isAdmin = auth?.isAdmin;
    const isManager = auth?.isManager;
    const isWorker = auth?.isWorker;
    
    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        if (logout) {
            logout();
            navigate('/login');
        }
    };

    const handleChangePassword = () => {
        navigate('/change-password');
    };

    return (
        <div className="navigation-container">
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                <Button 
                    variant='contained' 
                    onClick={() => navigate('/')}
                    className={isActive('/') ? 'active-tab' : ''}
                >
                    Home
                </Button>
                
                {/* Admin has access to everything */}
                {isAdmin && (
                    <>
                        <Button 
                            variant='contained' 
                            onClick={() => navigate('/users')}
                            className={isActive('/users') ? 'active-tab' : ''}
                        >
                            Users
                        </Button>
                        <Button 
                            variant='contained' 
                            onClick={() => navigate('/roles')}
                            className={isActive('/roles') ? 'active-tab' : ''}
                        >
                            Roles
                        </Button>
                        <Button 
                            variant='contained' 
                            onClick={() => navigate('/objects')}
                            className={isActive('/objects') ? 'active-tab' : ''}
                        >
                            Objects
                        </Button>
                        <Button 
                            variant='contained' 
                            onClick={() => navigate('/datasets')}
                            className={isActive('/datasets') ? 'active-tab' : ''}
                        >
                            Datasets
                        </Button>
                        <Button 
                            variant='contained' 
                            onClick={() => navigate('/conflict-classes')}
                            className={isActive('/conflict-classes') ? 'active-tab' : ''}
                        >
                            Conflict Classes
                        </Button>
                    </>
                )}
                
                {/* Manager-specific tabs */}
                {isManager && !isAdmin && (
                    <>
                        <Button 
                            variant='contained' 
                            onClick={() => navigate('/users')}
                            className={isActive('/users') ? 'active-tab' : ''}
                        >
                            Users
                        </Button>
                        <Button 
                            variant='contained' 
                            onClick={() => navigate('/objects')}
                            className={isActive('/objects') ? 'active-tab' : ''}
                        >
                            Objects
                        </Button>
                        
                        <Button 
                            variant='contained' 
                            onClick={() => navigate('/datasets')}
                            className={isActive('/datasets') ? 'active-tab' : ''}
                        >
                            Datasets
                        </Button>
                    </>
                )}

                {/* Worker-specific tabs - only show objects they can access */}
                {!isManager && !isAdmin && (
                    <>
                        <Button 
                            variant='contained' 
                            onClick={() => navigate('/objects')}
                            className={isActive('/objects') ? 'active-tab' : ''}
                        >
                            My Objects
                        </Button>
                        
                    </>
                )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {currentUser && (
                    <>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            {currentUser?.name} ({currentUser?.role})
                        </Typography>
                        <IconButton 
                            color="inherit" 
                            onClick={handleChangePassword}
                            title="Change Password"
                            sx={{ mr: 1 }}
                        >
                            <SettingsIcon />
                        </IconButton>
                    </>
                )}
                <Button 
                    variant='outlined' 
                    color="secondary"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Box>
        </div>
    );
}

export default NevigationTabs;
