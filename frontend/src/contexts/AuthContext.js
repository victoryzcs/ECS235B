import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (storedToken && user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout(); 
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setToken(null);
  };
  const hasRole = (role) => {
    console.log('Checking role:', currentUser);
    return currentUser?.role === role;
  };

  const value = {
    currentUser,
    token,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin: hasRole('admin'),
    isManager: hasRole('manager'),
    isWorker: hasRole('worker')
  };
  console.log(value)

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};



