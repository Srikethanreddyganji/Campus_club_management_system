import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";
import Club from "../models/Club.js";
import Event from "../models/Event.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/campus_club_mgmt";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected for seeding");

    /* ---------------- ADMIN ---------------- */
    let admin = await User.findOne({ email: "admin@example.com" });

    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "Admin@123",
        role: "admin",
      });

      console.log("✅ Admin created");
    } else {
      console.log("ℹ️  Admin already exists");
    }

    /* ---------------- ORGANIZER ---------------- */
    let organizer = await User.findOne({ email: "organizer@example.com" });

    if (!organizer) {
      organizer = await User.create({
        name: "Organizer One",
        email: "organizer@example.com",
        password: "Organizer@123",
        role: "organizer",
        organizerApproved: true,
      });

      console.log("✅ Organizer created (approved)");
    } else {
      /* ensure existing organizer is approved */
      if (!organizer.organizerApproved) {
        organizer.organizerApproved = true;
        await organizer.save();
        console.log("✅ Existing organizer approved");
      } else {
        console.log("ℹ️  Organizer already exists (approved)");
      }
    }

    /* ---------------- CLUBS ---------------- */
    const clubsData = [
      {
        name: "Tech Club",
        description: "Tech talks, workshops, and hackathons",
        category: "technical",
        clubCode: "TECHCLUB",
        organizerId: organizer._id,
        createdBy: admin._id,
      },
      {
        name: "Photography & Media Club",
        description: "Photography, videography, and digital media creation",
        category: "cultural",
        clubCode: "PHOTOCLUB",
        organizerId: admin._id,
        createdBy: admin._id,
      },
      {
        name: "Music, Dance & Fine Arts Club",
        description: "Classical and contemporary music, dance performances, and fine arts",
        category: "cultural",
        clubCode: "ARTSCLUB",
        organizerId: admin._id,
        createdBy: admin._id,
      },
      {
        name: "Humanity Club",
        description: "Social outreach, community service, and humanitarian initiatives",
        category: "social",
        clubCode: "HUMANCLUB",
        organizerId: admin._id,
        createdBy: admin._id,
      },
      {
        name: "NCC Club",
        description: "National Cadet Corps — discipline, leadership, and national service",
        category: "social",
        clubCode: "NCCCLUB",
        organizerId: admin._id,
        createdBy: admin._id,
      },
      {
        name: "NSS Club",
        description: "National Service Scheme — community development and social service",
        category: "social",
        clubCode: "NSSCLUB",
        organizerId: admin._id,
        createdBy: admin._id,
      },
    ];

    let club; // keep reference to Tech Club for the event
    for (const clubInfo of clubsData) {
      let existing = await Club.findOne({ name: clubInfo.name });
      if (!existing) {
        existing = await Club.create(clubInfo);
        console.log(`✅ Club created: ${clubInfo.name} (${clubInfo.clubCode})`);
      } else {
        console.log(`ℹ️  Club already exists: ${clubInfo.name}`);
      }
      if (clubInfo.name === "Tech Club") club = existing;
    }

    /* Update organizer with their clubId (Tech Club) */
    organizer.clubId = club._id;
    organizer.clubCode = club.clubCode;
    await organizer.save();
    console.log("✅ Organizer linked to Tech Club");

    /* ---------------- STUDENT ---------------- */
    let student = await User.findOne({ email: "student@example.com" });

    if (!student) {
      student = await User.create({
        name: "Student Demo",
        email: "student@example.com",
        password: "Student@123",
        role: "student",
      });

      console.log("✅ Student created");
    } else {
      console.log("ℹ️  Student already exists");
    }

    /* ---------------- EVENT ---------------- */
    let event = await Event.findOne({ title: "Welcome Tech Meetup" });

    if (!event) {
      event = await Event.create({
        title: "Welcome Tech Meetup",
        description: "Kickoff session with lightning talks and networking",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: "Main Auditorium",
        clubId: club._id,
        createdBy: organizer._id,
        maxParticipants: 100,
        status: "upcoming",
      });

      console.log("✅ Event created");
    } else {
      console.log("ℹ️  Event already exists");
    }

    console.log("\n🎉 Seed completed successfully!\n");
    console.log("┌─────────────────────────────────┐");
    console.log("│         Login Credentials        │");
    console.log("├─────────────────────────────────┤");
    console.log("│ Admin:     admin@example.com     │");
    console.log("│ Password:  Admin@123             │");
    console.log("├─────────────────────────────────┤");
    console.log("│ Organizer: organizer@example.com │");
    console.log("│ Password:  Organizer@123         │");
    console.log("├─────────────────────────────────┤");
    console.log("│ Student:   student@example.com   │");
    console.log("│ Password:  Student@123           │");
    console.log("└─────────────────────────────────┘\n");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
}

seedDatabase();