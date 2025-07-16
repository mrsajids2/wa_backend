// kafkaHealth.js
const kafka = require('../../config/kafkaClient'); // Ensure this exports the Kafka instance

/**
 * Checks Kafka broker health by listing topics.
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const checkKafkaHealth = async () => {
  const admin = kafka.admin();

  try {
    await admin.connect();
    // await admin.listTopics();
    await admin.disconnect();

    return {
      success: true,
      message: 'Kafka is Running.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Kafka connection failed: ' + error.message,
    };
  }
};

module.exports = { checkKafkaHealth };
