/**
 * @vey/graphql - GraphQL schema and type definitions
 */

import type { AddressInput, ValidationResult, CountryAddressFormat } from '@vey/core';

/**
 * GraphQL schema as a string
 */
export const typeDefs = `#graphql
  """
  Address input for validation and storage
  """
  input AddressInput {
    recipient: String
    building: String
    floor: String
    room: String
    unit: String
    streetAddress: String
    district: String
    ward: String
    city: String
    province: String
    postalCode: String
    country: String!
  }

  """
  Validated address with normalized fields
  """
  type Address {
    id: ID!
    recipient: String
    building: String
    floor: String
    room: String
    unit: String
    streetAddress: String
    district: String
    ward: String
    city: String
    province: String
    postalCode: String
    country: String!
    formatted: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  """
  Address validation result
  """
  type ValidationResult {
    valid: Boolean!
    errors: [ValidationError!]!
    warnings: [ValidationWarning!]!
    normalized: Address
  }

  type ValidationError {
    field: String!
    code: String!
    message: String!
  }

  type ValidationWarning {
    field: String!
    code: String!
    message: String!
  }

  """
  Country address format configuration
  """
  type CountryFormat {
    countryCode: String!
    countryName: String!
    requiredFields: [String!]!
    fieldOrder: [String!]!
    postalCodePattern: String
    postalCodeExample: String
    languages: [Language!]!
  }

  type Language {
    name: String!
    script: String!
    direction: String!
    role: String!
  }

  """
  Delivery tracking information
  """
  type DeliveryStatus {
    id: ID!
    addressId: ID!
    carrier: String!
    trackingNumber: String
    status: DeliveryStatusEnum!
    estimatedDelivery: DateTime
    updatedAt: DateTime!
  }

  enum DeliveryStatusEnum {
    PENDING
    PICKED_UP
    IN_TRANSIT
    OUT_FOR_DELIVERY
    DELIVERED
    FAILED
  }

  """
  Locker location for pickup
  """
  type Locker {
    id: ID!
    name: String!
    address: Address!
    availability: LockerAvailability!
    compartments: Int!
  }

  enum LockerAvailability {
    AVAILABLE
    OCCUPIED
    MAINTENANCE
  }

  """
  Region hierarchy for picker UI
  """
  type Region {
    continent: String!
    countries: [CountryInfo!]!
  }

  type CountryInfo {
    code: String!
    name: String!
    provinces: [ProvinceInfo!]
  }

  type ProvinceInfo {
    code: String
    name: String!
    cities: [CityInfo!]
  }

  type CityInfo {
    code: String
    name: String!
    districts: [DistrictInfo!]
  }

  type DistrictInfo {
    code: String
    name: String!
  }

  type Query {
    """
    Get address by ID
    """
    address(id: ID!): Address

    """
    Validate an address
    """
    validateAddress(input: AddressInput!, countryCode: String!): ValidationResult!

    """
    Get country address format
    """
    countryFormat(countryCode: String!): CountryFormat

    """
    Get all supported countries
    """
    countries: [CountryFormat!]!

    """
    Get region hierarchy for picker
    """
    regionHierarchy: [Region!]!

    """
    Get delivery status
    """
    deliveryStatus(id: ID!): DeliveryStatus

    """
    Find nearby lockers
    """
    nearbyLockers(latitude: Float!, longitude: Float!, radius: Float): [Locker!]!

    """
    Get locker by ID
    """
    locker(id: ID!): Locker
  }

  type Mutation {
    """
    Create a new address
    """
    createAddress(input: AddressInput!): Address!

    """
    Update an existing address
    """
    updateAddress(id: ID!, input: AddressInput!): Address!

    """
    Delete an address
    """
    deleteAddress(id: ID!): Boolean!

    """
    Generate address proof QR code
    """
    generateAddressProof(addressId: ID!, expiresIn: Int): AddressProof!
  }

  type AddressProof {
    proofId: String!
    qrCodeData: String!
    expiresAt: DateTime!
  }

  type Subscription {
    """
    Subscribe to address updates
    """
    addressUpdated(id: ID!): Address!

    """
    Subscribe to delivery status changes
    """
    deliveryStatusChanged(addressId: ID!): DeliveryStatus!
  }

  scalar DateTime
`;

/**
 * GraphQL resolver types
 */
export interface Resolvers {
  Query: {
    address: (parent: unknown, args: { id: string }) => Promise<unknown>;
    validateAddress: (
      parent: unknown,
      args: { input: AddressInput; countryCode: string }
    ) => Promise<ValidationResult>;
    countryFormat: (
      parent: unknown,
      args: { countryCode: string }
    ) => Promise<CountryAddressFormat | null>;
    countries: () => Promise<CountryAddressFormat[]>;
    regionHierarchy: () => Promise<unknown[]>;
    deliveryStatus: (parent: unknown, args: { id: string }) => Promise<unknown>;
    nearbyLockers: (
      parent: unknown,
      args: { latitude: number; longitude: number; radius?: number }
    ) => Promise<unknown[]>;
    locker: (parent: unknown, args: { id: string }) => Promise<unknown>;
  };
  Mutation: {
    createAddress: (parent: unknown, args: { input: AddressInput }) => Promise<unknown>;
    updateAddress: (
      parent: unknown,
      args: { id: string; input: AddressInput }
    ) => Promise<unknown>;
    deleteAddress: (parent: unknown, args: { id: string }) => Promise<boolean>;
    generateAddressProof: (
      parent: unknown,
      args: { addressId: string; expiresIn?: number }
    ) => Promise<unknown>;
  };
}

/**
 * Create default resolvers with Vey client
 */
export function createResolvers(): Partial<Resolvers> {
  return {
    Query: {
      validateAddress: async (_, { input, countryCode }) => {
        const { createVeyClient } = await import('@vey/core');
        const client = createVeyClient();
        return client.validate(input, countryCode);
      },
      countryFormat: async (_, { countryCode }) => {
        const { createVeyClient } = await import('@vey/core');
        const client = createVeyClient();
        return client.getCountryFormat(countryCode);
      },
      regionHierarchy: async () => {
        const { createVeyClient } = await import('@vey/core');
        const client = createVeyClient();
        return client.getRegionHierarchy();
      },
      countries: async () => [],
      address: async () => null,
      deliveryStatus: async () => null,
      nearbyLockers: async () => [],
      locker: async () => null,
    },
    Mutation: {
      createAddress: async () => ({}),
      updateAddress: async () => ({}),
      deleteAddress: async () => true,
      generateAddressProof: async () => ({}),
    },
  };
}

/**
 * Export schema as file content
 */
export function getSchemaString(): string {
  return typeDefs;
}
