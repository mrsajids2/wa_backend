var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth.route");
const contactRouter = require("./routes/contact.route");
const listRouter = require("./routes/list.route");
const cors = require("cors");
const { errorHandler } = require("./utils/ErrorHandler");

const app = express();
// / Initialize Redis connection
require("./config/redisClient");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/api", authRouter);
app.use("/api", contactRouter);
app.use("/api", listRouter);

app.use(errorHandler);

module.exports = app;
