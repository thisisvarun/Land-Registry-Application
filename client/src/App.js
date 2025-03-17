import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  console.log("App is rendering");
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setToken={setToken} setRole={setRole} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard token={token} role={role} />} />
      </Routes>
    </Router>
  );}
export default App;