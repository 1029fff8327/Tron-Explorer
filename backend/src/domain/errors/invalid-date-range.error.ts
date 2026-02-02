export class InvalidDateRangeError extends Error {
  constructor(message = 'dateFrom must be <= dateTo') {
    super(message);
    this.name = 'InvalidDateRangeError';
  }
}
