import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@mui/material';
import './NevigationTabs.css';

function NevigationTabs() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Function to check if a path is active
    const isActive = (path) => location.pathname === path;

    return (
        <div className="navigation-container" >
            <Button 
                variant='contained' 
                onClick={() => navigate('/')}
                className={isActive('/') ? 'active-tab' : ''}
            >
                Home
            </Button>
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
        </div>
    )
}
export default NevigationTabs;
