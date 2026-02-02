import { UserEntity } from '../entities/user.entity';

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(email: string, passwordHash: string): Promise<UserEntity>;
}
