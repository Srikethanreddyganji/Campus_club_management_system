import { Router } from "express";

import {
  authenticate,
  authorize,
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

/* ---------------- ADMIN + ORGANIZER ---------------- */
router.post(
  "/",
  authenticate,
  authorize("organizer", "admin"),
  validateCreateOrUpdateEvent,
  createEvent
);

router.put(
  "/:id",
  authenticate,
  authorize("organizer", "admin"),
  validateEventIdParam,
  validateCreateOrUpdateEvent,
  updateEvent
);

router.delete(
  "/:id",
  authenticate,
  authorize("organizer", "admin"),
  validateEventIdParam,
  deleteEvent
);

/* ---------------- PARTICIPANTS ---------------- */
router.get(
  "/:id/participants",
  authenticate,
  authorize("organizer", "admin"),
  validateEventIdParam,
  listEventParticipants
);

export default router;