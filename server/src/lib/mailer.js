/**
 * Resend Email Configuration
 * - Uses Resend API for reliable email delivery
 * - Requires RESEND_API_KEY configured in .env
 * - No SMTP setup needed - everything via API
 */

import { Resend } from "resend";

let resendInstance = null;
let resendInitError = null;

function getResend() {
  if (resendInitError) {
    throw resendInitError;
  }

  if (resendInstance === null) {
    const apiKey = String(process.env.RESEND_API_KEY || "").trim();

    if (!apiKey) {
      const error = new Error(
        "❌ RESEND_API_KEY is not configured. Set it in .env file. Get your key from https://resend.com/api-keys"
      );
      console.error(error.message);
      resendInitError = error;
      throw error;
    }

    try {
      resendInstance = new Resend(apiKey);
      console.log("✅ Resend email service initialized successfully!");
    } catch (err) {
      const error = new Error(`Failed to initialize Resend: ${err.message}`);
      console.error(error.message);
      resendInitError = error;
      throw error;
    }
  }

  return resendInstance;
}

function normalizeFromAddress(value) {
  const text = String(value || "").trim();
  const angled = text.match(/<([^>]+)>/);

  if (angled?.[1]) {
    return angled[1].trim();
  }

  return text;
}

export async function sendUserCredentialsEmail({ to, username, password, role, category, loginUrl, isTemporaryPassword = true }) {
  // Validate required parameters
  if (!to) {
    throw new Error("Email recipient (to) is required.");
  }
  if (!username) {
    throw new Error("Username is required.");
  }
  if (!password) {
    throw new Error("Password is required.");
  }
  if (!role) {
    throw new Error("Role is required.");
  }

  // Get Resend instance
  const resend = getResend();

  const from = normalizeFromAddress(process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev");
  const loginUrl_ = loginUrl || process.env.APP_LOGIN_URL || "http://localhost:5173/login";

  // Debug logging
  console.log(`📤 Preparing to send credentials email via Resend to: ${to}`);
  console.log(`   From: ${from}`);
  console.log(`   Role: ${role}`);
  if (category) {
    console.log(`   Category: ${category}`);
  }

  const subject = isTemporaryPassword
    ? "Your SSCMS Account Credentials - Temporary Password"
    : "Your SSCMS Account Credentials";

  const passwordNote = isTemporaryPassword
    ? "<p style='color: #d97706; font-weight: bold;'>⚠️ This is a temporary password. You will be required to change it on your first login.</p>"
    : "";

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9fafb;
      }
      .header {
        background-color: #1f2937;
        color: white;
        padding: 20px;
        border-radius: 8px 8px 0 0;
        text-align: center;
      }
      .content {
        background-color: white;
        padding: 30px;
        border-radius: 0 0 8px 8px;
      }
      .credentials-box {
        background-color: #f3f4f6;
        padding: 20px;
        border-left: 4px solid #3b82f6;
        margin: 20px 0;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
      }
      .credential-item {
        margin: 10px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .credential-label {
        font-weight: bold;
        color: #1f2937;
        min-width: 100px;
      }
      .credential-value {
        font-weight: 600;
        color: #1f2937;
        background-color: white;
        padding: 8px 12px;
        border-radius: 4px;
        word-break: break-all;
      }
      .warning {
        background-color: #fef3c7;
        border: 1px solid #fcd34d;
        padding: 15px;
        border-radius: 4px;
        margin: 20px 0;
        color: #92400e;
      }
      .login-button {
        display: inline-block;
        background-color: #3b82f6;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
        font-weight: bold;
      }
      .footer {
        border-top: 1px solid #e5e7eb;
        margin-top: 20px;
        padding-top: 20px;
        font-size: 12px;
        color: #6b7280;
      }
      .role-badge {
        display: inline-block;
        background-color: #dbeafe;
        color: #1e40af;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        margin-left: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to SSCMS</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Your SSCMS account has been created successfully. Below are your account credentials:</p>

        <div class="credentials-box">
          <div class="credential-item">
            <span class="credential-label">Username:</span>
            <span class="credential-value">${username}</span>
          </div>
          <div class="credential-item">
            <span class="credential-label">Password:</span>
            <span class="credential-value">${password}</span>
          </div>
          <div class="credential-item">
            <span class="credential-label">Role:</span>
            <span class="credential-value">${role}${category ? ` <span class="role-badge">${category}</span>` : ""}</span>
          </div>
        </div>

        ${passwordNote}

        <div class="warning">
          <strong>🔒 Security Notice:</strong>
          <ul>
            <li>Keep your credentials secure and do not share them with anyone</li>
            <li>Change your password immediately after first login</li>
            <li>Use a strong password combining letters, numbers, and special characters</li>
          </ul>
        </div>

        <p>
          <a href="${loginUrl_}" class="login-button">Login to SSCMS</a>
        </p>

        <p>If you did not request this account or have any questions, please contact the SSCMS administrator.</p>

        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© 2026 SSCMS. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim();

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html: htmlContent,
    });

    if (result.error) {
      throw new Error(`Resend API error: ${result.error.message}`);
    }

    console.log(`✅ Email sent successfully to ${to}. ID:`, result.data?.id);
    return { sent: true, messageId: result.data?.id };
  } catch (err) {
    const error = new Error(`Failed to send email to ${to}: ${err.message}`);
    console.error(`❌ ${error.message}`);
    throw error;
  }
}

export async function sendCredentialEmail(args) {
  return sendUserCredentialsEmail(args);
}

/**
 * Test function to verify Resend configuration
 * Sends a test email to validate API key and setup
 */
export async function testEmail() {
  console.log("\n🧪 Running Resend configuration test...");

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not configured. Cannot run email test.");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  if (!fromEmail) {
    console.error("❌ RESEND_FROM_EMAIL is not configured. Using default onboarding@resend.dev");
  }

  try {
    const result = await sendUserCredentialsEmail({
      to: fromEmail || "test@example.com",
      username: "test.user",
      password: "TestPassword123!",
      role: "ADMIN",
      category: "TEST",
      loginUrl: "http://localhost:800/login",
      isTemporaryPassword: true,
    });

    console.log("✅ Test email sent successfully!");
    console.log(`   Message ID: ${result.messageId}`);
    return { success: true, result };
  } catch (err) {
    console.error("❌ Test email failed:", err.message);
    return { success: false, error: err.message };
  }
}
