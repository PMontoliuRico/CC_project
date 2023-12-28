const express = require('express');
const app = express();
const morgan = require('morgan');

// Settings
app.use(morgan('dev'));
app.use(require('./routes/index'));


module.exports = app;
