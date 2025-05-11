import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

// Database connection
let db: any;

export async function getDatabase() {
  if (db) {
    return db;
  }

  // Ensure the data directory exists
  const dbDir = path.resolve(__dirname, "../data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Open the database
  db = await open({
    filename: path.join(dbDir, "language_tutor.db"),
    driver: sqlite3.Database,
  });

  return db;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS languages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      flag TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      level TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (language_id) REFERENCES languages (id)
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      difficulty INTEGER NOT NULL,
      image_url TEXT,
      FOREIGN KEY (lesson_id) REFERENCES lessons (id)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      is_correct BOOLEAN NOT NULL,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (lesson_id) REFERENCES lessons (id),
      FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    );

    CREATE TABLE IF NOT EXISTS completed_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (lesson_id) REFERENCES lessons (id),
      UNIQUE(user_id, lesson_id)
    );
  `);

  // Seed languages if they don't exist
  const languages = await db.all("SELECT * FROM languages");
  if (languages.length === 0) {
    await db.run(`
      INSERT INTO languages (name, code, flag) VALUES 
      ('Spanish', 'es', '🇪🇸'),
      ('French', 'fr', '🇫🇷'),
      ('German', 'de', '🇩🇪')
    `);
  }

  // Seed lessons if they don't exist
  const lessons = await db.all("SELECT * FROM lessons");
  if (lessons.length === 0) {
    // Get language IDs
    const languages = await db.all("SELECT id, code FROM languages");
    const languageMap = languages.reduce((acc: any, lang: any) => {
      acc[lang.code] = lang.id;
      return acc;
    }, {});

    // Spanish lessons
    await db.run(`
      INSERT INTO lessons (language_id, title, description, level, order_index) VALUES
      (${languageMap.es}, 'Greetings and Introductions', 'Learn basic Spanish greetings and how to introduce yourself.', 'beginner', 1),
      (${languageMap.es}, 'Numbers and Counting', 'Learn to count and use numbers in Spanish.', 'beginner', 2),
      (${languageMap.es}, 'Common Phrases', 'Essential phrases for everyday conversations.', 'beginner', 3)
    `);

    // French lessons
    await db.run(`
      INSERT INTO lessons (language_id, title, description, level, order_index) VALUES
      (${languageMap.fr}, 'Basic Greetings', 'Learn how to greet people in French.', 'beginner', 1),
      (${languageMap.fr}, 'Introducing Yourself', 'Learn to introduce yourself and ask basic questions.', 'beginner', 2),
      (${languageMap.fr}, 'Food and Dining', 'Vocabulary for ordering food and dining out.', 'beginner', 3)
    `);

    // German lessons
    await db.run(`
      INSERT INTO lessons (language_id, title, description, level, order_index) VALUES
      (${languageMap.de}, 'First Conversations', 'Basic German phrases for your first conversations.', 'beginner', 1),
      (${languageMap.de}, 'Numbers and Time', 'Learn to count and tell time in German.', 'beginner', 2),
      (${languageMap.de}, 'Daily Routines', 'Vocabulary for describing your daily activities.', 'beginner', 3)
    `);
  }

  // Seed exercises if they don't exist
  const exercises = await db.all("SELECT * FROM exercises");
  if (exercises.length === 0) {
    // Get lesson IDs
    const lessons = await db.all("SELECT id, title FROM lessons");
    const lessonMap = lessons.reduce((acc: any, lesson: any) => {
      acc[lesson.title] = lesson.id;
      return acc;
    }, {});

    // Spanish exercises
    await db.run(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer, difficulty, image_url) VALUES
      (${lessonMap["Greetings and Introductions"]}, 'translate', 'How do you say "Hello" in Spanish?', NULL, 'Hola', 1, NULL),
      (${lessonMap["Greetings and Introductions"]}, 'multiple_choice', 'Which phrase means "Good morning" in Spanish?', '["Buenos días", "Buenas noches", "Buenas tardes", "Adiós"]', 'Buenos días', 1, NULL),
      (${lessonMap["Greetings and Introductions"]}, 'translate', 'Translate: "My name is John"', NULL, 'Me llamo John', 2, NULL),
      (${lessonMap["Numbers and Counting"]}, 'multiple_choice', 'What is the number "five" in Spanish?', '["Cinco", "Tres", "Siete", "Ocho"]', 'Cinco', 1, NULL),
      (${lessonMap["Numbers and Counting"]}, 'translate', 'Translate the number 10 to Spanish', NULL, 'Diez', 1, NULL)
    `);

    // French exercises
    await db.run(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer, difficulty, image_url) VALUES
      (${lessonMap["Basic Greetings"]}, 'translate', 'How do you say "Hello" in French?', NULL, 'Bonjour', 1, NULL),
      (${lessonMap["Basic Greetings"]}, 'multiple_choice', 'Which phrase means "Good evening" in French?', '["Bonsoir", "Bonjour", "Au revoir", "Merci"]', 'Bonsoir', 1, NULL),
      (${lessonMap["Introducing Yourself"]}, 'translate', 'Translate: "My name is Marie"', NULL, 'Je m\'appelle Marie', 2, NULL),
      (${lessonMap["Food and Dining"]}, 'multiple_choice', 'How do you say "water" in French?', '["L\'eau", "Le pain", "Le vin", "La table"]', 'L\'eau', 1, NULL)
    `);

    // German exercises
    await db.run(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer, difficulty, image_url) VALUES
      (${lessonMap["First Conversations"]}, 'translate', 'How do you say "Hello" in German?', NULL, 'Hallo', 1, NULL),
      (${lessonMap["First Conversations"]}, 'multiple_choice', 'Which phrase means "Good day" in German?', '["Guten Tag", "Gute Nacht", "Auf Wiedersehen", "Danke"]', 'Guten Tag', 1, NULL),
      (${lessonMap["Numbers and Time"]}, 'translate', 'Translate the number 3 to German', NULL, 'Drei', 1, NULL),
      (${lessonMap["Daily Routines"]}, 'multiple_choice', 'How do you say "breakfast" in German?', '["Frühstück", "Mittagessen", "Abendessen", "Kaffee"]', 'Frühstück', 2, NULL)
    `);
  }

  console.log("Database initialized successfully");
}

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Helper function to compare passwords
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
