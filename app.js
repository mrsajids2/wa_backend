#!/usr/bin/env node

require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const cors = require("cors");
const debug = require("debug")("book-review-api:server");

const { errorHandler } = require("./utils/ErrorHandler");

// Initialize Redis
require("./config/redisClient");

// Initialize Kafka client and producer
// const produceMessage = require('./lib/kafka/producer');
// const startConsumer = require('./lib/kafka/consumer');
const { sendMessage } = require('./lib/kafka/producer');

// Routers
const indexRouter = require("./routes/index");
const companyRouter = require("./routes/company.route");
const userRouter = require("./routes/user.route");
const listRouter = require("./routes/list.route");
const templateRouter = require("./routes/template.route");
const callbackRouter = require("./routes/callback.route");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API to send Kafka message
// app.post('/publish', async (req, res) => {
//   const { topic, message } = req.body;

//   try {
//     await produceMessage(topic, message);
//     res.status(200).json({ success: true, message: 'Message sent to Kafka' });
//   } catch (err) {
//     console.error('Error sending message:', err);
//     res.status(500).json({ success: false, error: 'Kafka error' });
//   }
// });

// Test API to produce template-approved event to Kafka
app.post('/api/fake-template-approve', async (req, res) => {
  const { templateid, companyid, templatename } = req.body;
  console.log(req.body);
  
  if (!templateid || !companyid || !templatename) {
    return res.status(400).json({ error: 'templateid, companyid, templatename required' });
  }
  await sendMessage('template-approved', {
    templateid,
    companyid,
    templatename
  });
  res.json({ message: 'template-approved event produced', data: { templateid, companyid, templatename } });
});

// Start Kafka consumer (optional)
// startConsumer().catch(console.error); // This will now work
// Routes
// app.use("/", indexRouter);
app.use("/api", companyRouter);
app.use("/api", userRouter);
app.use("/api", listRouter);
app.use("/api", templateRouter);
app.use("/", callbackRouter);

// Global error handler
app.use(errorHandler);

// Define port and create server
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);

// Start server
server.listen(port, () => {
  console.log(`✅ Server is listening on port ${port}`);
});

server.on("error", onError);
server.on("listening", onListening);

// Helper functions
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== "listen") throw error;

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
