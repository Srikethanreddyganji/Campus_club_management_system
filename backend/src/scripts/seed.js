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
    let admin = await User.findOne({
      email: "admin@example.com",
    });

    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "Admin@123",
        role: "admin",
      });

      console.log("Admin created");
    }

    /* ---------------- ORGANIZER ---------------- */
    let organizer = await User.findOne({
      email: "organizer@example.com",
    });

    if (!organizer) {
      organizer = await User.create({
        name: "Organizer One",
        email: "organizer@example.com",
        password: "Organizer@123",
        role: "organizer",
      });

      console.log("Organizer created");
    }

    /* ---------------- CLUB ---------------- */
    let club = await Club.findOne({
      name: "Tech Club",
    });

    if (!club) {
      club = await Club.create({
        name: "Tech Club",
        description:
          "Tech talks and workshops",
        organizerId: organizer._id,
        createdBy: admin._id,
        category: "technical",
      });

      console.log("Club created");
    }

    /* update organizer club */
    organizer.clubId = club._id;
    await organizer.save();

    /* ---------------- EVENT ---------------- */
    let event = await Event.findOne({
      title: "Welcome Tech Meetup",
    });

    if (!event) {
      event = await Event.create({
        title: "Welcome Tech Meetup",
        description:
          "Kickoff session with lightning talks",
        date: new Date(
          Date.now() +
            7 * 24 * 60 * 60 * 1000
        ),
        location: "Main Auditorium",
        clubId: club._id,
        createdBy: organizer._id,
        maxParticipants: 100,
        status: "upcoming",
      });

      console.log("Event created");
    }

    console.log("Seed completed successfully");

    console.log(
      "Admin login:",
      admin.email,
      "Admin@123"
    );

    console.log(
      "Organizer login:",
      organizer.email,
      "Organizer@123"
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed failed:", error);

    process.exit(1);
  }
}

seedDatabase();