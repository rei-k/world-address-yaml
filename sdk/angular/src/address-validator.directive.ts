import { Directive, Input, forwardRef } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { VeyService } from './vey.service';

@Directive({
  selector: '[veyAddressValidator]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => AddressValidatorDirective),
    multi: true
  }]
})
export class AddressValidatorDirective implements Validator {
  @Input('veyAddressValidator') countryCode: string = '';

  constructor(private veyService: VeyService) {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.countryCode) {
      return null;
    }

    // Synchronous basic validation
    // For async validation, use AsyncValidator
    return null;
  }
}
