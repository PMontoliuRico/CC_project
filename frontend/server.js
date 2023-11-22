const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

// Middleware to handle requests from the OAuth2 proxy
app.use('/oauth2', (req, res, next) => {
  // Forward the request to the OAuth2 proxy
  const proxyUrl = 'http://localhost:4180/oauth2' + req.url;
  req.pipe(http.request(proxyUrl, { method: req.method, headers: req.headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  })).pipe(req, { end: true });
});

// Create job endpoint
app.post('/api/create-job', (req, res) => {
  const { jobData } = req.body;

  // Extract user identity from headers
  const userIdentity = req.headers['x-forwarded-user'];

  // Check if the Authorization header with the access token is present
  const authorizationHeader = req.headers['authorization'];
  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Unauthorized - Access Token missing' });
  }

  // Forward the request to the OAuth2 proxy and handle the response
  const proxyUrl = 'http://localhost:4180/oauth2/userinfo';
  const headers = {
    'Authorization': authorizationHeader,
    'X-Forwarded-User': userIdentity,
  };

  const proxyReq = http.request(proxyUrl, { method: 'GET', headers }, (proxyRes) => {
    let data = '';

    proxyRes.on('data', (chunk) => {
      data += chunk;
    });

    proxyRes.on('end', () => {
      try {
        const userInfo = JSON.parse(data);

        // Your job creation logic goes here...
        const jobId = '123'; // Replace with actual job ID

        res.json({ jobId, userIdentity, jobData, userInfo });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  proxyReq.on('error', (error) => {
    console.error('Error forwarding request to OAuth2 proxy:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  proxyReq.end();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
