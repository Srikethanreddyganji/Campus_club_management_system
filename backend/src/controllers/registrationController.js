import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

/* ---------------- VALIDATIONS ---------------- */

export const validateRegistrationCreate = [
  body("eventId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid event ID");
    }
    return true;
  }),
];

export const validateRegistrationIdParam = [
  param("id").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid registration ID");
    }
    return true;
  }),
];

/* ---------------- REGISTER ---------------- */

export async function registerForEvent(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    /* prevent registration for past events */
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Registration closed. Event date has passed",
      });
    }

    /* check duplicate registration */
    const existingRegistration = await Registration.findOne({
      userId: req.user.id,
      eventId,
      status: "registered",
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "Already registered for this event",
      });
    }

    const registration = await Registration.create({
      userId: req.user.id,
      eventId,
      status: "registered",
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      registration,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- CANCEL ---------------- */

export async function cancelRegistration(req, res) {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      registration.userId.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    registration.status = "cancelled";

    await registration.save();

    return res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
      registration,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ---------------- MY REGISTRATIONS ---------------- */

export async function listMyRegistrations(req, res) {
  try {
    const registrations = await Registration.find({
      userId: req.user.id,
      status: "registered",
    })
      .populate("eventId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}