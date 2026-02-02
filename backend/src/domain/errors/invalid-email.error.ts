import { DomainError } from './domain-error';

export class InvalidEmailError extends DomainError {
  constructor(message = 'Invalid email') {
    super(message, 'INVALID_EMAIL');
  }
}
