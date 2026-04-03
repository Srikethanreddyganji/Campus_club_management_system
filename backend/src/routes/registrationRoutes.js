import { Router } from "express";

import {
  authenticate,
} from "../middleware/auth.js";

import {
  cancelRegistration,
  listMyRegistrations,
  registerForEvent,
  validateRegistrationCreate,
  validateRegistrationIdParam,
} from "../controllers/registrationController.js";

const router = Router();

/* ---------------- ALL ROUTES REQUIRE LOGIN ---------------- */
router.use(authenticate);

/* ---------------- STUDENT DASHBOARD ---------------- */
router.get("/me", listMyRegistrations);

/* ---------------- PARTICIPATE ---------------- */
router.post(
  "/",
  validateRegistrationCreate,
  registerForEvent
);

/* ---------------- CANCEL ---------------- */
router.patch(
  "/:id/cancel",
  validateRegistrationIdParam,
  cancelRegistration
);

export default router;
