import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ---------------- AUTHENTICATE ---------------- */

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

/* ---------------- AUTHORIZE ---------------- */

export function authorize(...roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
}

/* ---------------- APPROVE CHECK FOR ORGANIZER ---------------- */

export function authorizeApprovedOrganizer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  /* admins always pass */
  if (req.user.role === "admin") {
    return next();
  }

  /* organizer must be approved */
  if (req.user.role === "organizer" && !req.user.organizerApproved) {
    return res.status(403).json({
      success: false,
      message: "Your organizer account is pending admin approval",
      pendingApproval: true,
    });
  }

  next();
}
