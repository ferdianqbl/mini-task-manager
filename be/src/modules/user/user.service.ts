import { userRepository } from './user.repository';
import { CreateUserDTO, User } from './user.types';

export class UserService {
  async createUser(dto: CreateUserDTO): Promise<User> {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('User with this email already exists.');
    }
    const insertId = await userRepository.createUser(dto);
    const user = await userRepository.findById(insertId);
    if (!user) {
      throw new Error('Failed to retrieve user after creation.');
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return userRepository.findByEmail(email);
  }

  async getUserById(id: number): Promise<User | null> {
    return userRepository.findById(id);
  }
}
export const userService = new UserService();
