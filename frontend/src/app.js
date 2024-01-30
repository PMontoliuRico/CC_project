const express = require('express');
const app = express();
const morgan = require('morgan');
const NATS = require('nats');

// Settings
app.use(morgan('dev'));
app.use(require('./routes/index'));

module.exports = app;
