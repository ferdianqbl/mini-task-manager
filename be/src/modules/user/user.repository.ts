import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../db/db';
import { User, CreateUserDTO } from './user.types';

export class UserRepository {
  async createUser(dto: CreateUserDTO): Promise<number> {
    const role = dto.role || 'USER';
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [dto.username, dto.password_hash, role]
    ) as [ResultSetHeader, unknown];
    return result.insertId;
  }

  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
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
