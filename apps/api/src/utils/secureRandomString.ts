import { randomBytes } from "crypto";

export const secureRandomString = (length: number): string => {
  return randomBytes(length).toString("base64url").slice(0, length);
};
