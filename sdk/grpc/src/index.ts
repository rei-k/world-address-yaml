/**
 * @vey/grpc - gRPC utilities and proto file content
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Get the proto file path
 */
export function getProtoPath(): string {
  return path.join(__dirname, '..', 'proto', 'vey.proto');
}

/**
 * Get the proto file content as string
 */
export function getProtoContent(): string {
  const protoPath = path.join(__dirname, '..', 'proto', 'vey.proto');
  return fs.readFileSync(protoPath, 'utf-8');
}

/**
 * Proto file content (embedded for bundling)
 */
export const protoContent = `
syntax = "proto3";

package vey.address.v1;

option go_package = "github.com/vey/address/v1;addressv1";
option java_package = "com.vey.address.v1";
option java_multiple_files = true;

service AddressService {
  rpc ValidateAddress(ValidateAddressRequest) returns (ValidateAddressResponse);
  rpc GetAddress(GetAddressRequest) returns (Address);
  rpc CreateAddress(CreateAddressRequest) returns (Address);
  rpc UpdateAddress(UpdateAddressRequest) returns (Address);
  rpc DeleteAddress(DeleteAddressRequest) returns (DeleteAddressResponse);
  rpc GetCountryFormat(GetCountryFormatRequest) returns (CountryFormat);
  rpc ListCountries(ListCountriesRequest) returns (ListCountriesResponse);
  rpc StreamAddressUpdates(StreamAddressUpdatesRequest) returns (stream AddressUpdate);
}

service DeliveryService {
  rpc GetDeliveryStatus(GetDeliveryStatusRequest) returns (DeliveryStatus);
  rpc StreamDeliveryUpdates(StreamDeliveryUpdatesRequest) returns (stream DeliveryStatus);
}

service LockerService {
  rpc FindNearbyLockers(FindNearbyLockersRequest) returns (FindNearbyLockersResponse);
  rpc GetLocker(GetLockerRequest) returns (Locker);
}

message AddressInput {
  string recipient = 1;
  string building = 2;
  string floor = 3;
  string room = 4;
  string unit = 5;
  string street_address = 6;
  string district = 7;
  string ward = 8;
  string city = 9;
  string province = 10;
  string postal_code = 11;
  string country = 12;
}

message Address {
  string id = 1;
  string recipient = 2;
  string building = 3;
  string floor = 4;
  string room = 5;
  string unit = 6;
  string street_address = 7;
  string district = 8;
  string ward = 9;
  string city = 10;
  string province = 11;
  string postal_code = 12;
  string country = 13;
  string formatted = 14;
  int64 created_at = 15;
  int64 updated_at = 16;
}

message ValidationError {
  string field = 1;
  string code = 2;
  string message = 3;
}

message ValidateAddressRequest {
  AddressInput address = 1;
  string country_code = 2;
}

message ValidateAddressResponse {
  bool valid = 1;
  repeated ValidationError errors = 2;
  Address normalized = 3;
}

message GetAddressRequest {
  string id = 1;
}

message CreateAddressRequest {
  AddressInput address = 1;
}

message UpdateAddressRequest {
  string id = 1;
  AddressInput address = 2;
}

message DeleteAddressRequest {
  string id = 1;
}

message DeleteAddressResponse {
  bool success = 1;
}

message GetCountryFormatRequest {
  string country_code = 1;
}

message CountryFormat {
  string country_code = 1;
  string country_name = 2;
  repeated string required_fields = 3;
  repeated string field_order = 4;
  string postal_code_pattern = 5;
}

message ListCountriesRequest {}

message ListCountriesResponse {
  repeated CountryFormat countries = 1;
}

message StreamAddressUpdatesRequest {
  repeated string address_ids = 1;
}

message AddressUpdate {
  string address_id = 1;
  string event_type = 2;
  Address address = 3;
  int64 timestamp = 4;
}

message GetDeliveryStatusRequest {
  string id = 1;
}

message DeliveryStatus {
  string id = 1;
  string address_id = 2;
  string carrier = 3;
  string tracking_number = 4;
  string status = 5;
  int64 updated_at = 6;
}

message StreamDeliveryUpdatesRequest {
  string address_id = 1;
}

message FindNearbyLockersRequest {
  double latitude = 1;
  double longitude = 2;
  double radius_km = 3;
}

message FindNearbyLockersResponse {
  repeated Locker lockers = 1;
}

message Locker {
  string id = 1;
  string name = 2;
  Address address = 3;
  string availability = 4;
}

message GetLockerRequest {
  string id = 1;
}
`;

/**
 * TypeScript type definitions matching the proto messages
 */
export interface AddressInput {
  recipient?: string;
  building?: string;
  floor?: string;
  room?: string;
  unit?: string;
  street_address?: string;
  district?: string;
  ward?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
}

export interface Address extends AddressInput {
  id: string;
  formatted?: string;
  created_at?: number;
  updated_at?: number;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidateAddressRequest {
  address: AddressInput;
  country_code: string;
}

export interface ValidateAddressResponse {
  valid: boolean;
  errors: ValidationError[];
  normalized?: Address;
}

export interface CountryFormat {
  country_code: string;
  country_name: string;
  required_fields: string[];
  field_order: string[];
  postal_code_pattern?: string;
}

export interface DeliveryStatus {
  id: string;
  address_id: string;
  carrier: string;
  tracking_number?: string;
  status: string;
  updated_at?: number;
}

export interface Locker {
  id: string;
  name: string;
  address: Address;
  availability: string;
}
