import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userService } from '../user/user.service';
import { JWTPayload, LoginDTO, RegisterDTO } from './auth.types';
import { User } from '../user/user.types';

export class AuthService {
  private getSecret(): string {
    return process.env.JWT_SECRET || 'super_secret_jwt_key_task_manager_123';
  }

  private generateToken(user: User): string {
    const payload: JWTPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    return jwt.sign(payload, this.getSecret(), { expiresIn: '7d' });
  }

  async register(dto: RegisterDTO): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const passwordHash = bcrypt.hashSync(dto.password, 10);
    const createdUser = await userService.createUser({
      username: dto.username,
      password_hash: passwordHash,
      role: 'USER', // default registered role
    });

    const token = this.generateToken(createdUser);
    const { password_hash, ...profile } = createdUser;
    
    return { user: profile, token };
  }

  async login(dto: LoginDTO): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const user = await userService.getUserByUsername(dto.username);
    if (!user) {
      throw new Error('Invalid username or password.');
    }

    const passwordMatch = bcrypt.compareSync(dto.password, user.password_hash);
    if (!passwordMatch) {
      throw new Error('Invalid username or password.');
    }

    const token = this.generateToken(user);
    const { password_hash, ...profile } = user;

    return { user: profile, token };
  }
}
export const authService = new AuthService();
