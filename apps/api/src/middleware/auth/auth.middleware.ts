import { Response, NextFunction } from "express";
import { AuthRequest } from "../../interfaces";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

const OTP_VERIFY_PATH = "/api/auth/verify-otp";
const OTP_RESEND_PATH = "/api/auth/resend-otp";

const AuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized - no token provided",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // OTP token
    if (decoded.type === "otp_verification") {
      if (
        req.originalUrl !== OTP_VERIFY_PATH &&
        req.originalUrl !== OTP_RESEND_PATH
      ) {
        return res.status(403).json({
          code: 403,
          message:
            "OTP token only allowed for verify-otp and resend-otp endpoints",
          data: null,
        });
      }
      req.user = decoded;
    }

    // Access token
    else if (decoded.type === "access_token") {
      if (req.originalUrl === OTP_VERIFY_PATH) {
        return res.status(403).json({
          code: 403,
          message: "Access token not allowed for verify-otp endpoint",
          data: null,
        });
      }
      req.user = decoded;
    } else {
      return res.status(401).json({
        code: 401,
        message: "Invalid token type",
        data: null,
      });
    }

    next();
  } catch {
    return res.status(401).json({
      code: 401,
      message: "Invalid or expired token",
      data: null,
    });
  }
};

export default AuthMiddleware;
