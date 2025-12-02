class ValidationResult {
  final bool valid;
  final List<String> errors;

  ValidationResult({
    required this.valid,
    this.errors = const [],
  });

  factory ValidationResult.fromJson(Map<String, dynamic> json) {
    return ValidationResult(
      valid: json['valid'] ?? false,
      errors: (json['errors'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'valid': valid,
      'errors': errors,
    };
  }
}
