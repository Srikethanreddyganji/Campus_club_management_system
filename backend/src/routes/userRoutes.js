import { Router } from "express";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

import {
  approveOrganizer,
  deleteUser,
  getMe,
  listUsers,
  revokeOrganizer,
  updateUser,
  validateUserIdParam,
  validateUserUpdate,
} from "../controllers/userController.js";

const router = Router();

/* ---------------- LOGGED USER ---------------- */
router.get(
  "/me",
  authenticate,
  getMe
);

/* ---------------- ADMIN ONLY ---------------- */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  listUsers
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUserIdParam,
  validateUserUpdate,
  updateUser
);

/* approve / revoke organizer */
router.patch(
  "/:id/approve-organizer",
  authenticate,
  authorize("admin"),
  validateUserIdParam,
  approveOrganizer
);

router.patch(
  "/:id/revoke-organizer",
  authenticate,
  authorize("admin"),
  validateUserIdParam,
  revokeOrganizer
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUserIdParam,
  deleteUser
);

export default router;
