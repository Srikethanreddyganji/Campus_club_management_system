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
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid club ID");
      }
      return true;
    }),

  body("organizerApproved")
    .optional()
    .isBoolean()
    .withMessage("organizerApproved must be a boolean"),
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
      .populate("clubId", "name clubCode");

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
      .populate("clubId", "name clubCode")
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
    const { name, role, clubId, organizerApproved } = req.body;

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
    user.clubId = clubId !== undefined ? (clubId || null) : user.clubId;

    /* admin can set organizer approval */
    if (typeof organizerApproved === "boolean") {
      user.organizerApproved = organizerApproved;
    }

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
        organizerApproved: user.organizerApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- APPROVE ORGANIZER ---------------- */

export async function approveOrganizer(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "organizer") {
      return res.status(400).json({
        success: false,
        message: "User is not an organizer",
      });
    }

    user.organizerApproved = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Organizer "${user.name}" approved successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizerApproved: user.organizerApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- REVOKE ORGANIZER ---------------- */

export async function revokeOrganizer(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "organizer") {
      return res.status(400).json({
        success: false,
        message: "User is not an organizer",
      });
    }

    user.organizerApproved = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Organizer "${user.name}" access revoked`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizerApproved: user.organizerApproved,
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    /* prevent admin from deleting themselves */
    if (req.params.id === req.user.id || req.params.id === req.user._id?.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* clean up registrations & fix event counts */
    const Registration = (await import("../models/Registration.js")).default;
    const Event = (await import("../models/Event.js")).default;

    /* find active registrations so we can decrement each event's count */
    const activeRegs = await Registration.find({
      userId: user._id,
      status: "registered",
    });

    for (const reg of activeRegs) {
      await Event.findByIdAndUpdate(reg.eventId, [
        {
          $set: {
            registrationsCount: {
              $max: [0, { $subtract: ["$registrationsCount", 1] }],
            },
          },
        },
      ]);
    }

    /* now delete all registrations (active + cancelled) */
    await Registration.deleteMany({ userId: user._id });

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