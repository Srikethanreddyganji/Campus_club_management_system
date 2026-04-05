/**
 * Recalculate registrationsCount for every event from actual Registration records.
 * Run this once to fix any stale / negative counts.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campus_club_mgmt";

async function recalc() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected");

  const events = await Event.find({});
  let fixed = 0;

  for (const event of events) {
    const count = await Registration.countDocuments({
      eventId: event._id,
      status: "registered",
    });

    if (event.registrationsCount !== count) {
      await Event.findByIdAndUpdate(event._id, { registrationsCount: count });
      console.log(`  ${event.title}: ${event.registrationsCount} → ${count}`);
      fixed++;
    }
  }

  console.log(`\n✅ Fixed ${fixed} event(s). All counts are now accurate.`);
  await mongoose.disconnect();
}

recalc().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
