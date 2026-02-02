import { InvalidEmailError } from '../errors/invalid-email.error';

export class EmailVO {
  public readonly value: string;

  constructor(email: string) {
    const v = (email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      throw new InvalidEmailError();
    }
    this.value = v;
  }
}
