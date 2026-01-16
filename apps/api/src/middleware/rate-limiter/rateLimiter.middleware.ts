import { AuthRequest } from "@/interfaces";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

type RateLimiterOptions = {
  windowMs: number;
  max: number;
  message?: string;
};

const rateLimiter = ({
  windowMs,
  max,
  message = "Too many requests",
}: RateLimiterOptions) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
    keyGenerator: (req: AuthRequest) => {
      if (req.user?.id) {
        return `user:${req.user.id}`;
      }
      return ipKeyGenerator(req.ip!);
    },
  });

export default rateLimiter;
