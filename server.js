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

const accessToken = (clientId, clientSecret) => {
    const data = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
    };

    try {
        const response = fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: JSON.stringify(data)
        });

        const result = response.json();
        console.log("Access token:", result.token_format);
        return result.access_token;
    } catch (error) {
        console.error("Error getting access token:", error);
    }
};;

app.use(cors());

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.post('/', async (req, res) => {
    const token = accessToken(clientId, clientSecret);

    const requestData = {
        externalSessionKey: "SDJyg27yqe7hd-1927ye7uwqghduwa",
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
                "Authorization": `Bearer ${token}`
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