import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Club from "../models/Club.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campus_club_mgmt";

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Get admin and organizer
    const admin = await User.findOne({ role: "admin" });
    const organizer = await User.findOne({ role: "organizer" });

    if (!admin || !organizer) {
      console.error("Admin or organizer not found. Run seed first.");
      process.exit(1);
    }

    console.log("Admin:", admin.email, admin._id);
    console.log("Organizer:", organizer.email, organizer._id);

    // Fix existing club using native driver to bypass schema issues temporarily
    const db = mongoose.connection.db;

    const club = await Club.findOne({ name: "Tech Club" });

    if (club) {
      // Use updateOne with raw update to fix old adminUserId field
      await db.collection("clubs").updateOne(
        { name: "Tech Club" },
        {
          $set: {
            clubCode: "TECHCLUB",
            organizerId: organizer._id,
            createdBy: admin._id,
            category: "technical",
          },
          $unset: { adminUserId: "" },
        }
      );
      console.log("✅ Club fixed - added clubCode, organizerId, createdBy, removed adminUserId");

      // Fix organizer user
      await db.collection("users").updateOne(
        { email: "organizer@example.com" },
        {
          $set: {
            clubId: club._id,
            clubCode: "TECHCLUB",
          },
        }
      );
      console.log("✅ Organizer user linked to club (clubId + clubCode set)");
    } else {
      console.log("No club found to migrate.");
    }

    // Verify
    const updatedClub = await Club.findOne({ name: "Tech Club" });
    const updatedOrganizer = await User.findOne({ email: "organizer@example.com" });
    console.log("\n--- Verification ---");
    console.log("Club clubCode:", updatedClub?.clubCode);
    console.log("Club organizerId:", updatedClub?.organizerId);
    console.log("Organizer clubId:", updatedOrganizer?.clubId);
    console.log("Organizer clubCode:", updatedOrganizer?.clubCode);

    await mongoose.disconnect();
    console.log("\n✅ Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
