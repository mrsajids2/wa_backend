const redisClient = require("../../config/redisClient");
const OTP_SESSION_TTL = parseInt(process.env.OTP_SESSION_EXPIRE_SECONDS);        
const OTP_SEND_LIMIT_TTL = parseInt(process.env.OTP_SEND_LIMIT_EXPIRE_SECONDS); 
const LOGIN_SESSION_TTL = parseInt(process.env.LOGIN_SESSION_EXPIRE_SECONDS); 

const getSessionTTL = async (token) => {
  // await ensureRedisConnection();
  const redis = redisClient();

  try {
    const ttl = await redis.ttl(`session:${token}`);
    return ttl;
  } catch (err) {
    console.error("Failed to get session TTL:", err);
    throw new Error("Failed to check session expiration");
  }
};

// check all redis data
const checkAllRedisData = async () => {
  const keys = await redisClient.keys("*");
  const data = await Promise.all(keys.map((key) => redisClient.get(key)));
  return keys.map((key, index) => ({ key, value: data[index] }));
};

// delete all redis data
const deleteAllRedisData = async () => {
  const keys = await redisClient.keys("*");
  if (keys.length > 0) {
    const deletedCount = await redisClient.del(keys);
    return {
      status: "success",
      deletedCount,
      message: `Deleted ${deletedCount} keys from Redis`,
    };
  }
  return {
    status: "success",
    deletedCount: 0,
    message: "No keys to delete in Redis",
  };
};

// using for otp session(login and signup)
const createOtpSessionForOTP = async (
  mobile,
  otp,
  type = "signup"
) => {
  const sessionKey = `${type}:mobile:${mobile}`; // OTP session (expires in 2m)
  const sendsKey = `${type}:mobile:sends:${mobile}:24h`; // Count of sends (expires in 24h)
  const maxSends = parseInt(process.env.MAXOTPSENTCOUNT);
  // const otpSessionTTL = 2 * 60; // 2 minutes in seconds
  // const sendLimitTTL = 24 * 60 * 60; // 24 hours in seconds

  const countStr = await redisClient.get(sendsKey);
  const count = parseInt(countStr || "0");

  // If max sends exceeded
  if (count >= maxSends) {
    const ttl = await redisClient.ttl(sendsKey);
    return {
      allowed: false,
      count,
      message: `OTP limit reached for 24h. Try again in ${ttl} seconds.`,
      session: null,
    };
  }

  // Store OTP session (2 minutes)
  const sessionData = {
    mobile,
    otp,
    sessiontype: type.toUpperCase(),
    time: new Date().toISOString(),
  };

  await redisClient.set(sessionKey, JSON.stringify(sessionData), {
    EX: OTP_SESSION_TTL,
  });

  // If first send, set count = 1 with 24h expiry
  if (!countStr) {
    await redisClient.set(sendsKey, 1, { EX: OTP_SEND_LIMIT_TTL });
  } else {
    await redisClient.incr(sendsKey); // just increment; TTL remains
  }

  return {
    allowed: true,
    count: count + 1,
    message: `OTP session created (${count + 1} of ${maxSends} for 24h)`,
    session: sessionData,
  };
};

// using for otp session(login and signup)
async function getOtpSessionForMobile(mobile, type = "signup") {
  const sessionKey = `${type}:mobile:${mobile}`;
  const sendsKey = `${type}:mobile:sends:${mobile}:24h`;

  const [sessionStr, countStr, ttl] = await Promise.all([
    redisClient.get(sessionKey),
    redisClient.get(sendsKey),
    redisClient.ttl(sessionKey),
  ]);

  const count = parseInt(countStr || "0");

  if (!sessionStr) {
    return {
      success: false,
      session: null,
      count,
      ttl: 0,
      // message: 'OTP session expired or not found',
      message: "OTP expired.",
    };
  }

  return {
    success: true,
    session: JSON.parse(sessionStr),
    count,
    ttl,
    message: `OTP session found (used ${count} times, expires in ${ttl} sec)`,
  };
}
// using for otp session(login and signup)
async function deleteOtpSessionForMobile(mobile, type = "signup") {
  const sessionKey = `${type}:mobile:${mobile}`;
  const sendsKey = `${type}:mobile:sends:${mobile}:24h`;

  const deleted = await redisClient.del(sessionKey, sendsKey);

  return {
    status: "success",
    deletedKeys: deleted,
    message: "OTP session and send count cleared",
  };
}

// using for login session
async function createLoginSession(mobile, data) {
  const sessionKey = `session:user:${mobile}`;
  // const expireTtl = 24 * 60 * 60; // 24 hours in seconds
  const sessionData = {
    mobile,
    time: new Date().toISOString(),
    ...data, // add role, device info, token, etc. if needed
  };

  try {
    await redisClient.set(sessionKey, JSON.stringify(sessionData), {
      EX: LOGIN_SESSION_TTL,
    });
    return {
      allowed: true,
      message: "Login session created",
      session: sessionData,
    };
  } catch (err) {
    console.error("Redis set error in createLoginSession:", err);
    throw err;
  }
}

// using for login session
async function getLoginSession(mobile) {
  const sessionKey = `session:user:${mobile}`;
  const data = await redisClient.get(sessionKey);

  if (!data) {
    return {
      success: false,
      session: null,
      message: "Session not found or expired",
    };
  }

  return {
    success: true,
    session: JSON.parse(data),
    message: "Session found",
  };
}

// using for login session
async function deleteLoginSession(mobile) {
  const sessionKey = `session:user:${mobile}`;
  await redisClient.del(sessionKey);
  return {
    success: true,
    message: "Login session deleted",
  };
}
// using for login session expire update
async function updateLoginSessionExpiry (mobile) {
  // const expireTtl = 24 * 60 * 60; // 24 hours in seconds

  await redisClient.expire(
    `session:user:${mobile}`,
    parseInt(LOGIN_SESSION_TTL, 10)
  );
};

module.exports = {
  getSessionTTL,
  checkAllRedisData,
  deleteAllRedisData,
  createOtpSessionForOTP,
  getOtpSessionForMobile,
  deleteOtpSessionForMobile,
  createLoginSession,
  getLoginSession,
  deleteLoginSession,
  updateLoginSessionExpiry
};

// // Add to exports
// module.exports = {
//   // ... other exports
//   getSessionTTL
// };
