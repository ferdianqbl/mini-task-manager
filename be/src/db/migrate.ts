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

    // Check if users table is seeded
    const [users] = await pool.query('SELECT * FROM users LIMIT 1') as [RowDataPacket[], unknown];
    if (users.length === 0) {
      console.log('Seeding database with demo users, tasks, and audit logs...');
      
      // 1. Seed Demo User (role: USER, password: password123)
      const userPasswordHash = bcrypt.hashSync('password123', 10);
      const [userResult] = await pool.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        ['demo', userPasswordHash, 'USER']
      ) as [ResultSetHeader, unknown];
      const demoUserId = userResult.insertId;
      console.log(`Standard user 'demo' created with ID: ${demoUserId}`);

      // 2. Seed Admin User (role: ADMIN, password: admin123)
      const adminPasswordHash = bcrypt.hashSync('admin123', 10);
      const [adminResult] = await pool.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        ['admin', adminPasswordHash, 'ADMIN']
      ) as [ResultSetHeader, unknown];
      const adminUserId = adminResult.insertId;
      console.log(`Admin user 'admin' created with ID: ${adminUserId}`);

      // 3. Seed Tasks and corresponding Audit Logs
      
      // Task 1 (demo user, status pending)
      const [task1Result] = await pool.query(
        'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        [demoUserId, 'Prepare Invoice', 'Send June invoice to client.', 'pending']
      ) as [ResultSetHeader, unknown];
      const task1Id = task1Result.insertId;

      await pool.query(
        'INSERT INTO audit_logs (task_id, task_title, actor, old_status, new_status) VALUES (?, ?, ?, ?, ?)',
        [task1Id, 'Prepare Invoice', 'demo', null, 'to_do']
      );
      await pool.query(
        'INSERT INTO audit_logs (task_id, task_title, actor, old_status, new_status) VALUES (?, ?, ?, ?, ?)',
        [task1Id, 'Prepare Invoice', 'demo', 'to_do', 'pending']
      );

      // Task 2 (demo user, status to_do)
      const [task2Result] = await pool.query(
        'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        [demoUserId, 'Setup Server Logs', 'Configure logrotate for Express server.', 'to_do']
      ) as [ResultSetHeader, unknown];
      const task2Id = task2Result.insertId;

      await pool.query(
        'INSERT INTO audit_logs (task_id, task_title, actor, old_status, new_status) VALUES (?, ?, ?, ?, ?)',
        [task2Id, 'Setup Server Logs', 'demo', null, 'to_do']
      );

      // Task 3 (admin user, status done)
      const [task3Result] = await pool.query(
        'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        [adminUserId, 'Review Audit Trail Features', 'Audit trail test scenario validation.', 'done']
      ) as [ResultSetHeader, unknown];
      const task3Id = task3Result.insertId;

      await pool.query(
        'INSERT INTO audit_logs (task_id, task_title, actor, old_status, new_status) VALUES (?, ?, ?, ?, ?)',
        [task3Id, 'Review Audit Trail Features', 'admin', null, 'to_do']
      );
      await pool.query(
        'INSERT INTO audit_logs (task_id, task_title, actor, old_status, new_status) VALUES (?, ?, ?, ?, ?)',
        [task3Id, 'Review Audit Trail Features', 'admin', 'to_do', 'pending']
      );
      await pool.query(
        'INSERT INTO audit_logs (task_id, task_title, actor, old_status, new_status) VALUES (?, ?, ?, ?, ?)',
        [task3Id, 'Review Audit Trail Features', 'admin', 'pending', 'in_progress']
      );
      await pool.query(
        'INSERT INTO audit_logs (task_id, task_title, actor, old_status, new_status) VALUES (?, ?, ?, ?, ?)',
        [task3Id, 'Review Audit Trail Features', 'admin', 'in_progress', 'done']
      );

      console.log('Mock tasks and audit logs pre-seeded successfully.');
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
