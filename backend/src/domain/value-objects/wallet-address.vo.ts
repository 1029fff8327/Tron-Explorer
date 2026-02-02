import { InvalidAddressError } from '../errors/invalid-address.error';

export class WalletAddressVO {
  public readonly value: string;

  constructor(address: string) {
    const v = (address ?? '').trim();
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(v)) {
      throw new InvalidAddressError();
    }
    this.value = v;
  }
}
