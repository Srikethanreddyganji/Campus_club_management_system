import {
  validationResult,
  body,
} from "express-validator";

import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const validateRegister = [
  body("name")
    .isString()
    .isLength({ min: 2 }),

  body("email").isEmail(),

  body("password").isLength({
    min: 6,
  }),

  body("role")
    .optional()
    .isIn([
      "student",
      "organizer",
      "admin",
    ]),

  body("clubCode")
    .optional({ nullable: true })
    .isString(),
];

export const validateLogin = [
  body("email").isEmail(),
  body("password")
    .isString()
    .isLength({ min: 6 }),
];

export async function register(
  req,
  res
) {
  const errors =
    validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const {
    name,
    email,
    password,
    role,
    clubCode,
  } = req.body;

  try {
    const exists =
      await User.findOne({
        email,
      });

    if (exists) {
      return res.status(409).json({
        message:
          "Email already registered",
      });
    }

    const user =
      await User.create({
        name,
        email,
        password,
        role:
          role ||
          "student",
        clubCode:
          clubCode ||
          null,
      });

    const token =
      generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email:
          user.email,
        role: user.role,
        clubCode:
          user.clubCode,
      },
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message,
    });
  }
}

export async function login(
  req,
  res
) {
  const errors =
    validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { email, password } =
    req.body;

  try {
    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid credentials",
      });
    }

    const match =
      await user.comparePassword(
        password
      );

    if (!match) {
      return res.status(401).json({
        message:
          "Invalid credentials",
      });
    }

    const token =
      generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email:
          user.email,
        role: user.role,
        clubCode:
          user.clubCode,
      },
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message,
    });
  }
}