import { baseTemplate } from "./base";

export const verifyEmailTemplate = (url: string) =>
  baseTemplate(`
    <h2>Verify Your Email</h2>
    <p>Please click the button below to verify your email address.</p>

    <a href="${url}"
      style="
        display:inline-block;
        padding:12px 20px;
        background:#4f46e5;
        color:#fff;
        text-decoration:none;
        border-radius:6px;
        margin-top:16px;
      ">
      Verify Email
    </a>

    <p style="margin-top:24px;font-size:12px;color:#666">
      If you didn’t create an account, ignore this email.
    </p>
  `);
