import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from './db';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runMigrations() {
  console.log('Starting database migrations...');
  
  let connected = false;
  let retries = 12; // 12 retries * 5s = 60s max wait time
  
  while (!connected && retries > 0) {
    try {
      // Test the database connection
      const connection = await pool.getConnection();
      console.log('Database connected successfully.');
      connection.release();
      connected = true;
    } catch (err) {
      console.log(`Database not ready yet. Retrying in 5 seconds... (${retries} retries left)`);
      retries--;
      await wait(5000);
    }
  }

  if (!connected) {
    console.error('Failed to connect to the database. Exiting migration.');
    process.exit(1);
  }

  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split queries by semicolon to execute them individually (excluding comments/newlines)
    const queries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const query of queries) {
      await pool.query(query);
    }
    console.log('Database tables verified/created successfully.');

    // Check if user table is seeded
    const [users] = await pool.query('SELECT * FROM users LIMIT 1') as [RowDataPacket[], unknown];
    if (users.length === 0) {
      console.log('Seeding database with demo data...');
      
      // 1. Seed Demo User (password: password123)
      const email = 'demo@habitshaper.com';
      const passwordHash = bcrypt.hashSync('password123', 10);
      const [userResult] = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, passwordHash]
      ) as [ResultSetHeader, unknown];
      const userId = userResult.insertId;
      console.log(`Demo user created with ID: ${userId}`);

      // 2. Seed Habits
      // A. Build: Meditation
      const [meditationResult] = await pool.query(
        'INSERT INTO habits (user_id, name, type) VALUES (?, ?, ?)',
        [userId, 'Daily Meditation', 'build']
      ) as [ResultSetHeader, unknown];
      const meditationId = meditationResult.insertId;

      // B. Build: Exercise
      const [exerciseResult] = await pool.query(
        'INSERT INTO habits (user_id, name, type) VALUES (?, ?, ?)',
        [userId, 'Daily Gym Workout', 'build']
      ) as [ResultSetHeader, unknown];
      const exerciseId = exerciseResult.insertId;

      // C. Break: Fast Food
      const [junkFoodResult] = await pool.query(
        'INSERT INTO habits (user_id, name, type) VALUES (?, ?, ?)',
        [userId, 'Eating Fast Food', 'break']
      ) as [ResultSetHeader, unknown];
      const junkFoodId = junkFoodResult.insertId;

      // D. Break: Doomscrolling
      const [doomscrollResult] = await pool.query(
        'INSERT INTO habits (user_id, name, type) VALUES (?, ?, ?)',
        [userId, 'Social Media Doomscrolling', 'break']
      ) as [ResultSetHeader, unknown];
      const doomscrollId = doomscrollResult.insertId;
      
      console.log('Habits pre-seeded.');

      // 3. Seed logs for past 7 days to simulate streaks and weekly rates
      const getPastDateString = (daysAgo: number): string => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
      };

      // Meditation (6-day streak up to today): Completed today, yesterday, and past 4 days.
      for (let i = 0; i <= 5; i++) {
        await pool.query(
          'INSERT INTO habit_logs (habit_id, log_date) VALUES (?, ?)',
          [meditationId, getPastDateString(i)]
        );
      }

      // Gym Workout (Completion rate of 4 out of 7 days, missed today):
      // Completed 1 day ago (yesterday), 3 days ago, 4 days ago, and 6 days ago.
      const exerciseCompletions = [1, 3, 4, 6];
      for (const daysAgo of exerciseCompletions) {
        await pool.query(
          'INSERT INTO habit_logs (habit_id, log_date) VALUES (?, ?)',
          [exerciseId, getPastDateString(daysAgo)]
        );
      }

      // Fast Food Relapse (relapsed 3 days ago, clean for the last 2 days):
      await pool.query(
        'INSERT INTO habit_logs (habit_id, log_date) VALUES (?, ?)',
        [junkFoodId, getPastDateString(3)]
      );

      // Doomscrolling (never relapsed - clean since habit was created):
      // No logs seeded. The clean streak will calculate automatically from creation date.

      console.log('Logs and history pre-seeded.');

      // 4. Seed Goals
      // Goal 1: Meditation challenge (Target 30 days)
      await pool.query(
        'INSERT INTO goals (user_id, habit_id, title, target_streak) VALUES (?, ?, ?, ?)',
        [userId, meditationId, '30-Day Mindfulness Journey', 30]
      );

      // Goal 2: Fast food clean challenge (Target 7 days)
      await pool.query(
        'INSERT INTO goals (user_id, habit_id, title, target_streak) VALUES (?, ?, ?, ?)',
        [userId, junkFoodId, '7-Day Eating Clean Challenge', 7]
      );

      console.log('Goals pre-seeded successfully.');
    } else {
      console.log('Database already contains records. Skipping seed.');
    }
    
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Error executing migrations:', err);
    process.exit(1);
  }
}

export default runMigrations;
