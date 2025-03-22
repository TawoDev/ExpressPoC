const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const apiUrl = process.env.API_URL;
const orgUrl = process.env.ORG_URL;
const tokenUrl = process.env.TOKEN_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const sessionSecret = process.env.SESSION_SECRET;

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key'
    , resave: false
    , saveUninitialized: true
    , cookie: { secure: false }
}));

const accessToken = async (clientId, clientSecret) => {
    const data = new URLSearchParams();
    data.append("client_id", clientId);
    data.append("client_secret", clientSecret);
    data.append("grant_type", "client_credentials");

    try {
        const response = await fetch(tokenUrl, {
            method: "POST"
            , headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            , body: data
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error getting access token:", error);
    }
};

app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.post('/chat/init', async (req, res) => {
    const token = await accessToken(clientId, clientSecret);

    const requestData = {
        externalSessionKey: "123456",
        instanceConfig: {
            endpoint: orgUrl
        },
        streamingCapabilities: {
            chunkTypes: ["Text"]
        },
        bypassUser: true
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token.access_token}`
            },
            body: JSON.stringify(requestData)
        });

        let result = await response.json();
        
        req.session.access_token = token.access_token;
        req.session.sessionId = result.sessionId;

        res.status(200).send(result);
    } catch (error) {
        console.error("Error creating session:", error);
    }
});

app.post('/chat/cont', async (req, res) => {
    if (!req.session.access_token || !req.session.sessionId) {
        console.error("Session not initialized:", error);
        return res.status(401).json({ error: 'Session not initialized' });
    }
    const requestData = 
        {
            "message": {
              "sequenceId": 1,
              "type": "Text",
              "text": req.body.message
            }
        };

    try {
        const response = await fetch(`https://api.salesforce.com/einstein/ai-agent/v1/sessions/${req.session.sessionId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${req.session.access_token}`
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error creating session:", error);
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));