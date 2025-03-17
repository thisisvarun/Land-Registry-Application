require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Web3 } = require('web3');
const cors = require('cors'); // Add this
const User = require('./models/User');
const Land = require('./models/Land');

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
    role: role || 'civilian',
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

app.listen(5000, () => console.log('Server running on port 5000'));