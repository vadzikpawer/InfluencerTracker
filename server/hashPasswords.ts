import { db } from "./db";
import { users } from "@shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

async function hashExistingPasswords() {
  console.log("Hashing existing user passwords...");
  
  // Get all users
  const existingUsers = await db.select().from(users);
  
  // Loop through each user and hash their password if it's not already hashed
  for (const user of existingUsers) {
    // Check if password is already hashed (contains a dot separator)
    if (!user.password.includes('.')) {
      console.log(`Hashing password for user ${user.username}`);
      const hashedPassword = await hashPassword(user.password);
      
      // Update the user's password in the database
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));
    }
  }
  
  console.log("Password hashing complete!");
}

// Run the function
hashExistingPasswords()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error hashing passwords:", error);
    process.exit(1);
  });