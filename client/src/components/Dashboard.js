import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';
import LandRegistryABI from '../LandRegistry.json';
import '../styles.css';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

function Dashboard({ token, role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [lands, setLands] = useState([]);
  const [surveyNumber, setSurveyNumber] = useState('');
  const [details, setDetails] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        const contractInstance = new web3Instance.eth.Contract(LandRegistryABI.abi, CONTRACT_ADDRESS);
        setContract(contractInstance);
        setWeb3(web3Instance);

        try {
          if (role === 'civilian') {
            const res = await axios.get('http://localhost:5000/lands', { headers: { Authorization: token } });
            setLands(res.data);
          } else if (role === 'government') {
            const res = await axios.get('http://localhost:5000/pending-registrations', { headers: { Authorization: token } });
            setPendingRequests(res.data);
          }
        } catch (error) {
          console.error("API call failed:", error.response ? error.response.data : error.message);
        }
      } else {
        console.error("MetaMask not detected");
      }
    };
    init();
  }, [token, role]);

  const registerLand = async () => {
    if (contract && account) {
      await contract.methods.requestLandRegistration(surveyNumber, details).send({ from: account });
      alert('Land registration requested!');
      setSurveyNumber('');
      setDetails('');
    }
  };

  const approveRegistration = async (id) => {
    if (contract && account) {
      await axios.post(`http://localhost:5000/approve-registration/${id}`, {}, { headers: { Authorization: token } });
      alert('Land approved!');
      const res = await axios.get('http://localhost:5000/pending-registrations', { headers: { Authorization: token } });
      setPendingRequests(res.data);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1 className="title">{role === 'government' ? 'Government Dashboard' : 'Civilian Dashboard'}</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>
      <div className="content">
        {role === 'civilian' && (
          <div>
            <div className="card">
              <h2 className="subtitle">Register New Land</h2>
              <input
                value={surveyNumber}
                onChange={(e) => setSurveyNumber(e.target.value)}
                placeholder="Survey Number"
                className="input"
              />
              <input
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Details"
                className="input"
              />
              <button onClick={registerLand} className="button">Request Registration</button>
            </div>
            <div className="card">
              <h2 className="subtitle">Your Lands</h2>
              {lands.length > 0 ? (
                lands.map(land => (
                  <div key={land.landId} className="land-item">
                    <p>Survey: {land.surveyNumber}</p>
                    <button className="action-button">List for Sale</button>
                  </div>
                ))
              ) : (
                <p className="empty-text">No lands registered</p>
              )}
            </div>
          </div>
        )}
        {role === 'government' && (
          <div className="card">
            <h2 className="subtitle">Pending Land Registrations</h2>
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <div key={request.id} className="land-item">
                  <p>Survey: {request.surveyNumber}, Owner: {request.owner}</p>
                  <button onClick={() => approveRegistration(request.id)} className="action-button">Approve</button>
                </div>
              ))
            ) : (
              <p className="empty-text">No pending requests</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;