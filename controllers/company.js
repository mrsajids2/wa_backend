const User = require("../models/User");
const {
  validatePassword,
  generateHashPassword,
  generateHeaderKey,
} = require("../utils/userHelper");
const response = require("../utils/responseManager");
const db = require("../config/conn");
const companyProcedure = require("../constant/procedures/companyProcedure");
const { sendOtp, sendMail } = require("../utils/common");

exports.signUpCompany = async (req, res, next) => {

  // Step 1: Request body validation
  const { companyname, contactname, email, password, mobile, pageurl, loginby, applicationname, ipaddress, browserdetails, osdetails } = req.body;

  // console.log(Object.values(req.body));

  // if (!companyname || !contactname || !password || !email || !mobile || !pageurl || !loginby || !applicationname) {
  //   return response.forbidden(res, "All fields are required");
  // }

  try {
    // Step 2: Generating hash
    const hashpassword = await generateHashPassword(password);

    // call tspproc.userregistration('userregistration', 2'userid', 3'username',
    // 4'mobileno', 5'fileid', 6'bannerid', 7'emailid', 'remarks', 'stateid',
    // 'cityid', '', '', 13'', '', 15'', '', '', '', 'pageurl',
    // 'callin-->Web/Mobile', 'applicationname');

    // Step 3: Preparing procedure parameters
    const procedure1Params = ['userregistration', '0', companyname, mobile, '', '', email, '', '', '', '', '', '', '', '', '', '', '', pageurl, loginby, applicationname];

    // Step 4: Executing the procedure
    const result = await db.query(companyProcedure.registerComponay, procedure1Params);

    // Step 5: Processing result
    if (result?.rows.length) {
      const rawMessage = result.rows[0]?.input20 || '';
      const [statusCode, message] = rawMessage.split('#');

      // Step 6: Sending OTP 
      if (statusCode === '200') {
        // return response.success(res, statusCode, message);

        // Sending email OTP
        const otpcode = await sendOtp();
        const respsn = await sendMail({
          to: 'sajeedsyed009@gmail.com',
          subject: 'Test Email',
          text: 'Hello! This is a plain text email.',
          html: '<h1>Hello!</h1><p>OTP:' + otpcode + '</p>',
        });
        if (!respsn.success) {
          return response.serverError(res, 500, "Failed to send OTP");
        }

        //  call tspproc.userloginprocedure('insertuserloginotp', 'mobileno',
        // 'ipaddress', 'browserdetails', 5'osdetails', 'otpcode', 'msgresponse',
        // 'otptype', '', 10'', '', '', '', '', 15'', '', '', '', 'pageurl',
        // 'callin-->Web/Mobile', 'applicationname');

        //* otptype -> 0 - Login/1 - Forget Password/2 - Change Password/3 - Registration

        // Step 7: inserting OTP into the database
        const procedure2Params = ['insertuserloginotp', mobile, ipaddress, browserdetails, osdetails, otpcode, '', '3', '', '', '', '', '', '', '', '', '', '', pageurl, loginby, applicationname];

        // const otpInsertResult = await db.query(companyProcedure.insertOtp, procedure2Params);
        const otpInsertResult = await db.query(companyProcedure.insertOtp, procedure2Params);

        // Step 8: Processing OTP insert result
        if (otpInsertResult?.rows.length) {
          const otpInsertMessage = otpInsertResult.rows[0]?.input20 || '';
          const [otpStatusCode, otpMessage] = otpInsertMessage.split('#');

          //   // Step 8: Sending OTP response
          if (otpStatusCode === '200') {
            return response.success(res, statusCode, otpMessage);
          } else {
            return response.serverError(res, otpStatusCode, otpMessage);
          }
        } else {
          return response.serverError(res);
        }
      } else {
        return response.serverError(res, statusCode, message);
      }
    } else {
      return response.serverError(res);
    }
  } catch (error) {
    next(error);
  }
};

exports.vefifySignUpOtp = async (req, res, next) => {
  // Step 1: Request body validation
  const { otp, companyname, contactname, email, password, mobile, pageurl, loginby, applicationname, ipaddress, browserdetails, osdetails } = req.body;

  /*
          call tspproc.userloginprocedure(1'verifyuserloginotp', 2'mobileno',
          3'ipaddress', 4'browserdetails', 5'osdetails', 'otpcode', 'otptype', '', '',
          10'', '', '', '', '', 15'', '', '', '', 'pageurl', 'callin-->Web/Mobile',
          'applicationname');
          
          otptype -> 0 - Login/1 - Forget Password/2 - Change Password/3 - Registration
          */
  try {
    // Step 2: Generating hash
    // const hashpassword = await generateHashPassword(password);

    // Step 3: Preparing procedure parameters
    const procedure1Params = ['verifyuserloginotp', mobile, ipaddress, browserdetails, osdetails, otp, '3', '', '', '', '', '', '', '', '', '', '', '', pageurl, loginby, applicationname];
    console.log("Procedure Params:", procedure1Params.length);


    // Step 4: Executing the procedure
    const result = await db.query(companyProcedure.verifyOtp, procedure1Params);

    // Step 5: Processing result
    if (result?.rows.length) {

      const rawMessage = result.rows[0]?.input20 || '';
      const [statusCode, message] = rawMessage.split('#');
      if (statusCode === '200') {
        return response.success(res, statusCode, message);
      } else {
        return response.serverError(res, statusCode, message);
      }

    } else {
      return response.serverError(res);
    }
  } catch (error) {
    next(error);
  }
}

exports.loginCompnay = async (req, res, next) => {
  const { email, password, mobile } = req.body;
  if (!password || !email) {
    return response.forbidden(res, "All fields are required");
  }
  // return response.success(res, 'Working signUpCompany', []);
  // const { email, password } = req.body;
  // if (!email || !password) {
  //   return response.forbidden(res, "All fields are required");
  // }

  // try {
  //   const user = await User.findOne({ email: email });

  //   if (!user) {
  //     return response.notFound(res, "User is not registered");
  //   } else {
  //     const validate = await validatePassword(password, user.password);
  //     if (validate) {
  //       // generate token
  //       const token = generateHeaderKey(email);
  //       return response.success(res, "Successfully Loged in.", {
  //         headerkey: token,
  //       });
  //     } else return response.forbidden(res, "Incorrect Password");
  //   }
  // } catch (error) {
  //   next(error);
  // }
};
