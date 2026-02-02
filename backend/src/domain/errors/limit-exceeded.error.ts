import { DomainError } from './domain-error';

export type LimitExceededDetails = {
  dayUtc?: string;
  dailyLimit?: number;
  dailyRemaining?: number;

  minuteLimit?: number;
  minuteRemaining?: number;
  minuteResetInMs?: number;
};

export class LimitExceededError extends DomainError {
  constructor(
    message = 'Limit exceeded',
    public readonly details?: LimitExceededDetails,
  ) {
    super(message, 'LIMIT_EXCEEDED');
  }
}
