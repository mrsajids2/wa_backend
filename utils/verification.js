const nodemailer = require("nodemailer");
const axios = require("axios");
const { OTPRegistrationTextTemplate } = require("./otpTemplates");
// Reusable mail function
exports.sendOTPViaEmail = async (emailAddress, template) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Change if using another SMTP
      auth: {
        user: process.env.MAIL_USER, // Your email
        pass: process.env.MAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: emailAddress,
      subject: template.subject,
      html: template.html,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent:", info.response);
    return { success: true, info, message: "OTP sent to your email" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

// Reusable WhatsApp message function
exports.sendWhatsAppOTP = async (phoneNumber, otpcode) => {
  console.log("for testing", otpcode);

  try {
    const apiUrl = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    const data = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "hello_world", // default whatsapp template
        language: {
          code: "en_US",
        },
      },
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.post(apiUrl, data, { headers });
    return {
      success: true,
      message: "OTP sent successfully to your Whatsapp no.",
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Error sending WhatsApp message:",
      error.response?.data || error.message
    );

    if (
      error.response?.data.error.code === 131030 ||
      error.response?.data.error.message.includes(
        "phone number not in allowed list"
      )
    ) {
      return {
        success: false,
        message: "This is not a valid WhatsApp number",
      };
    }
    console.error(
      "Error sending WhatsApp message:",
      error.response?.data || error.message
    );
    return { success: false, message: "Error while sending OTP." };
  }
};

exports.sendWhatsAppOTPWithTemplate = async (phoneNumber, otp) => {
  try {
    const apiUrl = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    const data = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber, // Use the parameter instead of hardcoded number
      type: "template",
      template: {
        name: "otp_template",
        language: {
          code: "en",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: otp, // Use the actual OTP from parameter
              },
            ],
          },
          {
            type: "button",
            sub_type: "url", // Changed from copy_code to url
            index: "0",
            parameters: [
              {
                type: "text",
                text: otp, // This will be the text displayed on the button
              },
            ],
          },
        ],
      },
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.post(apiUrl, data, { headers });
    return {
      success: true,
      message: "OTP sent successfully to your Whatsapp no.",
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Error sending WhatsApp message:",
      error.response?.data || error.message
    );

    if (
      error.response?.data.error.code === 131030 ||
      error.response?.data.error.message.includes(
        "phone number not in allowed list"
      )
    ) {
      return {
        success: false,
        message: "This is not a valid WhatsApp number",
      };
    }
    console.error(
      "Error sending WhatsApp message:",
      error.response?.data || error.message
    );
    return { success: false, message: "Error while sending OTP." };
  }
};

exports.sendSMSOTP = async (mobilewithcountrycode, otp) => {
  try {
    const response = await axios.get(
      process.env.SMS_API_URL,
      {
        params: {
          mobileno: mobilewithcountrycode,
          otp: otp,
          msgtype: "otp",
        },
        auth: {
          username: process.env.SMS_API_USERNAME, // Use environment variable for username
          password: process.env.SMS_API_PASSWORD, // Use environment variable for password
        },
        headers: {
          // Optional headers if needed
          Accept: "application/json",
        },
      }
    );

    return {
      success: true,
      message: "OTP sent successfully to your mobile number",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to send SMS OTP:", error.message);
    return { success: false, message: "Error while sending OTP." };
  }
};

exports.sendOTPwithFallback = async (
  mobilewithcountrycode,
  otpcode,
  email,
  companyname
) => {
  // Step 1: Try WhatsApp
  if(mobilewithcountrycode){


  const whatsappResponse = await this.sendWhatsAppOTPWithTemplate(
    mobilewithcountrycode,
    otpcode
  );
  if (whatsappResponse.success) {
    return {
      success: true,
      otpsentvia: "Whatsapp",
      message: whatsappResponse.message,
    };
  }
  }

   if(mobilewithcountrycode){
  // Step 2: Try SMS
  const smsResponse = await this.sendSMSOTP(mobilewithcountrycode, otpcode);
  if (smsResponse.success) {
    return {
      success: true,
      otpsentvia: "SMS",
      message: smsResponse.message,
    };
  }
   }
  // Step 3: Try Email

   if(email){
  const template = OTPRegistrationTextTemplate(companyname, otpcode);
  const emailResponse = await this.sendOTPViaEmail(email, template);
  if (emailResponse.success) {
    return {
      success: true,
      otpsentvia: "Mail",
      message: emailResponse.message || "OTP sent via email",
    };
  }
   }
  // Step 4: All attempts failed
  return {
    success: false,
    otpsentvia: null,
    message: "Failed to send OTP via WhatsApp, SMS, or Email",
  };
};

exports.signupSendOTP = async (
  entity, // entity can be mobile with country code or email
  otpcode,
  type = "MOBILE",
  countrycode = ""
) => {
  // Check if entity is a mobile number or email
  const isMobile = type === "MOBILE";
  const isEmail = type === "EMAIL";

  if (!isMobile && !isEmail) {
    throw new Error("Invalid entity type. Must be MOBILE or EMAIL.");
  }

  const mobilewithcountrycode = isMobile ? countrycode + entity : null;
  const email = isEmail ? entity : null;

  const companyname = "Your Company Name"; // Replace with actual company name or pass as parameter

  if (isMobile) {
    // Step 1: Try WhatsApp
    // console.log("Sending OTP via WhatsApp to:", mobilewithcountrycode);

    const whatsappResponse = await this.sendWhatsAppOTPWithTemplate(
      mobilewithcountrycode,
      otpcode
    );
    if (whatsappResponse.success) {
      return {
        success: true,
        otpsentvia: "Whatsapp",
        message: whatsappResponse.message,
      };
    }

    // Step 2: Try SMS
    // const smsResponse = await this.sendSMSOTP(mobilewithcountrycode, otpcode);
    // if (smsResponse.success) {
    //   return {
    //     success: true,
    //       otpsentvia: "SMS",
    //       message: smsResponse.message,
    //     };
    //   }
  }

  // If it's an email, skip WhatsApp and SMS steps
  if (isEmail) {
    // Step 1: Try Email
    const template = OTPRegistrationTextTemplate(companyname, otpcode);
    const emailResponse = await this.sendOTPViaEmail(email, template);
    if (emailResponse.success) {
      return {
        success: true,
        otpsentvia: "Mail",
        message: emailResponse.message || "OTP sent via email",
      };
    }
  }
  // Step 3: All attempts failed
  return {
    success: false,
    otpsentvia: null,
    message: "Failed to send OTP via WhatsApp, SMS, or Email",
  };
};
