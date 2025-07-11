const redisClient = require("../config/redisClient");

// lib/session.js
const createSession = async (token, userData) => {
  // console.log(`Creating session for token: ${token}`);
  // console.log(`User data:`, userData);
  console.log(`Expiry: ${parseInt(process.env.SESSION_EXPIRY, 10)} seconds`);

  try {
    await redisClient.setEx(
      `session:${token}`,
      parseInt(process.env.SESSION_EXPIRY, 10),
      JSON.stringify(userData)
    );
    // console.log('Session created successfully');
  } catch (err) {
    console.error("Redis setEx error:", err);
    throw err;
  }
};

const getSession = async (token) => {
  const session = await redisClient.get(`session:${token}`);
  return session ? JSON.parse(session) : null;
};

const updateSessionExpiry = async (token) => {
  await redisClient.expire(
    `session:${token}`,
    parseInt(process.env.SESSION_EXPIRY, 10)
  );
};

const deleteSession = async (token) => {
  await redisClient.del(`session:${token}`);
};
// lib/session.js
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


const createSignUpSession = async (userData) => {
  // // console.log(`Creating session for token: ${token}`);
  // console.log(`User data:`, userData);
  // console.log(`Expiry: ${parseInt(process.env.SESSION_EXPIRY, 10)} seconds`);

  try {
    // key, expiry, value
    await redisClient.setEx(
      `session:${userData.email}`, // Use email as key for signup session
      parseInt(process.env.SESSION_EXPIRY, 10),
      JSON.stringify(userData)
    );
    return userData;
    // console.log('Session created successfully');
  } catch (err) {
    console.error("Redis setEx error:", err);
    throw err;
  }
};


const getSignUpSession = async (email) => {
  const session = await redisClient.get(`session:${email}`);
  return session ? JSON.parse(session) : null;
};

const deleteSignUpSession = async (email) => {
  await redisClient.del(`session:${email}`);
  return `SignUp session for ${email} deleted successfully`;
};

const createOtpSessionForMobile = async (
  mobile,
  otp,
  type = "signup",
  maxSends = 3,
  windowSeconds = 180
) => {
  const sessionKey = `${type}:mobile:${mobile}`;
  const sendsKey = `${type}:mobile:sends:${mobile}`;
  const countStr = await redisClient.get(sendsKey);
  const count = parseInt(countStr || "0");

  // Case 1: First-time send
  if (!countStr) {
    const sessionData = {
      mobile,
      otp,
      sessiontype: type.toUpperCase(),
      time: new Date().toISOString(),
    };

    await redisClient.set(sessionKey, JSON.stringify(sessionData), {
      EX: windowSeconds,
    });
    await redisClient.set(sendsKey, 1, { EX: windowSeconds });

    return {
      allowed: true,
      count: 1,
      message: `OTP session created (1 of ${maxSends})`,
      session: sessionData,
    };
  }

  // Case 2: Too many sends
  if (count >= maxSends) {
    const ttl = await redisClient.ttl(sendsKey);
    return {
      allowed: false,
      count,
      message: `OTP limit reached. Try again in ${ttl} seconds.`,
      session: null,
    };
  }

  // Case 3: Increment count, update session
  const sessionData = {
    mobile,
    otp,
    sessiontype: type.toUpperCase(),
    time: new Date().toISOString(),
  };

  await redisClient.set(sessionKey, JSON.stringify(sessionData), {
    EX: windowSeconds,
  });
  await redisClient.incr(sendsKey);

  return {
    allowed: true,
    count: count + 1,
    message: `OTP session updated (${count + 1} of ${maxSends})`,
    session: sessionData,
  };
};

async function getOtpSessionForMobile(mobile, type = "signup") {
  const sessionKey = `${type}:mobile:${mobile}`;
  const sendsKey = `${type}:mobile:sends:${mobile}`;

  const [sessionValue, countStr, ttl] = await Promise.all([
    redisClient.get(sessionKey),
    redisClient.get(sendsKey),
    redisClient.ttl(sessionKey),
  ]);

  const count = parseInt(countStr || "0");

  if (!sessionValue) {
    return {
      allowed: false,
      session: null,
      count,
      ttl: 0,
      message: "OTP session not found or expired",
    };
  }

  const session = JSON.parse(sessionValue);

  return {
    allowed: true,
    session,
    count,
    ttl, // in seconds
    message: `OTP session found (used ${count} times, expires in ${ttl} seconds)`,
  };
}

async function deleteOtpSessionForMobile(mobile, type = "signup") {
  const sessionKey = `${type}:mobile:${mobile}`;
  const sendsKey = `${type}:mobile:sends:${mobile}`;

  const deleted = await redisClient.del(sessionKey, sendsKey);

  return {
    status: "success",
    deletedKeys: deleted,
    message: "OTP session and send count deleted",
  };
}

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
const createOtpSessionForMobile_v1 = async (
  mobile,
  otp,
  type = "signup",
  maxSends = 3
) => {
  const sessionKey = `${type}:mobile:${mobile}`; // OTP session (expires in 2m)
  const sendsKey = `${type}:mobile:sends:${mobile}:24h`; // Count of sends (expires in 24h)

  const otpSessionTTL = 2 * 60; // 2 minutes in seconds
  const sendLimitTTL = 24 * 60 * 60; // 24 hours in seconds

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
    EX: otpSessionTTL,
  });

  // If first send, set count = 1 with 24h expiry
  if (!countStr) {
    await redisClient.set(sendsKey, 1, { EX: sendLimitTTL });
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
async function getOtpSessionForMobile_v1(mobile, type = "signup") {
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
async function deleteOtpSessionForMobile_v1(mobile, type = "signup") {
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
  const expireTtl = 24 * 60 * 60; // 24 hours in seconds
  const sessionData = {
    mobile,
    time: new Date().toISOString(),
    ...data, // add role, device info, token, etc. if needed
  };

  try {
    await redisClient.set(sessionKey, JSON.stringify(sessionData), {
      EX: expireTtl,
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
  const expireTtl = 24 * 60 * 60; // 24 hours in seconds

  await redisClient.expire(
    `session:user:${mobile}`,
    parseInt(expireTtl, 10)
  );
};

module.exports = {
  createSession,
  getSession,
  updateSessionExpiry,
  deleteSession,
  getSessionTTL,
  createSignUpSession,
  getSignUpSession,
  deleteSignUpSession,
  createOtpSessionForMobile,
  getOtpSessionForMobile,
  deleteOtpSessionForMobile,
  checkAllRedisData,
  deleteAllRedisData,
  createOtpSessionForMobile_v1,
  getOtpSessionForMobile_v1,
  deleteOtpSessionForMobile_v1,
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
