// utils/responseManager.js

const sendResponse = (
  res,
  statuscode,
  status,
  message,
  entity = null,
  error = null
) => {
  return res.status(200).json({
    status,
    statuscode,
    message,
    entity,
    error,
  });
};

const ResponseManager = {
  success: (res, statuscode = 200, message = "Success", entity = {}) =>
    sendResponse(res, statuscode, true, message, entity),

  created: (res, message = "Resource created", entity = {}) =>
    sendResponse(res, 201, true, message, entity),

  badRequest: (res, message = "Bad request", error = {}) =>
    sendResponse(res, 400, true, message, null, error),

  unauthorized: (res, message = "Unauthorized") =>
    sendResponse(res, 401, true, message),

  forbidden: (res, message = "Forbidden") =>
    sendResponse(res, 403, true, message),

  alreadyExist: (res, message = "Already exists") =>
    sendResponse(res, 208, true, message),

  notFound: (res, message = "Not Date Found") =>
    sendResponse(res, 404, true, message),

  serverError: (res, statuscode = 500, message = "Internal Server Error", error = {}) =>
    sendResponse(res, statuscode, true, message, null, error),
};

module.exports = ResponseManager;
