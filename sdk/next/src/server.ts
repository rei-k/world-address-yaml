'use server';

import { validateAddress, normalizeAddress, encodePID } from '@vey/core';

/**
 * Server-side address validation
 */
export async function validateAddressAction(
  address: any,
  countryCode: string
): Promise<any> {
  'use server';
  return validateAddress(address, countryCode);
}

/**
 * Server-side address normalization
 */
export async function normalizeAddressAction(
  address: any,
  countryCode: string
): Promise<any> {
  'use server';
  return normalizeAddress(address, countryCode);
}

/**
 * Server-side PID encoding
 */
export async function encodePIDAction(components: any): Promise<string> {
  'use server';
  return encodePID(components);
}

/**
 * API Route Handler for address validation
 */
export async function POST(request: Request) {
  const { address, countryCode } = await request.json();
  
  try {
    const validation = await validateAddress(address, countryCode);
    return Response.json(validation);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
