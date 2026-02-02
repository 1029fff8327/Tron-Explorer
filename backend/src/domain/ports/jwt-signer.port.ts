export interface JwtSignerPort {
  sign(payload: Record<string, any>): Promise<string>;
}
