import { storage } from "./storage";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Create exactly one default Admin user
  const adminPassword = hashPassword("admin");
  
  try {
    await storage.createUser({
      name: "System Admin",
      role: "Admin",
      identifier: "admin",
      dob: "01011990", // Placeholder DDMMYYYY
      password_hash: adminPassword,
      is_first_login: false, // Admin doesn't need to change password on first login
    });
    console.log("✓ Created default Admin user");
  } catch (error) {
    console.log("✓ Admin user already exists");
  }

  console.log("\n✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
