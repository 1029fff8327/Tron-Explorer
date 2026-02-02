import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtSignerPort } from 'src/domain/ports/jwt-signer.port';

@Injectable()
export class JwtSigner implements JwtSignerPort {
  constructor(private readonly jwt: JwtService) {}
  async sign(payload: Record<string, any>): Promise<string> {
    return this.jwt.signAsync(payload);
  }
}
