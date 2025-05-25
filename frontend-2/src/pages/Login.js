import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Box,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext'; 

function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = useAuth(); 
  
  useEffect(() => {
    if (auth?.isAuthenticated) {
      navigate('/');
    }
  }, [auth, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // uncomment this may cause redirecting issue 
        // localStorage.setItem('token', data.token);
        // localStorage.setItem('user', JSON.stringify(data.user));

        auth.login(data.user, data.token);
        
        navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Network error. Please try again later.');
      console.error('Login error:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Security Policy Management System
          </Typography>
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Box textAlign="center">
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                Don't have an account? Sign up
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;