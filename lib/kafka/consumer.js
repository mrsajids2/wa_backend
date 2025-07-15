// consumer.js
const kafka = require('../../config/kafkaClient');
const consumer = kafka.consumer({ groupId: 'api-group' });

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Consumed: ${message.value.toString()}`);
    },
  });
};

module.exports = startConsumer;
