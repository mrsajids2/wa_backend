// consumer.js
const kafka = require('../../config/kafkaClient');
const consumer = kafka.consumer({ groupId: 'api-group' });
const TemplateRepository = require('../../respository/template.repository');
const { sendNotification } = require('../../utils/notification');

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'template-approved', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());
      // Update template status in DB
      const updated = await TemplateRepository.updateStatus(data.templateid, '1');
      // Send notification to user (implement sendNotification as needed)
      if (updated && updated.companyid) {
        await sendNotification({
          companyid: updated.companyid,
          templateid: updated.templateid,
          templatename: updated.templatename,
          status: 'Approved'
        });
      }
      console.log(`Template ${updated.templateid} approved and user notified.`);
    },
  });
};

module.exports = startConsumer;
