import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('civilian');
  const navigate = useNavigate();

  const handleSignup = async () => {
    const res = await axios.post('http://localhost:5000/signup', { email, password, role });
    alert(`Account created! Address: ${res.data.address}`);
    navigate('/');
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Sign Up</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="select">
          <option value="civilian">Civilian</option>
          <option value="government">Government</option>
        </select>
        <button onClick={handleSignup} className="button">Sign Up</button>
        <p className="link" onClick={() => navigate('/')}>Already have an account? Login</p>
      </div>
    </div>
  );
}

export default Signup;