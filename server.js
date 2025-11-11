// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Formidable } = require('formidable'); // <-- 1. This line is fixed
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const DEEPGRAM_KEY = process.env.DEEPGRAM_KEY;

if (!DEEPGRAM_KEY) {
  console.error("ERROR: DEEPGRAM_KEY is not set in server/.env file");
} else {
  // Good! Add a success message so we know the key is loaded.
  console.log("DEEPGRAM_KEY loaded successfully.");
}

app.post('/api/check-speech', async (req, res) => {
  console.log("Received a request to /api/check-speech"); // Added log
  try {
    const form = new Formidable({ multiples: false }); // <-- 2. This line is fixed

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error parsing audio file' });
      }

      const audioBlob = files.audioBlob ? files.audioBlob[0] : null;
      const currentWord = fields.text ? fields.text[0] : '';

      if (!audioBlob) {
         console.error("No audio file received in form");
         return res.status(400).json({ error: 'No audio file received' });
      }
      
      // Check for the key *before* making the API call
      if (!DEEPGRAM_KEY) {
        console.error("Cannot call Deepgram: DEEPGRAM_KEY is missing.");
        return res.status(500).json({ error: 'Server configuration error' });
      }

      try {
        console.log("Sending audio to Deepgram..."); // Added log
        const deepgramResponse = await axios.post(
          'https://api.deepgram.com/v1/listen?model=general',
          fs.createReadStream(audioBlob.filepath),
          {
            headers: {
              'Authorization': `Token ${DEEPGRAM_KEY}`,
              'Content-Type': audioBlob.mimetype,
            },
          }
        );
        
        console.log("Deepgram response received successfully."); // Added log
        res.json(deepgramResponse.data); // Send the good response back to React

      } catch (deepgramError) {
        // This will catch errors from the Deepgram API itself
        console.error('Error from Deepgram API:', deepgramError.message);
        if (deepgramError.response) {
            console.error('Deepgram Response Data:', deepgramError.response.data);
            console.error('Deepgram Response Status:', deepgramError.response.status);
        }
        res.status(500).json({ error: 'Deepgram API failed' });
      }
    });

  } catch (error) {
    // This will catch any other errors
    console.error('Outer server error:', error.message);
    res.status(500).json({ error: 'Error processing speech' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Vocalis server listening on http://localhost:${PORT}`);
});