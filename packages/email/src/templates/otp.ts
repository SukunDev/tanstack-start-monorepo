import { baseTemplate } from "./base";

export const otpTemplate = (otp: string) =>
  baseTemplate(`
    <h2>Your OTP Code</h2>
    <p>Use the code below:</p>
    <h1 style="letter-spacing:4px">${otp}</h1>
    <p>This code expires in 5 minutes.</p>
  `);
