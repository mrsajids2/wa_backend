var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const bookRouter = require('./routes/books');
const reviewRouter = require('./routes/reviews');
const companyRouter = require("./routes/company")
var cors = require('cors');
// const { dbConnection } = require('./config/dbconfig');
const { errorHandler } = require("./utils/ErrorHandler");

var app = express();
// dbConnection();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', companyRouter);
// app.use('/users', usersRouter);
// app.use('/api', bookRouter);
// app.use('/api', reviewRouter);

app.use(errorHandler);

module.exports = app;
