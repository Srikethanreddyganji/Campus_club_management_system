import { Router } from "express";

import {
  authenticate,
  authorize,
  authorizeApprovedOrganizer,
} from "../middleware/auth.js";

import {
  createEvent,
  deleteEvent,
  getEventById,
  listEventParticipants,
  listEvents,
  updateEvent,
  validateCreateOrUpdateEvent,
  validateEventIdParam,
} from "../controllers/eventController.js";

const router = Router();

/* ---------------- PUBLIC ---------------- */
router.get("/", listEvents);

router.get(
  "/:id",
  validateEventIdParam,
  getEventById
);

/* ---------------- ADMIN + APPROVED ORGANIZER ---------------- */
router.post(
  "/",
  authenticate,
  authorize("organizer", "admin"),
  authorizeApprovedOrganizer,
  validateCreateOrUpdateEvent,
  createEvent
);

router.put(
  "/:id",
  authenticate,
  authorize("organizer", "admin"),
  authorizeApprovedOrganizer,
  validateEventIdParam,
  validateCreateOrUpdateEvent,
  updateEvent
);

router.delete(
  "/:id",
  authenticate,
  authorize("organizer", "admin"),
  authorizeApprovedOrganizer,
  validateEventIdParam,
  deleteEvent
);

/* ---------------- PARTICIPANTS ---------------- */
router.get(
  "/:id/participants",
  authenticate,
  authorize("organizer", "admin"),
  authorizeApprovedOrganizer,
  validateEventIdParam,
  listEventParticipants
);

export default router;