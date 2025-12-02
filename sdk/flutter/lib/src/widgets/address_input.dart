import 'package:flutter/material.dart';

class AddressInput extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final FormFieldValidator<String>? validator;

  const AddressInput({
    Key? key,
    required this.controller,
    required this.label,
    this.hint,
    this.validator,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        border: const OutlineInputBorder(),
      ),
      validator: validator,
    );
  }
}
