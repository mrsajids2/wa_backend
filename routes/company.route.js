const express = require("express");
const router = express.Router();
const company = require("../controllers/company.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/company/sendsignupotp", company.signUpCompany);

router.post("/company/verifysignupotp", company.vefifySignUpOtp);

// final api for registration
router.post("/company/verifysignupotpnsignup", company.vefifySignUpOtpnSignup);

router.post("/company/resendsignupotp", company.resendSignUpOtp);

router.post("/company/sendloginotp", company.loginCompany);

router.post("/company/verifyloginotp", company.verifyLoginOTP);

router.post("/company/resendloginotp", company.resendLoginOTP);


router.post("/company/logout", authMiddleware, company.logoutCompany);

router.post("/company/forgetpasssendotp", company.forgetPasswordSendOTP);

router.post("/company/verifyforgetotp", company.forgetPasswordVerifyOTP);

router.post("/company/resetpassword", company.forgetPasswordReset);

router.post("/company/testing", company.testing);

module.exports = router;

