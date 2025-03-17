import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import LandRegistryABI from '../LandRegistry.json'; // From build/contracts/
// import LandRegistryABI from '../LandRegistry.json'; // Adjust path if needed

const CONTRACT_ADDRESS = "0xdBe3ED3Dfd58F15a50A941Bd8aA2EED60E932Aec";

function Dashboard({ token, role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [lands, setLands] = useState([]);
  const [surveyNumber, setSurveyNumber] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const init = async () => {
      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.enable();
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      const contractInstance = new web3Instance.eth.Contract(LandRegistryABI, CONTRACT_ADDRESS);
      setContract(contractInstance);

      const res = await axios.get('http://localhost:5000/lands', { headers: { Authorization: token } });
      setLands(res.data);
    };
    init();
  }, [token]);

  const registerLand = async () => {
    await contract.methods.requestLandRegistration(surveyNumber, details).send({ from: account });
    alert('Land registration requested!');
  };

  return (
    <div>
      <h1>{role === 'government' ? 'Government Dashboard' : 'Civilian Dashboard'}</h1>
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
      {role === 'government' && <h2>Government Approval Section (TBD)</h2>}
    </div>
  );
}

export default Dashboard;