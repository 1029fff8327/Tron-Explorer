import {
  Body,
  ConflictException,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from 'src/application/dto/auth/register.dto';
import { LoginDto } from 'src/application/dto/auth/login.dto';
import { RegisterUserUseCase } from 'src/application/use-cases/auth/register-user.usecase';
import { LoginUserUseCase } from 'src/application/use-cases/auth/login-user.usecase';
import { InvalidCredentialsError } from 'src/domain/errors/invalid-credentials.error';
import { UserAlreadyExistsError } from 'src/domain/errors/user-already-exists.error';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUc: RegisterUserUseCase,
    private readonly loginUc: LoginUserUseCase,
  ) {}

  private mapAuthError(e: unknown): never {
    if (e instanceof UserAlreadyExistsError) {
      throw new ConflictException(e.message);
    }
    if (e instanceof InvalidCredentialsError) {
      throw new UnauthorizedException(e.message);
    }
    throw e instanceof Error ? e : new Error('Unknown error');
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.registerUc.execute(dto.email, dto.password);
    } catch (e: unknown) {
      this.mapAuthError(e);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.loginUc.execute(dto.email, dto.password);
    } catch (e: unknown) {
      this.mapAuthError(e);
    }
  }
}
