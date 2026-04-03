import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["registered", "cancelled", "waitlisted"],
      default: "registered",
    },

    attendanceStatus: {
      type: String,
      enum: ["pending", "present", "absent"],
      default: "pending",
    },

    certificateIssued: {
      type: Boolean,
      default: false,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/* one user can register only once per event */
registrationSchema.index(
  { userId: 1, eventId: 1 },
  { unique: true }
);

const Registration = mongoose.model(
  "Registration",
  registrationSchema
);

export default Registration;

