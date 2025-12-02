import 'dart:convert';
import 'package:http/http.dart' as http;
import 'models/address.dart';
import 'models/validation_result.dart';

class VeyClient {
  final String apiKey;
  final String apiEndpoint;

  VeyClient({
    required this.apiKey,
    this.apiEndpoint = 'https://api.vey.example',
  });

  /// Validate an address for a specific country
  Future<ValidationResult> validateAddress(
    Address address,
    String countryCode,
  ) async {
    final response = await http.post(
      Uri.parse('$apiEndpoint/validate'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: jsonEncode({
        'address': address.toJson(),
        'countryCode': countryCode,
      }),
    );

    if (response.statusCode == 200) {
      return ValidationResult.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to validate address');
    }
  }

  /// Normalize an address to standard format
  Future<Address> normalizeAddress(
    Address address,
    String countryCode,
  ) async {
    final response = await http.post(
      Uri.parse('$apiEndpoint/normalize'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: jsonEncode({
        'address': address.toJson(),
        'countryCode': countryCode,
      }),
    );

    if (response.statusCode == 200) {
      return Address.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to normalize address');
    }
  }

  /// Encode address components into a PID
  String encodePID(Map<String, dynamic> components) {
    // Implementation would call core library or API
    final parts = <String>[];
    
    if (components['country'] != null) parts.add(components['country']);
    if (components['admin1'] != null) parts.add(components['admin1']);
    if (components['admin2'] != null) parts.add(components['admin2']);
    if (components['locality'] != null) parts.add(components['locality']);
    
    return parts.join('-');
  }
}
