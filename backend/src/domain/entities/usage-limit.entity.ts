export class UsageLimitEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly dayUtc: string,
    public readonly count: number,
    public readonly updatedAt: Date,
  ) {}
}
