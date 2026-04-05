import dotenv from "dotenv";
import mongoose from "mongoose";
import Event from "../models/Event.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campus_club_mgmt";

async function fixDates() {
  await mongoose.connect(MONGO_URI);
  // Push ALL events (regardless of current status) to 30 days from now
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const result = await Event.updateMany(
    {},
    { $set: { date: futureDate, status: "upcoming" } }
  );
  console.log(`✅ Updated ${result.modifiedCount} event(s) → ${futureDate.toDateString()}, status=upcoming`);
  await mongoose.disconnect();
}

fixDates().catch((e) => { console.error(e.message); process.exit(1); });
