/**
 * One-time script to create a Super Admin.
 * Usage:
 *   node scripts/seedSuperAdmin.js
 *
 * Reads MONGO_URI from .env
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/User");
const AdminUser = require("../src/models/AdminUser");

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI is missing in .env");

  // ✅ CHANGE THESE IF YOU WANT
  const firstName = "Super";
  const lastName = "Admin";
  const email = "admin@worko.com";
  const phone = "+27713110111";
  const plainPassword = "12345"; // change after first login
  const country = "ZA";

  await mongoose.connect(mongoUri);

  // Create passwordHash
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // IMPORTANT:
  // Your User.role enum does NOT allow "ADMIN".
  // We'll create the base user as CUSTOMER (safe), and then create AdminUser linked to it.
  const baseRole = "CUSTOMER";

  // Find or create base User
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      passwordHash,
      role: baseRole,
      country
    });
    console.log("✅ Created base User:", user._id.toString());
  } else {
    console.log("ℹ️ Base User already exists:", user._id.toString());
  }

  // Find or create AdminUser profile
  let admin = await AdminUser.findOne({ userId: user._id });
  if (!admin) {
    admin = await AdminUser.create({
      userId: user._id,
      role: "SUPER_ADMIN",
      permissions: ["*"]
    });
    console.log("✅ Created AdminUser SUPER_ADMIN:", admin._id.toString());
  } else {
    console.log("ℹ️ AdminUser already exists:", admin._id.toString());
  }

  console.log("\n--- SUPER ADMIN CREDENTIALS ---");
  console.log("Email:", email);
  console.log("Password:", plainPassword);
  console.log("Linked User Role:", baseRole);
  console.log("--------------------------------\n");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Failed:", err.message);
  try { await mongoose.disconnect(); } catch (e) {}
  process.exit(1);
});