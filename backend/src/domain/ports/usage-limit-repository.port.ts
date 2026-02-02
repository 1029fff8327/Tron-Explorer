export interface UsageLimitRepositoryPort {
  getOrCreateDay(userId: string, dayUtc: string): Promise<{ count: number }>;

  incrementDay(
    userId: string,
    dayUtc: string,
    delta: number,
  ): Promise<{ count: number }>;

  tryIncrementDay(
    userId: string,
    dayUtc: string,
    limit: number,
  ): Promise<{ ok: boolean; count: number }>;
}
