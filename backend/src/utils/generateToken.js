import jwt from "jsonwebtoken";

export function generateToken(user) {
  const payload = {
    id: user._id.toString(),
    role: user.role,
    organizerApproved: user.organizerApproved || false,
  };

  let secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is missing in production!");
    }
    secret = "dev_secret";
  }

  const expiresIn =
    process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(payload, secret, {
    expiresIn,
  });
}