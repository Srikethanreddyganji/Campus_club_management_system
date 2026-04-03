import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";
import Club from "../models/Club.js";
import User from "../models/User.js";

/* ---------------- VALIDATIONS ---------------- */

export const validateClubCreateOrUpdate = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Club name must be at least 2 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("adminUserId")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid admin user ID");
      }
      return true;
    }),
];

export const validateClubIdParam = [
  param("id")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid club ID");
      }
      return true;
    }),
];

/* ---------------- LIST CLUBS ---------------- */

export async function listClubs(req, res) {
  try {
    const clubs = await Club.find()
      .populate("adminUserId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      clubs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- CREATE CLUB ---------------- */

export async function createClub(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { name, description, adminUserId } = req.body;

    const adminUser = await User.findById(adminUserId);

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    const existingClub = await Club.findOne({ name });

    if (existingClub) {
      return res.status(409).json({
        success: false,
        message: "Club already exists",
      });
    }

    const club = await Club.create({
      name,
      description,
      adminUserId,
    });

    return res.status(201).json({
      success: true,
      message: "Club created successfully",
      club,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- UPDATE CLUB ---------------- */

export async function updateClub(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { name, description, adminUserId } = req.body;

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    club.name = name || club.name;
    club.description = description || club.description;
    club.adminUserId = adminUserId || club.adminUserId;

    await club.save();

    return res.status(200).json({
      success: true,
      message: "Club updated successfully",
      club,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- DELETE CLUB ---------------- */

export async function deleteClub(req, res) {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    await club.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Club deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}