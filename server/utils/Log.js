const winston = require('winston');

// Imports the Google Cloud client library for Winston
const { LoggingWinston } = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston({
    serviceContext: {
        service: 'api-server'
    }
});

const Log = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    loggingWinston
  ],
});

module.exports = Log