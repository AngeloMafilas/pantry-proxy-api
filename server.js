const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PANTRY_ID = process.env.PANTRY_ID;

// ✅ Safety check in case the .env file is missing or invalid
if (!PANTRY_ID) {
  console.error('❌ Error: PANTRY_ID is not defined in your .env file');
  process.exit(1);
}

// Base Pantry URL
const PANTRY_API_BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket`;

app.use(cors());
app.use(express.json());

// ✅ Serve static files (like CSS, JS, etc.)
app.use(express.static(path.join(__dirname)));

// ✅ Root route — serves your index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Favicon route (optional)
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.ico'));
});

// ✅ GET — Fetch data from a specific basket
app.get('/:basketName', async (req, res) => {
  try {
    const { basketName } = req.params;
    const response = await axios.get(`${PANTRY_API_BASE_URL}/${basketName}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ POST — Add new data to a specific basket
app.post('/:basketName', async (req, res) => {
  try {
    const { basketName } = req.params;
    const newData = req.body;
    const response = await axios.post(`${PANTRY_API_BASE_URL}/${basketName}`, newData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ PUT — Update data in a specific basket
app.put('/:basketName', async (req, res) => {
  try {
    const { basketName } = req.params;
    const updatedData = req.body;
    const response = await axios.put(`${PANTRY_API_BASE_URL}/${basketName}`, updatedData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE — Clear a basket
app.delete('/:basketName', async (req, res) => {
  try {
    const { basketName } = req.params;
    await axios.delete(`${PANTRY_API_BASE_URL}/${basketName}`);
    res.json({ message: `🗑️ Basket "${basketName}" cleared successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
