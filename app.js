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

// Routers
const indexRouter = require("./routes/index");
const companyRouter = require("./routes/company.route");
const userRouter = require("./routes/user.route");
const listRouter = require("./routes/list.route");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/api", companyRouter);
app.use("/api", userRouter);
app.use("/api", listRouter);

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
