import cron from "node-cron";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import { sendMail, eventReminderEmail } from "../utils/mailer.js";

/* ------------------------------------------------------------------ */
/*  REMINDER SCHEDULER                                                */
/*  Runs every hour, checks for upcoming events within the next 24h   */
/*  and sends reminder emails to registered participants.             */
/* ------------------------------------------------------------------ */

const sentReminders = new Set(); // track "eventId:userId:window" to avoid duplicates

export function startReminderScheduler() {
  /* Run every hour at minute 0 */
  cron.schedule("0 * * * *", async () => {
    console.log("🔔 Running event reminder check...");

    try {
      const now = new Date();

      /* Events happening in the next 24 hours */
      const upcoming24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      /* Events happening in the next 1 hour */
      const upcoming1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);

      const events = await Event.find({
        date: { $gt: now, $lte: upcoming24h },
        status: "upcoming",
      }).populate("clubId", "name");

      if (events.length === 0) {
        console.log("   No upcoming events in the next 24h.");
        return;
      }

      for (const event of events) {
        const hoursUntil = Math.round(
          (new Date(event.date) - now) / (1000 * 60 * 60)
        );

        /* send reminders at ~24h and ~1h before */
        const window = hoursUntil <= 2 ? "1h" : "24h";
        const reminderKey = `${event._id}:${window}`;

        /* find registered participants */
        const registrations = await Registration.find({
          eventId: event._id,
          status: "registered",
        }).populate("userId", "name email");

        for (const reg of registrations) {
          const userKey = `${reminderKey}:${reg.userId?._id}`;

          if (sentReminders.has(userKey)) continue;

          if (reg.userId?.email) {
            const { subject, html } = eventReminderEmail(
              reg.userId.name,
              event,
              hoursUntil
            );

            await sendMail({
              to: reg.userId.email,
              subject,
              html,
            });

            sentReminders.add(userKey);
          }
        }

        console.log(
          `   📧 Sent ${registrations.length} reminder(s) for "${event.title}" (${window} window)`
        );
      }
    } catch (err) {
      console.error("❌ Reminder scheduler error:", err.message);
    }
  });

  console.log("🔔 Event reminder scheduler started (runs every hour)");
}
