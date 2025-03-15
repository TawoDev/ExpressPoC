const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const apiUrl = process.env.API_URL;
const orgUrl = process.env.ORG_URL;
const accessToken = process.env.ACCESS_TOKEN;

app.get('/', async (req, res) => {
    const url = apiUrl;
    const token = accessToken; // 你的 Bearer Token

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
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        console.log("Session Created:", result);
    } catch (error) {
        console.error("Error creating session:", error);
    }
});

app.listen(3000);