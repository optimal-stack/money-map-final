import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimit.limit("my-rate-limit");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later.",
      });
    }

    next();
  } catch (error) {
    // In development, allow requests to continue if rate limiter fails
    // This prevents Upstash configuration issues from blocking local development
    if (process.env.NODE_ENV !== "production") {
      console.log("Rate limit error (continuing in dev mode):", error.message);
      next();
    } else {
      console.log("Rate limit error", error);
      next(error);
    }
  }
};

export default rateLimiter;
