import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import LandRegistryABI from '../LandRegistry.json';

const CONTRACT_ADDRESS = "0xYourDeployedAddressHere"; // From truffle migrate

function Dashboard({ token, role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [lands, setLands] = useState([]);
  const [surveyNumber, setSurveyNumber] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          console.log("Connected account:", accounts[0]);
          const contractInstance = new web3Instance.eth.Contract(LandRegistryABI.abi, CONTRACT_ADDRESS);
          setContract(contractInstance);
          setWeb3(web3Instance);

          const res = await axios.get('http://localhost:5000/lands', { headers: { Authorization: token } });
          setLands(res.data);
        } catch (error) {
          console.error("MetaMask connection failed:", error);
        }
      } else {
        console.error("MetaMask not detected");
      }
    };
    init();
  }, [token]);

  const registerLand = async () => { // Define the function here
    if (contract && account) {
      try {
        await contract.methods.requestLandRegistration(surveyNumber, details).send({ from: account });
        alert('Land registration requested!');
      } catch (error) {
        console.error("Error registering land:", error);
      }
    } else {
      console.error("Contract or account not initialized");
    }
  };

  return (
    <div>
      <h1>{role === 'government' ? 'Government Dashboard' : 'Civilian Dashboard'}</h1>
      {role === 'civilian' && (
        <div>
          <h2>Register New Land</h2>
          <input value={surveyNumber} onChange={(e) => setSurveyNumber(e.target.value)} placeholder="Survey Number" />
          <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details" />
          <button onClick={registerLand}>Request Registration</button> {/* Use the function here */}

          <h2>Your Lands</h2>
          {lands.map(land => (
            <div key={land.landId}>
              <p>Survey: {land.surveyNumber}</p>
              <button>List for Sale</button>
            </div>
          ))}
        </div>
      )}
      {role === 'government' && <h2>Government Approval Section (TBD)</h2>}
    </div>
  );
}

export default Dashboard;