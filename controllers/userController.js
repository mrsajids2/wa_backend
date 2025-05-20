const User = require("../models/user");
const {
  validatePassword,
  generateHashPassword,
  generateHeaderKey,
} = require("../utils/userHelper");
const response = require("../utils/responseManager");

exports.signUpUser = async (req, res) => {
  const { name, email, password, mobile } = req.body;
  if (!name || !email || !password) {
    return response.forbidden(res, "All fields are required");
  }

  try {
    const isExist = await User.find({ email: email });
    if (isExist.length) {
      return response.alreadyExist(res, "User already registered.");
    }

    // generate hash
    const hashpassword = await generateHashPassword(password);

    const newUser = new User({
      name: name,
      email: email,
      mobile: mobile || 0,
      password: hashpassword,
    });

    newUser
      .save()
      .then((result) => {
        return response.success(res, "Successfully Registered.", result);
      })
      .catch((err) => next(err));
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return response.forbidden(res, "All fields are required");
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return response.notFound(res, "User is not registered");
    } else {
      const validate = await validatePassword(password, user.password);
      if (validate) {
        // generate token
        const token = generateHeaderKey(email);
        return response.success(res, "Successfully Loged in.", {
          headerkey: token,
        });
      } else return response.forbidden(res, "Incorrect Password");
    }
  } catch (error) {
    next(error);
  }
};
