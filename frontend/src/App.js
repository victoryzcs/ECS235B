import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function App() {



  return (
    <div className="App">
      <header className="App-header">
        <h1>ECS235B Final Project</h1>
        <h2>Access Control System with Chinese Wall security policy</h2>
      </header>

      <main className='App-main'>
        <div className='lists-container'>
          <div className='user-list' >
            <h2 style={{ border: '2px solid red' }}>Users</h2>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
