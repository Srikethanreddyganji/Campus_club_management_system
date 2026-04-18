import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";
import User from "../models/User.js";
import Club from "../models/Club.js";

/* ---------------- VALIDATIONS ---------------- */

export const validateUserUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("role")
    .optional()
    .isIn(["student", "organizer", "admin"])
    .withMessage("Invalid role"),

  body("clubId")
    .optional()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid club ID");
      }
      return true;
    }),
];

export const validateUserIdParam = [
  param("id").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid user ID");
    }
    return true;
  }),
];

/* ---------------- GET LOGGED USER ---------------- */

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("clubId", "name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- LIST ALL USERS ---------------- */

export async function listUsers(req, res) {
  try {
    const users = await User.find()
      .select("-password")
      .populate("clubId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- UPDATE USER ---------------- */

export async function updateUser(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { name, role, clubId } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (clubId) {
      const club = await Club.findById(clubId);

      if (!club) {
        return res.status(404).json({
          success: false,
          message: "Club not found",
        });
      }
    }

    user.name = name ?? user.name;
    user.role = role ?? user.role;
    user.clubId = clubId ?? user.clubId;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubId: user.clubId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- DELETE USER ---------------- */

export async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}