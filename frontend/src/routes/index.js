const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');

// Middleware to check for Authorization header and access token
function checkAuthHeaders(req, res, next) {
    // Check for Authorization header
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No Authorization header sent!' });
    }

    // Check for access token
    const authHeaderParts = req.headers.authorization.split(' ');
    if (authHeaderParts.length !== 2 || authHeaderParts[0] !== 'Bearer') {
        return res.status(403).json({ error: 'No access token sent!' });
    }

    // Extract the access token
    const accessToken = authHeaderParts[1];

    // Attach the access token to the request for later use (if needed)
    req.accessToken = accessToken;

    // Call next() to move to the next middleware/route handler
    next();
}

// Use the middleware for all routes except the ones that don't require authentication
router.use(checkAuthHeaders);

// Route that requires authentication and validates the access token
const express = require('express');
const app = express();

router.get('/', (req, res) => {
  const user = req.get('x-forwarded-user');
  const email = req.get('x-forwarded-email');
  res.send(`User: ${user}, Email: ${email}`);
});



module.exports = router;
