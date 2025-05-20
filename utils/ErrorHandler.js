// errorHandler.js
exports.errorHandler = (err, req, res, next) => {
if(process.env.MODE==='development')
  console.error(err); // for debugging, remove in prod

  res.status(err?.statusCode || 500).json({
    status: false,
    statuscode: err?.statusCode || 500,
    message: err?.message || "Something went wrong",
    error: err,
  });
};
