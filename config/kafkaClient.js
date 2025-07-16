const { Kafka, logLevel } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'my-node-app',
  // brokers: process.env.KAFKA_BROKERS?.split(','),
  brokers: ['localhost:9092'],

  // Optional production-level settings
  // ssl: true,
  // sasl: {
  //   mechanism: 'plain', // 'scram-sha-256' or 'scram-sha-512' for higher rs
  //   // security
  //   username: process.env.KAFKA_SASL_USERNAME,
  //   password: process.env.KAFKA_SASL_PASSWORD,
  // },

  // Logging control
  logLevel: logLevel.NOTHING, // or desable logs
});


module.exports = kafka;
