const response = require("../utils/responseManager");
const {
  getLoginSession,
  updateLoginSessionExpiry,
  deleteLoginSession,
} = require("../lib/redis/session");
const { verifyToken } = require("../utils/userHelper");
// middleware/auth.middleware.js
const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    // console.log('Extracted token:', token); // Log the raw token

    if (!token) {
      // console.log('No token provided');
      return response.forbidden(res, "No token provided");
    }

    // Verify JWT first
    console.log("Verifying JWT...");
    const decoded = verifyToken(token);
    // console.log("\nDecoded JWT:", decoded); // Log the decoded token
    if (!decoded) {
      // console.log("Invalid JWT - deleting session");
      await deleteLoginSession(decoded?.companyid).catch((err) => {
        console.error("Failed to delete session:", err);
      });
      return response.unauthorized(res, "Invalid token");
    }

    // Check Redis session
    // console.log('Checking Redis session for token:', token);
    const session = await getLoginSession(decoded.companyid);
    // console.log("Retrieved session:", session);

    if (!session || !session.success) {
      console.log("No session found in Redis");
      return response.unauthorized(res, "Session expired");
    }

    // Update session expiry
    console.log("Updating session expiry...");
    await updateLoginSessionExpiry(decoded.companyid).catch((err) => {
      console.error("Failed to update login session expiry:", err);
      return response.serverError(res, "Failed to update session expiry");
    });

    req.user = session;
    req.token = token;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return response.serverError(res, "Internal server error");
  }
};
function extractToken(req) {
  return req.headers.authorization?.split(" ")[1];
}

module.exports = authMiddleware;
