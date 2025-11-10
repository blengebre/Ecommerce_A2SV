const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/api', userRoutes);
// MongoDB connection
mongoose.connect('mongodb+srv://Blugg:we9o0gsQywrTjLtE@mern.75e5kmq.mongodb.net/?appName=Mern', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Root route (optional check)
app.get('/', (req, res) => {
  res.send('E-commerce Backend is running 🚀');
});

// Start server
app.listen(3000, () => {
  console.log('🚀 Server is running on port 3000');
});
