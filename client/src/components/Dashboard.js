import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom'; // Add this
import LandRegistryABI from '../LandRegistry.json';

const CONTRACT_ADDRESS = "0xb25C4F8C45f1586F18a8EbCb8b7153Cf673F6011";

function Dashboard({ token, role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [lands, setLands] = useState([]);
  const [surveyNumber, setSurveyNumber] = useState('');
  const [details, setDetails] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const navigate = useNavigate(); // Add this

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

  const handleLogout = () => { // Add this
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div>
      <h1>{role === 'government' ? 'Government Dashboard' : 'Civilian Dashboard'}</h1>
      <button onClick={handleLogout}>Logout</button> {/* Add this */}
      {role === 'civilian' && (
        <div>
          <h2>Register New Land</h2>
          <input value={surveyNumber} onChange={(e) => setSurveyNumber(e.target.value)} placeholder="Survey Number" />
          <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details" />
          <button onClick={registerLand}>Request Registration</button>
          <h2>Your Lands</h2>
          {lands.map(land => (
            <div key={land.landId}>
              <p>Survey: {land.surveyNumber}</p>
              <button>List for Sale</button>
            </div>
          ))}
        </div>
      )}
      {role === 'government' && (
        <div>
          <h2>Pending Land Registrations</h2>
          {pendingRequests.length > 0 ? (
            pendingRequests.map(request => (
              <div key={request.id}>
                <p>Survey: {request.surveyNumber}, Owner: {request.owner}</p>
                <button onClick={() => approveRegistration(request.id)}>Approve</button>
              </div>
            ))
          ) : (
            <p>No pending requests</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;