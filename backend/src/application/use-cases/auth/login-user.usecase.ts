import { EmailVO } from 'src/domain/value-objects/email.vo';
import { InvalidCredentialsError } from 'src/domain/errors/invalid-credentials.error';
import { JwtSignerPort } from 'src/domain/ports/jwt-signer.port';
import { PasswordHasherPort } from 'src/domain/ports/password-hasher.port';
import { UserRepositoryPort } from 'src/domain/ports/user-repository.port';

export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly jwt: JwtSignerPort,
  ) {}

  async execute(
    emailRaw: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const email = new EmailVO(emailRaw).value;

    const user = await this.users.findByEmail(email);
    if (!user) throw new InvalidCredentialsError();

    const ok = await this.hasher.verify(password, user.passwordHash);
    if (!ok) throw new InvalidCredentialsError();

    const accessToken = await this.jwt.sign({
      sub: user.id,
      email: user.email,
    });
    return { accessToken };
  }
}
