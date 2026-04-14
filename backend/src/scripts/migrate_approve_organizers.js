import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/campus_club_mgmt";

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for migration");

    /* Auto-approve all existing organizers */
    const result = await User.updateMany(
      { role: "organizer", organizerApproved: { $ne: true } },
      { $set: { organizerApproved: true } }
    );

    console.log(`✅ Approved ${result.modifiedCount} existing organizer(s)`);

    /* Set organizerApproved: false for non-organizers that might have the field */
    await User.updateMany(
      { role: { $ne: "organizer" }, organizerApproved: { $exists: false } },
      { $set: { organizerApproved: false } }
    );

    console.log("✅ Migration completed");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
