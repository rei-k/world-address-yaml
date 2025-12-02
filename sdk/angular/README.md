# @vey/angular

Angular SDK for World Address YAML - Address validation and formatting for Angular applications.

## Installation

```bash
npm install @vey/angular @vey/core
```

## Usage

### Module Setup

```typescript
import { NgModule } from '@angular/core';
import { VeyModule } from '@vey/angular';

@NgModule({
  imports: [
    VeyModule.forRoot({
      apiKey: 'your-api-key'
    })
  ]
})
export class AppModule { }
```

### Using the Service

```typescript
import { Component } from '@angular/core';
import { VeyService } from '@vey/angular';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="validateAddress()">Validate</button>
  `
})
export class AppComponent {
  constructor(private veyService: VeyService) {}

  async validateAddress() {
    const result = await this.veyService.validateAddress(
      {
        street: '1-1 Chiyoda',
        city: 'Tokyo',
        postalCode: '100-0001'
      },
      'JP'
    );
    
    console.log(result);
  }
}
```

### Using the Component

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-checkout',
  template: `
    <vey-address-form
      countryCode="JP"
      (submit)="handleAddressSubmit($event)"
    ></vey-address-form>
  `
})
export class CheckoutComponent {
  handleAddressSubmit(event: any) {
    console.log('Address:', event.address);
    console.log('Validation:', event.validation);
  }
}
```

### Using the Validator Directive

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form',
  template: `
    <input
      [formControl]="addressControl"
      [veyAddressValidator]="'JP'"
    />
  `
})
export class FormComponent {
  addressControl = new FormControl('');
}
```

## API Reference

See the [main documentation](../../README.md) for full API reference.

## License

MIT
