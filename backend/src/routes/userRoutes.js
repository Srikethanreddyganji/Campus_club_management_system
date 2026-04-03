import { Router } from "express";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

import {
  deleteUser,
  getMe,
  listUsers,
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

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUserIdParam,
  deleteUser
);

export default router;
