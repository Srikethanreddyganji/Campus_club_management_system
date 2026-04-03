import { Router } from "express";

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import eventRoutes from "./eventRoutes.js";
import registrationRoutes from "./registrationRoutes.js";
import clubRoutes from "./clubRoutes.js";

const router = Router();

/* ---------------- AUTH ---------------- */
router.use("/auth", authRoutes);

/* ---------------- USERS ---------------- */
router.use("/users", userRoutes);

/* ---------------- CLUBS ---------------- */
router.use("/clubs", clubRoutes);

/* ---------------- EVENTS ---------------- */
router.use("/events", eventRoutes);

/* ---------------- REGISTRATIONS ---------------- */
router.use("/registrations", registrationRoutes);

export default router;
