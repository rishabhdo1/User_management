const express = require('express')
const cors = require('cors');
const helmet = require('helmet');
const {sendError} = require('./helpers/response');
const logger = require('./logger/logger');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());

//body parser
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/users', require('./routes/userRoutes'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


app.use((err, req, res, next) => {
  logger.error(err.message,{
    stack: err.stack,
    route:req.originalUrl,
    method:req.method,
    ip:req.ip
  });
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
  })

module.exports = app;