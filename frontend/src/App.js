import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NevigationTabs from './components/Nevigation/NevigationTabs';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Home from './pages/Home';

function App() {
  return (
    <div className="App">
      <main className='App-main'>
        <div className='dashboard'>
          <NevigationTabs />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
