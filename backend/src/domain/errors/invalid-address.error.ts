import { DomainError } from './domain-error';

export class InvalidAddressError extends DomainError {
  constructor(message = 'Invalid wallet address') {
    super(message, 'INVALID_ADDRESS');
  }
}
