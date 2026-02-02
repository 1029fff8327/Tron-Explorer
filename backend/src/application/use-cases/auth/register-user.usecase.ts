import { EmailVO } from 'src/domain/value-objects/email.vo';
import { JwtSignerPort } from 'src/domain/ports/jwt-signer.port';
import { PasswordHasherPort } from 'src/domain/ports/password-hasher.port';
import { UserAlreadyExistsError } from 'src/domain/errors/user-already-exists.error';
import { UserRepositoryPort } from 'src/domain/ports/user-repository.port';

export class RegisterUserUseCase {
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

    const exists = await this.users.findByEmail(email);
    if (exists) throw new UserAlreadyExistsError();

    const hash = await this.hasher.hash(password);
    const user = await this.users.create(email, hash);

    const accessToken = await this.jwt.sign({
      sub: user.id,
      email: user.email,
    });
    return { accessToken };
  }
}
