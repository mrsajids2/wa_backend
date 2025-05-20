const express = require('express');
const router = express.Router();
const user =require("../controllers/userController");

router.post("/signup", user.signUpUser);

router.post("/login", user.loginUser);

module.exports = router;
