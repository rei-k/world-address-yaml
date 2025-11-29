/**
 * @vey/widget - Universal Shadow Widget for address forms
 *
 * Framework-agnostic embeddable address form using Web Components
 */

import {
  createVeyClient,
  VeyConfig,
  AddressInput,
  ValidationResult,
} from '@vey/core';

/**
 * Widget configuration options
 */
export interface VeyWidgetOptions {
  /** Vey SDK configuration */
  config?: VeyConfig;
  /** Country code for address format */
  countryCode?: string;
  /** Initial address values */
  initialValue?: AddressInput;
  /** Callback when address changes */
  onChange?: (address: AddressInput) => void;
  /** Callback when form is submitted */
  onSubmit?: (address: AddressInput, validation: ValidationResult) => void;
  /** Custom CSS styles */
  styles?: string;
  /** Theme (light or dark) */
  theme?: 'light' | 'dark';
  /** Language for labels */
  language?: string;
  /** Show validation errors */
  showValidation?: boolean;
  /** Auto-layout field resolver */
  autoLayout?: boolean;
}

/**
 * Default styles for the widget
 */
const defaultStyles = `
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  }

  .vey-widget {
    padding: 16px;
    background: var(--vey-bg, #ffffff);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .vey-widget.dark {
    --vey-bg: #1a1a1a;
    --vey-text: #ffffff;
    --vey-border: #333;
    --vey-input-bg: #2a2a2a;
  }

  .vey-field {
    margin-bottom: 16px;
  }

  .vey-label {
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 500;
    color: var(--vey-text, #333);
  }

  .vey-label .required {
    color: #dc3545;
    margin-left: 2px;
  }

  .vey-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--vey-border, #ccc);
    border-radius: 4px;
    font-size: 16px;
    background: var(--vey-input-bg, #fff);
    color: var(--vey-text, #333);
    box-sizing: border-box;
  }

  .vey-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  .vey-input.error {
    border-color: #dc3545;
  }

  .vey-error {
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
  }

  .vey-warning {
    color: #ffc107;
    font-size: 12px;
    margin-top: 4px;
  }

  .vey-submit {
    width: 100%;
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .vey-submit:hover {
    background: #0056b3;
  }

  .vey-submit:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .vey-row {
    display: flex;
    gap: 16px;
  }

  .vey-row .vey-field {
    flex: 1;
  }

  .vey-country-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--vey-border, #ccc);
    border-radius: 4px;
    font-size: 16px;
    background: var(--vey-input-bg, #fff);
    color: var(--vey-text, #333);
    cursor: pointer;
  }
`;

/**
 * Field labels in different languages
 */
const labels: Record<string, Record<string, string>> = {
  en: {
    recipient: 'Recipient',
    building: 'Building',
    floor: 'Floor',
    room: 'Room',
    unit: 'Unit',
    street_address: 'Street Address',
    district: 'District',
    ward: 'Ward',
    city: 'City',
    province: 'State/Province',
    postal_code: 'Postal Code',
    country: 'Country',
    submit: 'Submit',
    validating: 'Validating...',
  },
  ja: {
    recipient: '宛名',
    building: '建物名',
    floor: '階',
    room: '部屋番号',
    unit: 'ユニット',
    street_address: '住所',
    district: '地区',
    ward: '区',
    city: '市区町村',
    province: '都道府県',
    postal_code: '郵便番号',
    country: '国',
    submit: '送信',
    validating: '検証中...',
  },
};

/**
 * Countries list
 */
const countries = [
  { code: 'JP', name: 'Japan' },
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'South Korea' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
];

/**
 * VeyAddressWidget - Custom element for address forms
 */
export class VeyAddressWidget extends HTMLElement {
  private shadow: ShadowRoot;
  private options: VeyWidgetOptions;
  private client = createVeyClient();
  private address: AddressInput = {};
  private errors: Map<string, string> = new Map();
  private isValidating = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.options = {};
  }

  static get observedAttributes(): string[] {
    return ['country-code', 'theme', 'language'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (oldValue !== newValue) {
      if (name === 'country-code') {
        this.options.countryCode = newValue;
      } else if (name === 'theme') {
        this.options.theme = newValue as 'light' | 'dark';
      } else if (name === 'language') {
        this.options.language = newValue;
      }
      this.render();
    }
  }

  /**
   * Configure the widget
   */
  configure(options: VeyWidgetOptions): void {
    this.options = { ...this.options, ...options };
    if (options.config) {
      this.client = createVeyClient(options.config);
    }
    if (options.initialValue) {
      this.address = { ...options.initialValue };
    }
    this.render();
  }

  /**
   * Get current address value
   */
  getValue(): AddressInput {
    return { ...this.address };
  }

  /**
   * Set address value
   */
  setValue(address: AddressInput): void {
    this.address = { ...address };
    this.render();
  }

  /**
   * Validate current address
   */
  async validate(): Promise<ValidationResult> {
    const countryCode = this.options.countryCode ?? 'US';
    return this.client.validate(this.address, countryCode);
  }

  private getLabel(key: string): string {
    const lang = this.options.language ?? 'en';
    return labels[lang]?.[key] ?? labels.en[key] ?? key;
  }

  private handleInput(field: keyof AddressInput, value: string): void {
    this.address[field] = value;
    this.errors.delete(field);
    this.options.onChange?.(this.address);
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    this.isValidating = true;
    this.render();

    const result = await this.validate();
    this.isValidating = false;

    if (!result.valid) {
      result.errors.forEach((err) => {
        this.errors.set(err.field, err.message);
      });
    }

    this.render();
    this.options.onSubmit?.(this.address, result);
  }

  private render(): void {
    const theme = this.options.theme ?? 'light';
    const customStyles = this.options.styles ?? '';
    const countryCode = this.options.countryCode ?? '';

    const fields: (keyof AddressInput)[] = [
      'recipient',
      'street_address',
      'building',
      'city',
      'province',
      'postal_code',
    ];

    this.shadow.innerHTML = `
      <style>${defaultStyles}${customStyles}</style>
      <div class="vey-widget ${theme}">
        <form id="vey-form">
          <div class="vey-field">
            <label class="vey-label">${this.getLabel('country')}</label>
            <select class="vey-country-select" id="country">
              <option value="">Select a country</option>
              ${countries.map((c) => `
                <option value="${c.code}" ${c.code === countryCode ? 'selected' : ''}>
                  ${c.name}
                </option>
              `).join('')}
            </select>
          </div>
          ${fields.map((field) => `
            <div class="vey-field">
              <label class="vey-label">
                ${this.getLabel(field)}
              </label>
              <input
                type="text"
                class="vey-input ${this.errors.has(field) ? 'error' : ''}"
                id="${field}"
                value="${this.address[field] ?? ''}"
              />
              ${this.errors.has(field) ? `<div class="vey-error">${this.errors.get(field)}</div>` : ''}
            </div>
          `).join('')}
          <button type="submit" class="vey-submit" ${this.isValidating ? 'disabled' : ''}>
            ${this.isValidating ? this.getLabel('validating') : this.getLabel('submit')}
          </button>
        </form>
      </div>
    `;

    // Add event listeners
    const form = this.shadow.getElementById('vey-form');
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    const countrySelect = this.shadow.getElementById('country') as HTMLSelectElement;
    countrySelect?.addEventListener('change', (e) => {
      this.options.countryCode = (e.target as HTMLSelectElement).value;
      this.handleInput('country', this.options.countryCode);
    });

    fields.forEach((field) => {
      const input = this.shadow.getElementById(field) as HTMLInputElement;
      input?.addEventListener('input', (e) => {
        this.handleInput(field, (e.target as HTMLInputElement).value);
      });
    });
  }
}

/**
 * Register the custom element
 */
export function registerVeyWidget(): void {
  if (!customElements.get('vey-address-widget')) {
    customElements.define('vey-address-widget', VeyAddressWidget);
  }
}

/**
 * Create and mount widget to an element
 */
export function createVeyWidget(
  container: HTMLElement | string,
  options: VeyWidgetOptions = {}
): VeyAddressWidget {
  registerVeyWidget();

  const element = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!element) {
    throw new Error('Container element not found');
  }

  const widget = document.createElement('vey-address-widget') as VeyAddressWidget;
  widget.configure(options);
  element.appendChild(widget);

  return widget;
}

// Auto-register when loaded in browser
if (typeof window !== 'undefined') {
  registerVeyWidget();
}
