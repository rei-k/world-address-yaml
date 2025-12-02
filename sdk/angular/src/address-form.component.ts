import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { VeyService } from './vey.service';

@Component({
  selector: 'vey-address-form',
  template: `
    <div class="vey-address-form">
      <div class="form-group">
        <label for="country">Country</label>
        <select id="country" [(ngModel)]="countryCode" (change)="onCountryChange()">
          <option value="">Select a country</option>
          <option *ngFor="let country of countries" [value]="country.code">
            {{ country.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group" *ngIf="countryCode">
        <label for="street">Street Address</label>
        <input id="street" type="text" [(ngModel)]="address.street" />
      </div>
      
      <div class="form-group" *ngIf="countryCode">
        <label for="city">City</label>
        <input id="city" type="text" [(ngModel)]="address.city" />
      </div>
      
      <div class="form-group" *ngIf="countryCode">
        <label for="postalCode">Postal Code</label>
        <input id="postalCode" type="text" [(ngModel)]="address.postalCode" />
      </div>
      
      <button (click)="handleSubmit()" [disabled]="!countryCode">
        {{ submitLabel }}
      </button>
      
      <div class="validation-errors" *ngIf="errors.length > 0">
        <ul>
          <li *ngFor="let error of errors">{{ error }}</li>
        </ul>
      </div>
    </div>
  `
})
export class AddressFormComponent implements OnInit {
  @Input() countryCode: string = '';
  @Input() submitLabel: string = 'Submit';
  @Output() submit = new EventEmitter<any>();

  address: any = {
    street: '',
    city: '',
    postalCode: ''
  };

  countries: Array<{ code: string; name: string }> = [
    { code: 'JP', name: 'Japan' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' }
  ];

  errors: string[] = [];

  constructor(private veyService: VeyService) {}

  ngOnInit() {
    // Load country list from core
  }

  onCountryChange() {
    this.errors = [];
  }

  async handleSubmit() {
    try {
      const validation = await this.veyService.validateAddress(this.address, this.countryCode);
      
      if (validation.valid) {
        this.errors = [];
        this.submit.emit({ address: this.address, validation });
      } else {
        this.errors = validation.errors || ['Invalid address'];
      }
    } catch (error) {
      this.errors = ['Validation failed'];
    }
  }
}
