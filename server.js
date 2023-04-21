// Tutorial Reference: https://www.youtube.com/watch?v=PdFdd4N6LtI


// Required libraries
require('dotenv').config();

const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());


// Redirect to landing page (index.html)
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/html/index.html`);
});

// Redirect to main page (main.html)
app.get('/main', (req, res) => {
    res.sendFile(`${__dirname}/html/main.html`);
});


// When user wants to sign in, redirect to GitHub page so user can login with their GitHub account
// This is where the authorization is done
app.get('/auth', (req, res) => {
    // Use client ID and secret from my GitHub OAuth app, which are stored as variables in the .env file
    // This will redirect to GitHub authorization page so user can be authorized
    res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`,
    );
});


// After user has been authorized
app.get('/oauth-callback', ({
    query: {
        code // One of the fields destructured from callback
    }
}, res) => {
    // The body stores the client ID and secret
    const body = {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_SECRET,
        code,
    };

    // Post headers
    const opts = {
        headers: {
            accept: 'application/json'
        }
    };

    // Axios fetches from the GitHub URL
    // Pass the body and headers to the post request
    // This will prompt the user on the browser to login with the GitHub account associated with the client ID and secret
    axios
        .post('https://github.com/login/oauth/access_token', body, opts)
        .then((_res) => _res.data.access_token) // Get token from URL
        .then((token) => {
            // Once user has been authorized, redirect to main page
            res.redirect(`/main/?token=${token}`);
        })
        .catch((err) => res.status(500).json({
            err: err.message
        }));
});


// Setup server
let port = 3000;
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});