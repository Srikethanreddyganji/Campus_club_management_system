import { validationResult, body, param } from "express-validator";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Club from "../models/Club.js";

/* ---------------- VALIDATIONS ---------------- */

export const validateCreateOrUpdateEvent = [
  body("title")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("date")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("location")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Location is required"),

  body("clubId")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid club ID");
      }
      return true;
    }),
];

export const validateEventIdParam = [
  param("id").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid event ID");
    }
    return true;
  }),
];

/* ---------------- LIST EVENTS ---------------- */

export async function listEvents(req, res) {
  try {
    const events = await Event.find()
      .sort({ date: 1 })
      .populate("clubId", "name")
      .populate("createdBy", "name role");

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- GET SINGLE EVENT ---------------- */

export async function getEventById(req, res) {
  try {
    const event = await Event.findById(req.params.id)
      .populate("clubId", "name description")
      .populate("createdBy", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- CREATE EVENT ---------------- */

export async function createEvent(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { clubId } = req.body;

    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    if (req.user.role === "organizer") {
      if (!req.user.clubId || req.user.clubId.toString() !== clubId) {
        return res.status(403).json({
          success: false,
          message: "Cannot create event for another club",
        });
      }
    }

    const event = await Event.create({
      ...req.body,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- UPDATE EVENT ---------------- */

export async function updateEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      req.user.role === "organizer" &&
      event.clubId.toString() !== req.user.clubId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify another club's event",
      });
    }

    Object.assign(event, req.body);

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- DELETE EVENT ---------------- */

export async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      req.user.role === "organizer" &&
      event.clubId.toString() !== req.user.clubId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete another club's event",
      });
    }

    await Registration.deleteMany({ eventId: event._id });
    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- PARTICIPANTS ---------------- */

export async function listEventParticipants(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      req.user.role === "organizer" &&
      event.clubId.toString() !== req.user.clubId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const participants = await Registration.find({
      eventId: event._id,
      status: "registered",
    }).populate("userId", "name email");

    return res.status(200).json({
      success: true,
      participants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}