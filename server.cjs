const express = require('express');
const cors = require('cors'); // Import cors
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import GoogleGenerativeAI
const readline = require('readline'); // Import readline module

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());

app.use(express.json());

// Function to prompt for API key
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask for API_KEY if not set in .env
let apiKey = process.env.API_KEY;
if (!apiKey) {
    rl.question('Please enter your Google API key: ', (input) => {
        apiKey = input;
        rl.close();
        startServer(apiKey); // Start the server after getting the API key
    });
} else {
    startServer(apiKey);
}

function startServer(apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    app.post('/process-text', async (req, res) => {
        const { finalText } = req.body;

        if (!finalText) {
            return res.status(400).json({ error: 'finalText is required' });
        }

        try {
            const result = await model.generateContent(finalText);
            const responseText = result.response.text();

            res.json({ response: responseText });
        } catch (error) {
            console.error('Error interacting with Gemini API:', error);
            res.status(500).json({ error: 'Failed to process the text' });
        }
    });

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}
