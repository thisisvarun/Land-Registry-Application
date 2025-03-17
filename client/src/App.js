import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Remove Navigate if causing issues
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  console.log("App is rendering, token:", token); // Debug

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setToken={setToken} setRole={setRole} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} role={role} /> : <Login setToken={setToken} setRole={setRole} />} />
      </Routes>
    </Router>
  );
}

export default App;