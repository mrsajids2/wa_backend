// utils/notification.js
// Dummy notification function. Replace with actual email/SMS/push logic.
async function sendNotification({ companyid, templateid, templatename, status }) {
  // You can fetch user info by companyid if needed
  console.log(`Notification: Template '${templatename}' (ID: ${templateid}) for company ${companyid} is ${status}.`);
  // Implement actual notification logic here (email, SMS, etc.)
}

module.exports = { sendNotification };
