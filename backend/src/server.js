import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

import routes from "./routes/index.js";
import {
  notFoundHandler,
  errorHandler,
} from "./utils/errorHandlers.js";

dotenv.config();

const app = express();

/* ---------------- ENV ---------------- */

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/campus_club_mgmt";

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

/* ---------------- MIDDLEWARE ---------------- */

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

/* ---------------- HEALTH CHECK ---------------- */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server running successfully",
    timestamp: new Date().toISOString(),
  });
});

/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Campus Club Management System is live.",
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Campus Club Management System API.",
  });
});

app.use("/api", routes);

/* ---------------- ERROR HANDLERS ---------------- */

app.use(notFoundHandler);
app.use(errorHandler);

/* ---------------- DB + SERVER START ---------------- */

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error.message
    );
    process.exit(1);
  }
}

startServer();