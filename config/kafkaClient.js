// kafkaClient.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-node-app',
  brokers: ['localhost:9092'] // Replace with your broker address
});

module.exports = kafka;
