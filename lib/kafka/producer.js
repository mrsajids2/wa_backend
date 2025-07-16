// producer.js
const kafka = require('../../config/kafkaClient');
const producer = kafka.producer();

const produceMessage = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: message }],
  });
  await producer.disconnect();
};

const sendMessage = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
};

module.exports = { produceMessage, sendMessage };
