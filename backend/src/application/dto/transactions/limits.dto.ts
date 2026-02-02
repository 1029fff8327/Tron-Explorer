export class LimitsDto {
  dailyLimit!: number;
  dailyRemaining!: number;
  minuteLimit!: number;
  minuteRemaining!: number;
  dayUtc!: string;
  minuteResetInMs!: number;
}
