const responseManager = {
  success: (res, statusCode, message, data = {}) => {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  },

  badRequest: (res, message) => {
    return res.status(400).json({
      status: "error",
      message,
    });
  },

  forbidden: (res, message) => {
    return res.status(403).json({
      status: "error",
      message,
    });
  },

  serverError: (res, message) => {
    return res.status(500).json({
      status: "error",
      message,
    });
  },
};

module.exports = responseManager;