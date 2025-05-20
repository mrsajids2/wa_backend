// utils/responseManager.js

const sendResponse = (
  res,
  statuscode,
  status,
  message,
  data = null,
  error = null
) => {
  return res.status(statuscode).json({
    status,
    statuscode,
    message,
    data,
    error,
  });
};

const ResponseManager = {
  success: (res, message = "Success", data = {}) =>
    sendResponse(res, 200, true, message, data),

  created: (res, message = "Resource created", data = {}) =>
    sendResponse(res, 201, true, message, data),

  badRequest: (res, message = "Bad request", error = {}) =>
    sendResponse(res, 400, false, message, null, error),

  unauthorized: (res, message = "Unauthorized") =>
    sendResponse(res, 401, false, message),

  forbidden: (res, message = "Forbidden") =>
    sendResponse(res, 403, false, message),

  alreadyExist: (res, message = "Already exists") =>
    sendResponse(res, 208, false, message),

  notFound: (res, message = "Not Date Found") =>
    sendResponse(res, 404, false, message),

  serverError: (res, message = "Internal Server Error", error = {}) =>
    sendResponse(res, 500, false, message, null, error),
};

module.exports = ResponseManager;
