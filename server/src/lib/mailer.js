/**
 * SMTP Configuration for Gmail:
 * - Must use Gmail App Password (NOT regular Gmail password)
 * - Requires 2FA to be enabled on the Gmail account
 * - App Password should be generated at: https://myaccount.google.com/apppasswords
 */

let cachedTransporter = null;
let transporterInitError = null;

async function createTransporter() {
  // Validate required environment variables before attempting connection
  const smtpUser = String(process.env.SMTP_USER || "").trim();
  const smtpPass = String(process.env.SMTP_PASS || "").trim();

  if (!smtpUser) {
    const error = new Error(
      "❌ SMTP_USER is not configured. Set it in .env file (typically a Gmail address like your-email@gmail.com)."
    );
    console.error(error.message);
    throw error;
  }

  if (!smtpPass) {
    const error = new Error(
      "❌ SMTP_PASS is not configured. Set it in .env file. For Gmail, use an App Password (not your regular password)."
    );
    console.error(error.message);
    throw error;
  }

  // Sanitize password: remove any whitespace (spaces, tabs, newlines)
  const sanitizedPass = smtpPass.replace(/\s+/g, "");
  if (sanitizedPass !== smtpPass) {
    console.warn(
      "⚠️  WARNING: SMTP_PASS contained whitespace. Automatically sanitized. Remove spaces from your .env file."
    );
  }

  let nodemailer;
  try {
    ({ default: nodemailer } = await import("nodemailer"));
  } catch (err) {
    const error = new Error(`Failed to import nodemailer: ${err.message}`);
    console.error(error.message);
    throw error;
  }

  console.log("📧 Initializing SMTP transporter for:", smtpUser);

  // Simplified Gmail-safe configuration
  // Using "service: gmail" is the most reliable approach for Gmail SMTP
  const transportConfig = {
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: sanitizedPass,
    },
  };

  const transporter = nodemailer.createTransport(transportConfig);

  // Verify the connection before caching
  console.log("🔐 Verifying SMTP connection...");
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!");
  } catch (err) {
    const error = new Error(`❌ SMTP verification failed: ${err.message}`);
    console.error(error.message);
    console.error(
      "   Troubleshooting: Check that SMTP_USER and SMTP_PASS are correct, and that your Gmail account has 2FA enabled."
    );
    throw error;
  }

  return transporter;
}

export function getMailer() {
  if (transporterInitError) {
    throw transporterInitError;
  }

  if (cachedTransporter === null) {
    cachedTransporter = createTransporter().catch((err) => {
      transporterInitError = err;
      throw err;
    });
  }

  return cachedTransporter;
}

export async function sendUserCredentialsEmail({ to, username, password, role, category, loginUrl }) {
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

  // Get the transporter
  const transporter = await getMailer();
  if (!transporter) {
    throw new Error("SMTP transporter is not available.");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error("SMTP_FROM or SMTP_USER must be configured in .env");
  }

  // Debug logging
  console.log(`📤 Preparing to send credentials email to: ${to}`);
  console.log(`   From: ${from}`);
  console.log(`   Role: ${role}`);
  if (category) {
    console.log(`   Category: ${category}`);
  }

  const loginUrl_ = loginUrl || process.env.APP_LOGIN_URL || "http://localhost:5173/login";
  const subject = "Your SSCMS Account Credentials";
  const text = [
    "Your SSCMS account has been created.",
    "",
    "Account Details:",
    `Username: ${username}`,
    `Password: ${password}`,
    `Role: ${role}`,
    ...(category ? [`Category: ${category}`] : []),
    "",
    "Login Information:",
    `Login URL: ${loginUrl_}`,
    "",
    "Please keep your credentials secure and change your password after first login.",
  ].join("\n");

  try {
    const result = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent successfully to ${to}. Message ID:`, result.messageId);
    return { sent: true, messageId: result.messageId };
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
 * Test function to verify SMTP configuration
 * Sends a test email to the configured SMTP_USER address
 */
export async function testEmail() {
  console.log("\n🧪 Running SMTP configuration test...");

  const smtpUser = process.env.SMTP_USER;
  if (!smtpUser) {
    console.error("❌ SMTP_USER is not configured. Cannot run email test.");
    return { success: false, error: "SMTP_USER not configured" };
  }

  try {
    const result = await sendUserCredentialsEmail({
      to: smtpUser,
      username: "test.user",
      password: "TestPassword123!",
      role: "ADMIN",
      category: "TEST",
      loginUrl: "http://localhost:5173/login",
    });

    console.log("✅ Test email sent successfully!");
    console.log(`   Check your email at ${smtpUser} for the test message.`);
    return { success: true, result };
  } catch (err) {
    console.error("❌ Test email failed:", err.message);
    return { success: false, error: err.message };
  }
}
