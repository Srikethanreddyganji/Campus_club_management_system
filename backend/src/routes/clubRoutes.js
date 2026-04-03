import { Router } from "express";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

import {
  createClub,
  deleteClub,
  listClubs,
  updateClub,
  validateClubCreateOrUpdate,
  validateClubIdParam,
} from "../controllers/clubController.js";

const router = Router();

/* ---------------- PUBLIC ---------------- */
router.get("/", listClubs);

/* ---------------- ADMIN ONLY ---------------- */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateClubCreateOrUpdate,
  createClub
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateClubIdParam,
  validateClubCreateOrUpdate,
  updateClub
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateClubIdParam,
  deleteClub
);

export default router;
