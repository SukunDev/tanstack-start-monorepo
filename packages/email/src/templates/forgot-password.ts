import { baseTemplate } from "./base";

export const forgotPasswordTemplate = (url: string) =>
  baseTemplate(`
    <h2>Reset Your Password</h2>
    <p>You requested a password reset.</p>

    <a href="${url}"
      style="
        display:inline-block;
        padding:12px 20px;
        background:#dc2626;
        color:#fff;
        text-decoration:none;
        border-radius:6px;
        margin-top:16px;
      ">
      Reset Password
    </a>

    <p style="margin-top:24px;font-size:12px;color:#666">
      This link expires in 15 minutes.
    </p>
  `);
