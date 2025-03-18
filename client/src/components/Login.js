import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

function Login({ setToken, setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post('http://localhost:5000/login', { email, password });
    setToken(res.data.token);
    setRole(res.data.role);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', res.data.role);
    navigate('/dashboard');
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Login</h2>
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
        <button onClick={handleLogin} className="button">Login</button>
        <p className="link" onClick={() => navigate('/signup')}>Need an account? Sign Up</p>
      </div>
    </div>
  );
}

export default Login;