import { getDatabase, hashPassword } from "./database";

/**
 * This script tests the database connection and user registration
 * Run with: npx ts-node src/test-registration.ts
 */
async function testRegistration() {
  try {
    console.log("Testing database connection and user registration...");
    
    // Connect to database
    const db = await getDatabase();
    console.log("✓ Database connection successful");
    
    // Ensure users table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ Users table created/verified");
    
    // Create a test user
    const testUser = {
      name: "Test User",
      email: `test${Date.now()}@example.com`, // Unique email
      password: "password123"
    };
    
    // Hash the password
    const hashedPassword = await hashPassword(testUser.password);
    console.log("✓ Password hashed successfully");
    
    // Insert the user
    try {
      const result = await db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [testUser.name, testUser.email, hashedPassword]
      );
      
      console.log(`✓ Test user created with ID: ${result.lastID}`);
      console.log(`✓ Email: ${testUser.email}`);
      
      // Verify user was created
      const user = await db.get("SELECT * FROM users WHERE email = ?", [testUser.email]);
      if (user) {
        console.log("✓ User retrieved successfully");
        console.log("✓ Registration test passed!");
      } else {
        console.error("✗ Failed to retrieve created user");
      }
    } catch (error: any) {
      console.error("✗ Failed to create test user:", error.message);
      if (error.code === 'SQLITE_CONSTRAINT') {
        console.error("  This is likely due to a unique constraint violation (email already exists)");
      }
    }
    
    // List all users
    const users = await db.all("SELECT id, name, email, created_at FROM users");
    console.log("\nExisting users in database:");
    console.table(users);
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testRegistration();
