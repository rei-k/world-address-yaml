import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VeyService } from './vey.service';
import { AddressFormComponent } from './address-form.component';
import { AddressValidatorDirective } from './address-validator.directive';

export interface VeyConfig {
  apiKey?: string;
  apiEndpoint?: string;
}

@NgModule({
  declarations: [
    AddressFormComponent,
    AddressValidatorDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AddressFormComponent,
    AddressValidatorDirective
  ]
})
export class VeyModule {
  static forRoot(config?: VeyConfig): ModuleWithProviders<VeyModule> {
    return {
      ngModule: VeyModule,
      providers: [
        VeyService,
        { provide: 'VeyConfig', useValue: config || {} }
      ]
    };
  }
}
