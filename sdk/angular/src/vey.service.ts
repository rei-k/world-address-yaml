import { Injectable, Inject, Optional } from '@angular/core';
import { validateAddress, normalizeAddress, encodePID, decodePID } from '@vey/core';

export interface VeyConfig {
  apiKey?: string;
  apiEndpoint?: string;
}

@Injectable()
export class VeyService {
  constructor(@Optional() @Inject('VeyConfig') private config: VeyConfig) {}

  /**
   * Validate an address for a specific country
   */
  validateAddress(address: any, countryCode: string): Promise<any> {
    return validateAddress(address, countryCode);
  }

  /**
   * Normalize an address to standard format
   */
  normalizeAddress(address: any, countryCode: string): Promise<any> {
    return normalizeAddress(address, countryCode);
  }

  /**
   * Encode address components into a PID
   */
  encodePID(components: any): string {
    return encodePID(components);
  }

  /**
   * Decode a PID into address components
   */
  decodePID(pid: string): any {
    return decodePID(pid);
  }
}
