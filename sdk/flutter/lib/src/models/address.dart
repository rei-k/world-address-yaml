class Address {
  final String? street;
  final String? city;
  final String? province;
  final String? postalCode;
  final String? country;

  Address({
    this.street,
    this.city,
    this.province,
    this.postalCode,
    this.country,
  });

  Map<String, dynamic> toJson() {
    return {
      'street': street,
      'city': city,
      'province': province,
      'postalCode': postalCode,
      'country': country,
    };
  }

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      street: json['street'],
      city: json['city'],
      province: json['province'],
      postalCode: json['postalCode'],
      country: json['country'],
    );
  }

  Address copyWith({
    String? street,
    String? city,
    String? province,
    String? postalCode,
    String? country,
  }) {
    return Address(
      street: street ?? this.street,
      city: city ?? this.city,
      province: province ?? this.province,
      postalCode: postalCode ?? this.postalCode,
      country: country ?? this.country,
    );
  }
}
