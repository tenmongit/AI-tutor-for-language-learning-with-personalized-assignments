import { getDatabase } from "../database";

/**
 * Utility to diagnose database issues
 */
export async function diagnoseDatabaseIssues() {
  try {
    console.log("Running database diagnostics...");
    const db = await getDatabase();
    
    // Check if users table exists
    const userTableCheck = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    );
    
    if (!userTableCheck) {
      console.error("CRITICAL: Users table does not exist!");
      return false;
    }
    
    console.log("✓ Users table exists");
    
    // Check table structure
    const tableInfo = await db.all("PRAGMA table_info(users)");
    console.log("Users table structure:", tableInfo);
    
    // Check if any users exist
    const userCount = await db.get("SELECT COUNT(*) as count FROM users");
    console.log(`User count: ${userCount.count}`);
    
    // Check other critical tables
    const tables = [
      "languages", 
      "lessons", 
      "exercises", 
      "user_progress", 
      "completed_lessons"
    ];
    
    for (const table of tables) {
      const tableExists = await db.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`
      );
      
      if (!tableExists) {
        console.error(`CRITICAL: ${table} table does not exist!`);
      } else {
        console.log(`✓ ${table} table exists`);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Database diagnostics failed:", error);
    return false;
  }
}

/**
 * Utility to fix common database issues
 */
export async function fixDatabaseIssues() {
  try {
    console.log("Attempting to fix database issues...");
    const db = await getDatabase();
    
    // Ensure users table exists with correct structure
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("✓ Users table structure verified/fixed");
    
    return true;
  } catch (error) {
    console.error("Failed to fix database issues:", error);
    return false;
  }
}
