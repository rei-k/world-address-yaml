import 'package:flutter/material.dart';
import '../vey_client.dart';
import '../models/address.dart';
import '../models/validation_result.dart';

class AddressForm extends StatefulWidget {
  final String countryCode;
  final VeyClient client;
  final Function(Address address, ValidationResult validation)? onSubmit;
  final String submitLabel;

  const AddressForm({
    Key? key,
    required this.countryCode,
    required this.client,
    this.onSubmit,
    this.submitLabel = 'Submit',
  }) : super(key: key);

  @override
  State<AddressForm> createState() => _AddressFormState();
}

class _AddressFormState extends State<AddressForm> {
  final _formKey = GlobalKey<FormState>();
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _provinceController = TextEditingController();
  final _postalCodeController = TextEditingController();

  bool _isValidating = false;
  List<String> _errors = [];

  @override
  void dispose() {
    _streetController.dispose();
    _cityController.dispose();
    _provinceController.dispose();
    _postalCodeController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isValidating = true;
      _errors = [];
    });

    final address = Address(
      street: _streetController.text,
      city: _cityController.text,
      province: _provinceController.text,
      postalCode: _postalCodeController.text,
      country: widget.countryCode,
    );

    try {
      final validation = await widget.client.validateAddress(
        address,
        widget.countryCode,
      );

      if (validation.valid) {
        widget.onSubmit?.call(address, validation);
      } else {
        setState(() {
          _errors = validation.errors;
        });
      }
    } catch (e) {
      setState(() {
        _errors = ['Validation failed: $e'];
      });
    } finally {
      setState(() {
        _isValidating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: _streetController,
            decoration: const InputDecoration(
              labelText: 'Street Address',
              border: OutlineInputBorder(),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a street address';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _cityController,
            decoration: const InputDecoration(
              labelText: 'City',
              border: OutlineInputBorder(),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a city';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _provinceController,
            decoration: const InputDecoration(
              labelText: 'Province/State',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _postalCodeController,
            decoration: const InputDecoration(
              labelText: 'Postal Code',
              border: OutlineInputBorder(),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a postal code';
              }
              return null;
            },
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isValidating ? null : _handleSubmit,
              child: _isValidating
                  ? const CircularProgressIndicator()
                  : Text(widget.submitLabel),
            ),
          ),
          if (_errors.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red[50],
                border: Border.all(color: Colors.red[200]!),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: _errors
                    .map((error) => Text(
                          error,
                          style: TextStyle(color: Colors.red[900]),
                        ))
                    .toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
