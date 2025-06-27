const User = require("../models/User");
const {
  validatePassword,
  generateHashPassword,
  generateHeaderKey,
} = require("../utils/userHelper");
const response = require("../utils/responseManager");
const db = require("../config/conn");
const companyProcedure = require("../constant/procedures/companyProcedure");

exports.signUpCompany = async (req, res, next) => {

  // Step 1: Request body validation
  const { companyname, contactname, email, password, mobile, pageurl, loginby, applicationname } = req.body;

  // console.log(Object.values(req.body));

  // if (!companyname || !contactname || !password || !email || !mobile || !pageurl || !loginby || !applicationname) {
  //   return response.forbidden(res, "All fields are required");
  // }

  try {
    // Step 2: Generating hash
    const hashpassword = await generateHashPassword(password);

    // call robohosterproc.useregistrationprocedure(1'userregistration',2'loginid',3'
    // remarks', 4'userid',5'companyname',6'username', 7'emailid', 8'mobileno',
    // 9'whatsappno', 10'address',11'stateid', 12'cityid',13'pincode', 14'gstno',
    // '', '', '','','pageurl', 'callin-->Web/Mobile', 'applicationname');

    // Step 3: Preparing procedure parameters
    const procedureParams = ['userregistration', '0', '', '0', companyname, 'username', email, mobile, mobile, 'address', '1', '2', '444444', '123456', '', '', '', '', pageurl, loginby, applicationname];

    // Step 4: Executing the procedure
    const result = await db.query(companyProcedure.registerUser, procedureParams);

    // Step 5: Processing result
    if (result?.rows.length) {
      const rawMessage = result.rows[0]?.input20 || '';
      const [statusCode, message] = rawMessage.split('#');

      // Step 6: Sending response
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
};

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
