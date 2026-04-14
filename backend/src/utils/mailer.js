import nodemailer from "nodemailer";

/* ------------------------------------------------------------------ */
/*  MAIL TRANSPORTER                                                  */
/*  Configure via .env:                                               */
/*    SMTP_HOST=smtp.gmail.com                                        */
/*    SMTP_PORT=587                                                   */
/*    SMTP_USER=your-email@gmail.com                                  */
/*    SMTP_PASS=your-app-password                                     */
/*    MAIL_FROM="Campus Clubs <your-email@gmail.com>"                 */
/* ------------------------------------------------------------------ */

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(
      "⚠️  SMTP not configured. Emails will be logged to console instead of sent."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

/* ------------------------------------------------------------------ */
/*  SEND MAIL (graceful — never throws)                               */
/* ------------------------------------------------------------------ */

export async function sendMail({ to, subject, html }) {
  const t = getTransporter();

  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "noreply@campusclubs.com";

  if (!t) {
    /* fallback: log to console so development still works */
    console.log("\n📧 ─── EMAIL (console mode) ───");
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body:    ${html.replace(/<[^>]*>/g, "").slice(0, 200)}…`);
    console.log("───────────────────────────────\n");
    return { success: true, mode: "console" };
  }

  try {
    const info = await t.sendMail({ from, to, subject, html });
    console.log(`✅ Email sent to ${to} — ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/* ------------------------------------------------------------------ */
/*  EMAIL TEMPLATES                                                   */
/* ------------------------------------------------------------------ */

export function registrationConfirmationEmail(userName, event) {
  const eventDate = new Date(event.date).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return {
    subject: `🎟️ Registration Confirmed — ${event.title}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 28px;border-radius:12px;color:#fff;margin-bottom:24px;">
          <h1 style="margin:0;font-size:22px;">🎉 You're Registered!</h1>
        </div>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Hi <strong>${userName}</strong>,
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          You have successfully registered for <strong>${event.title}</strong>. Here are the details:
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr>
            <td style="padding:10px 12px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;">📅 Date & Time</td>
            <td style="padding:10px 12px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #e5e7eb;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;">📍 Location</td>
            <td style="padding:10px 12px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #e5e7eb;">${event.location}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#6b7280;font-size:13px;">🏫 Club</td>
            <td style="padding:10px 12px;color:#111827;font-size:14px;font-weight:600;">${event.clubId?.name || "—"}</td>
          </tr>
        </table>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin-top:20px;">
          You can manage your registrations from your Dashboard.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:11px;text-align:center;">
          Campus Club Management System
        </p>
      </div>
    `,
  };
}

export function eventReminderEmail(userName, event, hoursUntil) {
  const eventDate = new Date(event.date).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const timeLabel =
    hoursUntil <= 1 ? "in about 1 hour" :
    hoursUntil <= 24 ? `in ${hoursUntil} hours` :
    `tomorrow`;

  return {
    subject: `⏰ Reminder: "${event.title}" is ${timeLabel}!`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:24px 28px;border-radius:12px;color:#fff;margin-bottom:24px;">
          <h1 style="margin:0;font-size:22px;">⏰ Event Reminder</h1>
        </div>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Hi <strong>${userName}</strong>,
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Just a friendly reminder that <strong>${event.title}</strong> is happening <strong>${timeLabel}</strong>!
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr>
            <td style="padding:10px 12px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;">📅 When</td>
            <td style="padding:10px 12px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #e5e7eb;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#6b7280;font-size:13px;">📍 Where</td>
            <td style="padding:10px 12px;color:#111827;font-size:14px;font-weight:600;">${event.location}</td>
          </tr>
        </table>
        <p style="color:#374151;font-size:14px;line-height:1.6;font-weight:600;">
          Don't forget to be there on time! 🚀
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:11px;text-align:center;">
          Campus Club Management System
        </p>
      </div>
    `,
  };
}
