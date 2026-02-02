export class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);

    this.code = code;
    this.name = new.target.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
