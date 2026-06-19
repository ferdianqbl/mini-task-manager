import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../db/db';
import { User, CreateUserDTO } from './user.types';

export class UserRepository {
  async createUser(dto: CreateUserDTO): Promise<number> {
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [dto.email, dto.password_hash]
    ) as [ResultSetHeader, unknown];
    return result.insertId;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as [RowDataPacket[], unknown];
    
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    ) as [RowDataPacket[], unknown];
    
    if (rows.length === 0) return null;
    return rows[0] as User;
  }
}
export const userRepository = new UserRepository();
