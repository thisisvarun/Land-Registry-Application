require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Web3 } = require('web3');
const cors = require('cors'); // Add this
const User = require('./models/User');
const Land = require('./models/Land');
const LandRegistryABI = require('./LandRegistry.json');

const CONTRACT_ADDRESS = "0xb25C4F8C45f1586F18a8EbCb8b7153Cf673F6011"; // From truffle migrate

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Web3 setup (Ganache)
const web3 = new Web3('http://127.0.0.1:8545');


// Signup
app.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  const account = web3.eth.accounts.create();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    id: account.address,
    email,
    password: hashedPassword,
    privateKey: account.privateKey,
    address: account.address,
    role: role || 'civilian', // Uses provided role or defaults to civilian
  });

  await user.save();
  res.json({ address: account.address, message: 'User created' });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, role: user.role });
});

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Get user lands
app.get('/lands', auth, async (req, res) => {
  const lands = await Land.find({ userId: req.user.id });
  res.json(lands);
});



// After existing routes...

// Get pending land registrations (government only)
app.get('/pending-registrations', auth, async (req, res) => {
  if (req.user.role !== 'government') return res.status(403).json({ message: 'Government only' });
  const contract = new web3.eth.Contract(LandRegistryABI.abi, CONTRACT_ADDRESS);
  try {
    const landCount = await contract.methods.landCount().call();
    const pending = [];
    for (let i = 1; i <= landCount; i++) {
      const isPending = await contract.methods.pendingRegistrations(i).call();
      if (isPending) {
        try {
          const land = await contract.methods.getLand(i).call();
          pending.push({ id: land[0], surveyNumber: land[1], details: land[2], owner: land[3] });
        } catch (err) {
          console.error(`Failed to fetch land ${i}:`, err.message);
        }
      }
    }
    res.json(pending);
  } catch (error) {
    console.error("Error fetching pending registrations:", error.message);
    res.status(500).json({ message: 'Failed to fetch pending registrations', error: error.message });
  }
});

// Approve land registration (government only)
app.post('/approve-registration/:id', auth, async (req, res) => {
  if (req.user.role !== 'government') return res.status(403).json({ message: 'Government only' });
  const { id } = req.params;
  const user = await User.findOne({ id: req.user.id }); // Get government account
  const contract = new web3.eth.Contract(LandRegistryABI.abi, CONTRACT_ADDRESS);
  try {
    await contract.methods.approveLandRegistration(id).send({ from: user.address });
    res.json({ message: 'Land registration approved' });
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));