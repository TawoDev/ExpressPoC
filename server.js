import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

const app = express();

dotenv.config();

const apiUrl = process.env.API_URL;
const orgUrl = process.env.ORG_URL;
const tokenUrl = process.env.TOKEN_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

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
        externalSessionKey: Date.now(),
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
        result = { ...result, access_token: token.access_token };
        res.status(200).send(result);
    } catch (error) {
        console.error("Error creating session:", error);
    }
});

app.post('/chat/cont', async (req, res) => {
    const requestData = 
        {
            "message": {
              "sequenceId": Date.now(),
              "type": "Text",
              "text": req.body.message
            }
        };

    try {
        const response = await fetch(`https://api.salesforce.com/einstein/ai-agent/v1/sessions/${req.body.sessionId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${req.body.access_token}`
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