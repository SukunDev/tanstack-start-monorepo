# @packages/email

Email service package for sending transactional and notification emails using Nodemailer.

## 📦 Overview

This package provides:

- **Nodemailer integration** for email delivery
- **Email templates** for common use cases
- **Type-safe email functions**
- **SMTP configuration** management

## 📁 Structure

```
packages/email/
├── src/
│   ├── index.ts              # Main export
│   ├── email.ts              # Core email service
│   ├── templates/            # Email templates
│   │   ├── base.ts           # Base template
│   │   ├── otp.ts            # OTP email template
│   │   ├── verify-email.ts   # Email verification
│   │   └── forgot-password.ts # Password reset
│   └── types.ts              # TypeScript types
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

### 1. Setup SMTP Configuration

Configure in `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### 2. Using Email Service

```typescript
import { sendEmail } from "@packages/email";

// Send simple email
await sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Welcome to our platform</h1>",
});

// Send with template
import { otpTemplate } from "@packages/email/templates";

await sendEmail({
  to: "user@example.com",
  subject: "Your OTP Code",
  html: otpTemplate({ code: "123456" }),
});
```

## 📧 Email Templates

### Base Template

```typescript
import { baseTemplate } from "@packages/email/templates";

const html = baseTemplate({
  title: "Welcome",
  content: "<p>Your content here</p>",
  footerText: "© 2026 Our Company",
});
```

### OTP Template

```typescript
import { otpTemplate } from "@packages/email/templates";

const html = otpTemplate({
  code: "123456",
  expiryMinutes: 10,
});
```

### Email Verification Template

```typescript
import { verifyEmailTemplate } from "@packages/email/templates";

const html = verifyEmailTemplate({
  verificationLink: "https://app.example.com/verify?token=...",
  expiryHours: 24,
});
```

### Password Reset Template

```typescript
import { forgotPasswordTemplate } from "@packages/email/templates";

const html = forgotPasswordTemplate({
  resetLink: "https://app.example.com/reset?token=...",
  expiryHours: 1,
});
```

## 🔧 Configuration

### SMTP Providers

#### Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
# Use App Password, not your regular Gmail password
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=your-email@gmail.com
```

[Setup Gmail App Password](https://support.google.com/accounts/answer/185833)

#### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxx
SMTP_FROM=noreply@yourdomain.com
```

#### AWS SES

```bash
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=verified-email@yourdomain.com
```

#### Resend

```bash
# Use REST API instead:
# npm install resend
```

## 📝 Creating Custom Templates

### Template Structure

```typescript
// src/templates/custom.ts

export interface CustomTemplateData {
  userName: string;
  actionUrl: string;
}

export function customTemplate(data: CustomTemplateData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .button { 
            background: #007bff; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hello, ${data.userName}!</h1>
          <p>Click the button below to continue:</p>
          <a href="${data.actionUrl}" class="button">Continue</a>
        </div>
      </body>
    </html>
  `;
}
```

### Export in index.ts

```typescript
// src/index.ts
export * from "./templates/custom";
```

### Usage

```typescript
import { customTemplate } from "@packages/email";

await sendEmail({
  to: "user@example.com",
  subject: "Action Required",
  html: customTemplate({
    userName: "John",
    actionUrl: "https://example.com/action",
  }),
});
```

## 🎯 Common Use Cases

### Send OTP

```typescript
const sendOtp = async (email: string, otp: string) => {
  await sendEmail({
    to: email,
    subject: "Your One-Time Password",
    html: otpTemplate({
      code: otp,
      expiryMinutes: 15,
    }),
  });
};
```

### Email Verification

```typescript
const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `https://app.example.com/verify?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html: verifyEmailTemplate({
      verificationLink,
      expiryHours: 24,
    }),
  });
};
```

### Password Reset

```typescript
const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `https://app.example.com/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: forgotPasswordTemplate({
      resetLink,
      expiryHours: 1,
    }),
  });
};
```

### Bulk Emails

```typescript
const sendBulkEmail = async (
  recipients: string[],
  subject: string,
  html: string
) => {
  const promises = recipients.map((email) =>
    sendEmail({ to: email, subject, html })
  );

  await Promise.all(promises);
};
```

## ⚠️ Best Practices

1. **Always use verified sender addresses** in production
2. **Implement rate limiting** to avoid spam filters
3. **Test with actual SMTP provider** before production
4. **Use environment variables** for sensitive data
5. **Log failed emails** for debugging
6. **Implement retry logic** for failed attempts
7. **Use plain text fallback** with HTML emails
8. **Avoid suspicious content** (all caps, too many links)

## 🔒 Error Handling

```typescript
try {
  await sendEmail({
    to: "user@example.com",
    subject: "Test",
    html: "<p>Test</p>",
  });
  console.log("Email sent successfully");
} catch (error) {
  console.error("Failed to send email:", error);
  // Implement your retry logic here
  // Or save to queue for later processing
}
```

## 🧪 Testing

### Mock Email Service (for testing)

```typescript
// In test files
jest.mock("@packages/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));
```

### Test Case Example

```typescript
import { sendEmail } from "@packages/email";

describe("Email Service", () => {
  it("should send OTP email", async () => {
    await expect(
      sendEmail({
        to: "test@example.com",
        subject: "OTP",
        html: "<p>123456</p>",
      })
    ).resolves.not.toThrow();
  });
});
```

## 📊 Email Monitoring

Consider integrating with:

- **SendGrid** - Dashboard for sent/open/click tracking
- **Mailgun** - Advanced analytics
- **AWS SES** - CloudWatch metrics
- **Custom logging** - Log all email attempts to database

## 🔗 Related Documentation

- [Nodemailer Docs](https://nodemailer.com/)
- [Email Best Practices](https://www.campaignmonitor.com/resources/guides/email-marketing-best-practices/)
- [Monorepo README](../../README.md)

## 📄 License

MIT
