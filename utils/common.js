const nodemailer = require('nodemailer');

// pagination 
exports.getOffset = (pageno, itemperpage) => {
  // Convert to integer or fallback to default
  let perPage = parseInt(itemperpage);
  perPage = isNaN(perPage) || perPage <= 0 ? 10 : perPage;
  let page = parseInt(pageno);
  page = isNaN(page) || page <= 0 ? 1 : page;
  const offset = (page - 1) * perPage;

  return [offset, perPage];
};

exports.sendOtp = () => {
  // Placeholder for OTP sending logic
  // This function can be implemented to send OTP via email or SMS
  // For example, using a third-party service like Twilio or SendGrid
  return new Promise((resolve, reject) => {
    // Simulate OTP sending
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
    resolve(otp);
  });
}

// Reusable mail function
exports.sendMail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Change if using another SMTP
      auth: {
        user: process.env.MAIL_USER, // Your email
        pass: process.env.MAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};


