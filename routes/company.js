const express = require('express');
const router = express.Router();
const company = require('../controllers/company')

router.post("/signupcompany", company.signUpCompany);

router.post("/verifyotp", company.vefifySignUpOtp);

router.post("/logincompany", company.loginCompnay);

module.exports = router;
