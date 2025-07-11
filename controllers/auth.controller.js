const { validatePassword, generateHeaderKey } = require("../utils/userHelper");
const response = require("../utils/responseManager");
const { generateOTP, checkEmailOrMobile } = require("../utils/common");
const {
  sendOTPwithFallback,
  signupSendOTP,
  sendSMSOTP,
} = require("../utils/verification");
const Company = require("../respository/company.respository");
const {
  createOtpSessionForOTP,
  checkAllRedisData,
  deleteAllRedisData,
  deleteOtpSessionForMobile,
  getOtpSessionForMobile,
  createLoginSession,
  deleteLoginSession,
} = require("../lib/session");

exports.signUpCompany = async (req, res, next) => {
  // Step 1: Request body validation
  const { email, countrycode, mobile } = req.body;
  if (!email && !mobile) {
    return response.forbidden(res, "Either email or mobile is required");
  }
  if (mobile && !countrycode) {
    return response.forbidden(
      res,
      "Countrycode is required when mobile is provided"
    );
  }

  try {
    // Step 2: Check if mob or mail is exists
    let existingCompany;
    if (mobile) {
      existingCompany = await Company.findByMobile(mobile);
    } else if (email) {
      existingCompany = await Company.findByEmail(email);
    }
    if (existingCompany) {
      return response.alreadyExist(res, "Company already registered.");
    }

    // Step 3: Create session for sign up to store otp
    // we are sending otp first to know weather it is a valid whatsap no or not
    const otpcode = await generateOTP();
    let session;
    if (mobile) {
      session = await createOtpSessionForOTP(mobile, otpcode, "signup");
    } else if (email) {
      session = await createOtpSessionForOTP(email, otpcode, "signup");
    }
    if (!session.allowed) {
      return response.forbidden(res, session.message);
    }

    let otpresponse;
    if (mobile) {
      otpresponse = await signupSendOTP(mobile, otpcode, "MOBILE", countrycode);
    } else if (email) {
      otpresponse = await signupSendOTP(email, otpcode, "EMAIL");
    }
    if (otpresponse.success) {
      return response.success(res, 200, otpresponse.message, { otpresponse });
    } else {
      return response.serverError(res, 500, otpresponse.message, {
        otpresponse,
      });
    }
  } catch (error) {
    console.error("error in signUpCompany:", error);
    next(error);
  }
};
//
exports.vefifySignUpOtp = async (req, res, next) => {
  // Step 1: Request body validation
  const { email, countrycode, mobile, otp } = req.body;
  if (
    (!email && !(mobile && countrycode)) ||
    (mobile && !countrycode) ||
    !otp
  ) {
    return response.forbidden(
      res,
      "Either email or mobile with countrycode and otp is required"
    );
  }
  // const { companyname, contactname, password, otp } = req.body;
  // if (!companyname || !contactname || !password || !otp) {
  //   return response.forbidden(res, "All fields are required");
  // }

  try {
    let session;
    if (mobile) {
      session = await getOtpSessionForMobile(mobile, "signup");
    } else if (email) {
      session = await getOtpSessionForMobile(email, "signup");
    }
    if (!session.success) {
      return response.serverError(res, 500, session.message);
    }

    // const session = await getOtpSessionForMobile(mobile, "signup");
    // console.log("session", session);

    if (Number(session.session.otp) !== Number(otp)) {
      return response.forbidden(res, "Invalid OTP");
    } else {
      // Step 3: Delete OTP session after successful verification
      // await deleteOtpSessionForMobile(mobile ? mobile : email, "signup");

      // Step 4: OTP is valid, proceed with registration
      // const companyresponse = await Company.create(req.body);
      // if (!companyresponse) {
      //   return response.serverError(res);
      // }
      return response.success(res, 200, "OTP verified successfully");
    }
  } catch (error) {
    next(error);
  }
};

exports.vefifySignUpOtpnSignup = async (req, res, next) => {
  // Step 1: Request body validation
  const {
    companyname,
    contactname,
    password,
    email,
    countrycode,
    mobile,
    otp,
  } = req.body;
  if (
    !companyname ||
    !contactname ||
    !password ||
    (!email && !(mobile && countrycode)) ||
    (mobile && !countrycode) ||
    !otp
  ) {
    return response.forbidden(
      res,
      "All fields are required including either email or mobile with countrycode"
    );
  }

  try {
    let session;
    if (mobile) {
      session = await getOtpSessionForMobile(mobile, "signup");
    } else if (email) {
      session = await getOtpSessionForMobile(email, "signup");
    }
    if (!session.success) {
      return response.serverError(res, 500, session.message);
    }

    if (Number(session.session.otp) !== Number(otp)) {
      return response.forbidden(res, "Invalid OTP");
    } else {
      // Step 3: Delete OTP session after successful verification
      await deleteOtpSessionForMobile(mobile ? mobile : email, "signup");

      // Step 4: OTP is valid, proceed with registration
      const companyresponse = await Company.create(req.body);
      if (!companyresponse) {
        return response.serverError(res);
      }
      return response.success(res, 200, "Signup successful");
    }
  } catch (error) {
    next(error);
  }
};

exports.resendSignUpOtp = async (req, res, next) => {
  // Step 1: Request body validation
  const { email, countrycode, mobile } = req.body;
  if (!email && !mobile) {
    return response.forbidden(res, "Either email or mobile is required");
  }
  if (mobile && !countrycode) {
    return response.forbidden(
      res,
      "Countrycode is required when mobile is provided"
    );
  }

  try {
    const otpcode = await generateOTP();
    const session = await createOtpSessionForOTP(
      mobile ? mobile : email,
      otpcode,
      "signup"
    );
    if (!session.allowed) {
      return response.forbidden(res, session.message);
    }

    // const mobilewithcountrycode = countrycode + mobile;
    let otpresponse;
    if (mobile) {
      // const mobilewithcountrycode = countrycode + mobile;
      otpresponse = await signupSendOTP(mobile, otpcode, "MOBILE", countrycode);
    } else if (email) {
      otpresponse = await signupSendOTP(email, otpcode, "EMAIL");
    }
    if (otpresponse.success) {
      return response.success(res, 200, otpresponse.message, { otpresponse });
    } else {
      return response.serverError(res, 500, otpresponse.message, {
        otpresponse,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.loginCompany = async (req, res, next) => {
  // Step 1: Request body validation
  const { email, mobile, password } = req.body;
  if (!password || (!email && !mobile)) {
    return response.forbidden(
      res,
      "Password and either email or mobile is required"
    );
  }

  try {
    // Step 2: Check if mob or mail is exists
    let existingCompany;
    if (mobile) {
      existingCompany = await Company.findByMobile(mobile);
    } else if (email) {
      existingCompany = await Company.findByEmail(email);
    }
    if (existingCompany) {
      // Step 3: Validate password
      const validate = await validatePassword(
        password,
        existingCompany.password
      );

      if (validate) {
        const otpcode = await generateOTP();
        // Step 4: Create session for login to store otp
        const session = await createOtpSessionForOTP(
          existingCompany.companyid,
          otpcode,
          "login"
        );
        if (!session.allowed) {
          return response.forbidden(res, session.message);
        }

        // Step 5: Send OTP via WhatsApp, SMS, or Email
        const mobilewithcountrycode =
          existingCompany.countrycode + existingCompany.contactno;
        const otpresponse = await sendOTPwithFallback(
          mobilewithcountrycode,
          otpcode,
          existingCompany.emailid,
          existingCompany.companyname
        );
        if (otpresponse.success) {
          return response.success(res, 200, otpresponse.message, {
            otpresponse,
          });
        } else {
          return response.serverError(res, 500, otpresponse.message, {
            otpresponse,
          });
        }
      } else return response.forbidden(res, "Incorrect Password");
    } else {
      return response.notFound(res, "Company is not registered");
    }
  } catch (error) {
    console.error("error in loginCompany:", error);
    next(error);
  }
};

exports.verifyLoginOTP = async (req, res, next) => {
  // Step 1: Request body validation
  const { email, mobile, otp } = req.body;
  if (!otp || (!email && !mobile)) {
    return response.forbidden(
      res,
      "otp and either email or mobile is required"
    );
  }

  try {
    // Step 2: Check if company exists
    let existingCompany;
    if (mobile) {
      existingCompany = await Company.findByMobile(mobile);
    } else if (email) {
      existingCompany = await Company.findByEmail(email);
    }

    if (existingCompany) {
      // Step 3: Check if OTP matches from session
      let session = await getOtpSessionForMobile(
        existingCompany.companyid,
        "login"
      );
      if (!session.success) {
        return response.serverError(res, 500, session.message);
      }

      if (Number(session.session.otp) !== Number(otp)) {
        return response.forbidden(res, "Invalid OTP");
      } else {
        //Step 4: OTP is valid, proceed with login

        // Step 4: Delete OTP session after successful verification
        await deleteOtpSessionForMobile(existingCompany.companyid, "login");

        const companydatatoencrypt = {
          mobile: existingCompany.contactno,
          companyid: existingCompany.companyid,
        };
        // Step 5: Generate token
        const token = generateHeaderKey(companydatatoencrypt);
        if (!token) {
          return response.serverError(res, 500, "Failed to generate token");
        }
        // console.log("token", token);
        // Step 6: Create session
        let sessiondata = {
          companyid: existingCompany.companyid,
          token: token,
        };
        // await createSession(token, companydatatoencrypt);
        const session = await createLoginSession(
          existingCompany.companyid,
          sessiondata
        );
        if (!session.allowed) {
          return response.serverError(res, 500, session.message);
        }

        // Step 7: Return success response
        return response.success(res, 200, "Company logged in successfully.", {
          headerkey: token,
          company: {
            ...companydatatoencrypt,
            companyname: existingCompany.companyname,
          },
        });
      }
    }
    return response.notFound(res, "Company not found");
  } catch (error) {
    next(error);
  }
};

exports.resendLoginOTP = async (req, res, next) => {
  // Step 1: Request body validation
  const { email, mobile } = req.body;
  if (!email && !mobile) {
    return response.forbidden(res, "Either email or mobile is required");
  }

  try {
    // Step 2: Check if company exists
    // Step 2: Check if mob or mail is exists
    let existingCompany;
    if (mobile) {
      existingCompany = await Company.findByMobile(mobile);
    } else if (email) {
      existingCompany = await Company.findByEmail(email);
    }

    if (existingCompany) {
      // Step 3: Generate and send OTP
      const otp = await generateOTP();
      const session = await createOtpSessionForOTP(
        existingCompany.companyid,
        otp,
        "login"
      );
      if (!session.allowed) {
        return response.forbidden(res, session.message);
      }
      // Step 4: Sending OTP to whatsapp
      const mobilewithcountrycode =
        existingCompany.countrycode + existingCompany.contactno;
      const otpreponse = await sendOTPwithFallback(
        mobilewithcountrycode,
        otp,
        existingCompany.emailid,
        existingCompany.companyname
      );
      if (otpreponse.success) {
        return response.success(res, 200, otpreponse.message, { otpreponse });
      } else {
        return response.serverError(res, 500, otpreponse.message, {
          otpreponse,
        });
      }
    } else {
      return response.notFound(res, "Company not found");
    }
  } catch (error) {
    next(error);
  }
};

exports.logoutCompany = async (req, res, next) => {
  try {
    const { companyid } = req.body;
    if (!companyid) {
      return response.forbidden(res, "Companyid is required");
    }

    // Step 1: Delete session from Redis
    const session = await deleteLoginSession(companyid);
    if (!session.success) {
      return response.serverError(res, 500, session.message);
    }

    // Step 2: Return success response
    return response.success(res, 200, "Successfully logged out");
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
};

exports.testing = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email) {
      return response.forbidden(res, "Email is required");
    }
    // check redis data
    // const session = await checkAllRedisData();
    // const session = await sendSMSOTP("917588157242", "123456");
    // clear all reddis data
    const session = await deleteAllRedisData();
    return response.serverError(res, 500, "", session);
  } catch (error) {
    next(error);
  }
};

exports.forgetPasswordSendOTP = async (req, res, next) => {
  // Step 1: Request body validation
  const { email, mobile, countrycode } = req.body;
  if (!email && !mobile) {
    return response.forbidden(res, "Either email or mobile is required");
  }
  if (mobile && !countrycode) {
    return response.forbidden(
      res,
      "Countrycode is required when mobile is provided"
    );
  }

  try {
    // Step 2: Check if company exists
    let existingCompany;
    if (mobile) {
      existingCompany = await Company.findByMobile(mobile);
    } else if (email) {
      existingCompany = await Company.findByEmail(email);
    }
    if (!existingCompany) {
      return response.notFound(res, "Company not found");
    }

    if (existingCompany) {
      // Step 3: Generate OTP
      const otp = await generateOTP();
      const session = await createOtpSessionForOTP(
        existingCompany.companyid,
        otp,
        "forgetpassword"
      );
      if (!session.allowed) {
        return response.forbidden(res, session.message);
      }

      // Step 4: Sending OTP to whatsapp
      const mobilewithcountrycode =
        existingCompany.countrycode + mobile;
        console.log(mobilewithcountrycode,
        otp,
        existingCompany.emailid,
        existingCompany.companyname);
        
      const otpreponse = await sendOTPwithFallback(
        mobilewithcountrycode,
        otp,
        existingCompany.emailid,
        existingCompany.companyname
      );
      if (otpreponse.success) {
        return response.success(res, 200, otpreponse.message, { otpreponse });
      } else {
        return response.serverError(res, 500, otpreponse.message, {
          otpreponse,
        });
      }
    } else {
      return response.notFound(res, "Company not found");
    }
  } catch (error) {
    console.error("Error in forgetPasswordSendOTP:", error);
    next(error);
  }
};

exports.forgetPasswordVerifyOTP = async (req, res, next) => {
  // Step 1: Request body validation
  const { email, mobile, otp } = req.body;
  if (!otp || (!email && !mobile)) {
    return response.forbidden(
      res,
      "otp and either email or mobile is required"
    );
  }

  try {
    // Step 2: Check if company exists
    let existingCompany;
    if (mobile) {
      existingCompany = await Company.findByMobile(mobile);
    } else if (email) {
      existingCompany = await Company.findByEmail(email);
    }

    if (existingCompany) {
      // Step 3: Check if OTP matches from session
      let session = await getOtpSessionForMobile(
        existingCompany.companyid,
        "forgetpassword"
      );
      if (!session.success) {
        return response.serverError(res, 500, session.message);
      }

      if (Number(session.session.otp) !== Number(otp)) {
        return response.forbidden(res, "Invalid OTP");
      } else {
        //Step 4: OTP is valid, proceed with password reset

        // Step 5: Delete OTP session after successful verification
        // await deleteOtpSessionForMobile(existingCompany.companyid, "forgetpassword");

        return response.success(res, 200, "OTP verified successfully");
      }
    }
    return response.notFound(res, "Company not found");
  } catch (error) {
    next(error);
  }
};
exports.forgetPasswordReset = async (req, res, next) => {
  // Step 1: Request body validation
  const { password, email, countrycode, mobile, otp } = req.body;
  if (
    !password ||
    (!email && !(mobile && countrycode)) ||
    (mobile && !countrycode) ||
    !otp
  ) {
    return response.forbidden(
      res,
      "All fields are required"
    );
  }

  try {
    // Step 2: Check if company exists
    let existingCompany;
    if (mobile) {
      existingCompany = await Company.findByMobile(mobile);
    } else if (email) {
      existingCompany = await Company.findByEmail(email);
    }

    if (existingCompany) {
      // Step 3: Update password
      const updated = await Company.updatePassword(password, existingCompany);
      if (updated) {
        return response.success(res, 200, "Password reset successfully");
      } else {
        return response.serverError(res, "Failed to reset password");
      }
    }
    return response.notFound(res, "Company not found");
  } catch (error) {
    next(error);
  }
};
