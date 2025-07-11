exports.OTPRegistrationTextTemplate = (username, otpcode) => {
  return {
    subject: `NextGen Communicator: Verify Your Email Address - ${otpcode}`,
    html: `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
                    <h2 style="text-align: center; color: #1e3a8a;">Verify Your Email Address</h2>
                    <p>JaiBheem Dear <strong>${username}</strong>,</p>
                    <p>Welcome to NextGen Communicator! To complete your registration, please verify your email address by using the One-Time Password (OTP) provided below:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; background-color: #3a539b; padding: 10px 20px; border: 1px solid #ccc; border-radius: 5px; font-size: 18px; color: white;">
                            <strong>Your OTP Code: ${otpcode}</strong>
                        </span>
                    </div>
                    <p>Please enter this code in the NextGen Communicator app to verify your email address.</p>
                    <p>If you did not initiate this registration, please disregard this email or contact our support team at <a href="mailto:admin@NextGen Communicator.ai" style="color: #1e3a8a;">admin@NextGen Communicator.ai</a>.</p>
                    <p>Thank you for joining the NextGen Communicator community!</p>
                    <p style="text-align: center; color: #777;">
                        <em style="color: black;">Connect Minds & Unite Hearts</em><br>
                        <a href="https://www.NextGen Communicator.ai" style="color: #1e3a8a;">www.NextGen Communicator.AI</a><br>
                        <span style="color: black;">PLATFORM DEDICATED TO ALL AMBEDKARITES</span>
                    </p>
                    <div style="text-align: center; margin-top: 20px;">
                        <img src="" alt="NextGen Communicator Logo" style="width: auto; height: 50px;" />
                    </div>
                </div>
            </body>
            </html>
        `,
  };
};
