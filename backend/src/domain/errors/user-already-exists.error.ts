import { DomainError } from './domain-error';

export class UserAlreadyExistsError extends DomainError {
  constructor(message = 'User already exists') {
    super(message, 'USER_ALREADY_EXISTS');
  }
}
