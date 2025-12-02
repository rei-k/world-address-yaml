# World Address Form Demo

A live demonstration of dynamic, multi-language address forms that adapt to different countries' address formats.

## 🌟 Features

### Multi-Language Support
- **English** - Full interface in English
- **日本語 (Japanese)** - Complete Japanese localization
- **中文 (Chinese)** - Full Chinese interface

### Country-Specific Forms
The form automatically adapts to show the appropriate fields for each country:

- **Japan (JP)**: Prefecture, City, Ward, Street Address, Building, Floor, Room, Postal Code
- **United States (US)**: Street Address, Building, Floor, Room, City, State, ZIP Code
- **United Kingdom (GB)**: House Number, Street, Locality, City, Postal Code
- **China (CN)**: Province, City, Street Address, Building, Room, Postal Code
- **France (FR)**: Street Address, Building, City, Postal Code
- **Germany (DE)**: Street Address, House Number, City, Postal Code
- **South Korea (KR)**: City, Street Address, Building, Floor, Room, Postal Code
- **Australia (AU)**: Street Address, City, State, Postal Code

### Two Modes

#### User Mode
Clean, user-friendly interface for filling out address forms with:
- Name fields (First Name, Last Name)
- Phone number field
- Dynamic address fields based on selected country
- Form validation with required field indicators
- Preview of submitted data

#### Developer Mode
Side-by-side view showing:
- The address form
- Raw JSON data for the selected country
- Field configuration and requirements
- Useful for debugging and integration

## 🚀 How to Use

1. **Select a Language**: Choose between English, Japanese, or Chinese using the language buttons at the top
2. **Select a Country**: Pick a country from the dropdown menu
3. **Fill the Form**: Enter your information in the dynamically generated fields
4. **Submit**: Click the Submit button to see a preview of your data

## 🎨 Design Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Beautiful Gradient UI**: Modern purple gradient design
- **Smooth Transitions**: Animated interactions for better UX
- **Accessibility**: Proper labels and form validation
- **No Build Required**: Pure HTML/CSS/JavaScript

## 🛠️ Technical Details

### Files
- `index.html` - Main HTML structure and styling
- `app.js` - JavaScript application logic and data

### Country Data Structure
Each country includes:
- Translated names in all supported languages
- Required and optional fields
- Postal code format and examples
- Phone number format and examples
- Localized placeholders for each field

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No external dependencies
- ES6+ JavaScript

## 📝 Adding More Countries

To add a new country, update the `countryData` object in `app.js`:

```javascript
countryData.XX = {
    name: { en: 'Country Name', ja: '国名', zh: '国名' },
    fields: ['field1', 'field2', ...],
    required: ['field1', ...],
    postalCodeFormat: 'format',
    postalCodeExample: 'example',
    phoneFormat: 'format',
    phoneExample: 'example',
    placeholders: {
        en: { field1: 'English placeholder', ... },
        ja: { field1: '日本語プレースホルダー', ... },
        zh: { field1: '中文占位符', ... }
    }
};
```

## 🌐 Live Demo

Visit the live demo at: [GitHub Pages URL will be here after deployment]

## 📄 License

This demo is part of the world-address-yaml project.
