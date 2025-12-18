# Multi-Currency Support Guide

## Overview

The appointment booking application now supports **40+ world currencies** with special emphasis on **FCFA (Central African CFA Franc)** for the CEMAC region, making it accessible to users worldwide.

## Key Features

### 🌍 **Comprehensive Currency Support**

- **FCFA (XAF)** - Central African CFA Franc (Priority for CEMAC countries)
- **XOF** - West African CFA Franc
- **Major International Currencies** - USD, EUR, GBP, JPY, etc.
- **Regional Currencies** - African, Asian, European, American, and more

### 🧠 **Smart Currency Detection**

- Auto-detects user's preferred currency based on browser location
- Prioritizes CEMAC currencies (FCFA) for Central African users
- Falls back to USD if no match is found
- Remembers user preference across sessions

### 💱 **Real-Time Price Formatting**

- Instant currency conversion display
- Proper formatting for different decimal requirements (e.g., no decimals for JPY)
- Live price preview while entering amounts
- Consistent formatting across the entire application

## Supported Currencies

### **Central & West Africa (Priority)**

| Code | Currency                  | Symbol | Countries                                                                             |
| ---- | ------------------------- | ------ | ------------------------------------------------------------------------------------- |
| XAF  | Central African CFA Franc | FCFA   | Cameroon, Central African Republic, Chad, Republic of Congo, Equatorial Guinea, Gabon |
| XOF  | West African CFA Franc    | CFA    | Benin, Burkina Faso, Côte d'Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo         |
| MAD  | Moroccan Dirham           | MAD    | Morocco, Western Sahara                                                               |
| NGN  | Nigerian Naira            | ₦      | Nigeria                                                                               |
| EGP  | Egyptian Pound            | E£     | Egypt                                                                                 |
| ZAR  | South African Rand        | R      | South Africa, Lesotho, Namibia, Eswatini                                              |
| KES  | Kenyan Shilling           | KSh    | Kenya                                                                                 |
| GHS  | Ghanaian Cedi             | ₵      | Ghana                                                                                 |

### **Major International Currencies**

| Code | Currency          | Symbol | Region                                                  |
| ---- | ----------------- | ------ | ------------------------------------------------------- |
| USD  | US Dollar         | $      | United States, Ecuador, El Salvador, Panama, East Timor |
| EUR  | Euro              | €      | Eurozone (19 countries), European Union                 |
| GBP  | British Pound     | £      | United Kingdom                                          |
| JPY  | Japanese Yen      | ¥      | Japan                                                   |
| CAD  | Canadian Dollar   | C$     | Canada                                                  |
| AUD  | Australian Dollar | A$     | Australia, Kiribati, Nauru, Tuvalu                      |
| CHF  | Swiss Franc       | CHF    | Switzerland, Liechtenstein                              |
| CNY  | Chinese Yuan      | ¥      | China                                                   |
| INR  | Indian Rupee      | ₹      | India                                                   |

### **Additional Regional Currencies**

- **Asia**: SGD, HKD, KRW, THB, MYR, IDR, PHP
- **Europe**: SEK, NOK, DKK, PLN, CZK, HUF, RUB
- **Middle East**: AED, SAR, ILS, TRY
- **Americas**: BRL, MXN, CLP, COP, PEN, ARS

## How to Use

### **Currency Selection**

#### Desktop Users

1. Click the currency selector in the top navigation bar
2. Browse currencies by region or search by name/code
3. Select your preferred currency

#### Mobile Users

1. Open the mobile menu (hamburger icon)
2. Find the "Currency" section
3. Select your preferred currency

#### In Service Forms

1. When creating services, use the currency selector in the form header
2. Price input will update to show your selected currency symbol
3. Preview shows formatted price as you type

### **Automatic Currency Detection**

The system automatically detects your preferred currency based on:

- Browser language settings
- Country code from locale
- Priority for CEMAC region (FCFA)

### **Price Display**

All prices throughout the application will display in your selected currency:

- Service listings
- Appointment booking
- Provider dashboard
- Payment summaries

## Technical Implementation

### **Context API**

```javascript
// Access currency functions
const { selectedCurrency, formatPrice, changeCurrency } = useCurrency();
```

### **Price Formatting**

```javascript
// Format prices with proper currency symbols
const formattedPrice = formatPrice(1000, "XAF"); // "1 000 FCFA"
```

### **Currency Selection Component**

```javascript
// Include currency selector in any component
import CurrencySelector from "../Common/CurrencySelector.jsx";

// Add to your JSX
<CurrencySelector />;
```

## For Developers

### **Adding New Currencies**

To add a new currency, update the `CURRENCIES` array in `CurrencyContext.jsx`:

```javascript
{
  code: 'XXX',        // ISO 4217 code
  name: 'Currency Name',
  symbol: '₳',        // Currency symbol
  region: 'Region',
  countries: ['Country1', 'Country2']
}
```

### **Custom Currency Detection**

To modify automatic detection, update the `currencyMap` in `detectUserCurrency()` function.

### **Styling Currency Selector**

The currency selector uses Tailwind CSS and can be customized by modifying:

- Component styles in `CurrencySelector.jsx`
- Global styles in `index.css`

## User Benefits

### **For CEMAC Users**

- ✅ FCFA prominently featured at the top of currency list
- ✅ Automatic detection for Central African countries
- ✅ Proper formatting for Central African financial systems
- ✅ Support for both XAF and XOF CFA Francs

### **For International Users**

- ✅ 40+ currencies covering major global markets
- ✅ Regional grouping for easy navigation
- ✅ Search functionality to quickly find currencies
- ✅ Smart defaults based on user location

### **For Businesses**

- ✅ Easy currency switching for international clients
- ✅ Proper price formatting for each market
- ✅ Professional presentation with appropriate symbols
- ✅ Improved accessibility for global users

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Progressive Web App (PWA) support
- ✅ Offline currency preference storage

## Accessibility Features

- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ High contrast mode support
- ✅ Touch-friendly interface
- ✅ ARIA labels and descriptions

---

## Getting Started

1. **For Users**: Simply visit the application and your currency will be automatically detected
2. **For Providers**: Use the currency selector in service forms to set pricing in your preferred currency
3. **For Developers**: Import the CurrencyContext and use the provided hooks and components

The multi-currency system makes the appointment booking application truly global, with special attention to the unique needs of Central African users who require FCFA support.
