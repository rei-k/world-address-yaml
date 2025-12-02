# vey_sdk

Flutter SDK for World Address YAML - Address validation and formatting for Flutter applications.

## Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  vey_sdk: ^1.0.0
```

## Usage

### Initialize the Client

```dart
import 'package:vey_sdk/vey_sdk.dart';

final veyClient = VeyClient(
  apiKey: 'your-api-key',
);
```

### Use the Address Form Widget

```dart
import 'package:flutter/material.dart';
import 'package:vey_sdk/vey_sdk.dart';

class CheckoutPage extends StatelessWidget {
  final veyClient = VeyClient(apiKey: 'your-api-key');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Shipping Address')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: AddressForm(
          countryCode: 'JP',
          client: veyClient,
          onSubmit: (address, validation) {
            if (validation.valid) {
              print('Valid address: ${address.street}');
            }
          },
        ),
      ),
    );
  }
}
```

### Validate an Address

```dart
final address = Address(
  street: '1-1 Chiyoda',
  city: 'Tokyo',
  postalCode: '100-0001',
);

final validation = await veyClient.validateAddress(address, 'JP');

if (validation.valid) {
  print('Address is valid!');
} else {
  print('Errors: ${validation.errors.join(', ')}');
}
```

### Normalize an Address

```dart
final normalized = await veyClient.normalizeAddress(address, 'JP');
print('Normalized: ${normalized.street}');
```

## Features

- ✅ Address validation
- ✅ Address normalization
- ✅ PID encoding
- ✅ Pre-built widgets
- ✅ Form validation
- ✅ Material Design

## License

MIT
