import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('civilian'); // Default role
  const navigate = useNavigate();

  const handleSignup = async () => {
    const res = await axios.post('http://localhost:5000/signup', { email, password, role });
    alert(`Account created! Address: ${res.data.address}`);
    navigate('/');
  };

  return (
    <div>
      <h2>Signup</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <select value={role} onChange={(e) => setRole(e.target.value)}> {/* Add role dropdown */}
        <option value="civilian">Civilian</option>
        <option value="government">Government</option>
      </select>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}

export default Signup;