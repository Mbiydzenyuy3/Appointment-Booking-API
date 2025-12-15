# BOOKEasy Brand Guide

## Dark Green Design System

### Brand Identity

**BOOKEasy** - The Universal Accessible Appointment Booking Platform

---

## 🎨 Color Palette

### Primary Brand Colors - Dark Green

Our primary color palette uses a sophisticated dark green theme that conveys trust, growth, and accessibility.

| Color           | Hex Code      | Usage                                   |
| --------------- | ------------- | --------------------------------------- |
| Primary 50      | `#f0f9f0`     | Lightest backgrounds, subtle highlights |
| Primary 100     | `#dcf2dc`     | Very light backgrounds, hover states    |
| Primary 200     | `#bce5bc`     | Light backgrounds, disabled states      |
| Primary 300     | `#8dd28d`     | Light borders, subtle accents           |
| Primary 400     | `#5bb65b`     | Medium borders, secondary actions       |
| **Primary 500** | **`#369936`** | **Primary brand color, main CTAs**      |
| **Primary 600** | **`#2a7d2a`** | **Primary hover, active states**        |
| Primary 700     | `#236223`     | Dark text on light backgrounds          |
| Primary 800     | `#1f4f1f`     | Dark backgrounds, headers               |
| Primary 900     | `#1b421b`     | Darkest text, footer backgrounds        |
| Primary 950     | `#0c240c`     | Ultra-dark, special backgrounds         |

### Supporting Colors

#### Success/Positive Actions

- **Success 500**: `#22c55e` - Success messages, positive confirmations
- **Success 600**: `#16a34a` - Success hover states

#### Warning/Caution

- **Warning 500**: `#f59e0b` - Warning messages, caution actions
- **Warning 600**: `#d97706` - Warning hover states

#### Error/Destructive

- **Error 500**: `#ef4444` - Error messages, destructive actions
- **Error 600**: `#dc2626` - Error hover states

#### Neutral/Text Colors

- **Text Primary**: `#1b421b` - Main text content
- **Text Secondary**: `#475569` - Secondary text, descriptions
- **Text Muted**: `#64748b` - Placeholder text, subtle information
- **Text Inverse**: `#ffffff` - Text on dark backgrounds

#### Background Colors

- **Background Primary**: `#ffffff` - Main background
- **Background Secondary**: `#f8fafc` - Card backgrounds, sections
- **Background Muted**: `#f1f5f9` - Subtle backgrounds, dividers

#### Border Colors

- **Border Light**: `#e2e8f0` - Subtle borders
- **Border Default**: `#cbd5e1` - Standard form borders
- **Border Dark**: `#94a3b8` - Strong borders, dividers

---

## 🔤 Typography

### Font Families

- **Primary**: Inter (system-ui, sans-serif)
- **Display**: Poppins (Inter, system-ui, sans-serif)

### Font Sizes

- **xs**: 0.75rem (12px) - Captions, small labels
- **sm**: 0.875rem (14px) - Small text, metadata
- **base**: 1rem (16px) - Body text, standard content
- **lg**: 1.125rem (18px) - Large body text
- **xl**: 1.25rem (20px) - Small headings
- **2xl**: 1.5rem (24px) - Section headings
- **3xl**: 1.875rem (30px) - Page headings
- **4xl**: 2.25rem (36px) - Hero headings
- **5xl**: 3rem (48px) - Display headings
- **6xl**: 3.75rem (60px) - Large display text

---

## 🎯 Component Guidelines

### Button Styles

#### Primary Button

```css
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus-ring;
}
```

- **Background**: Primary 600
- **Hover**: Primary 700
- **Usage**: Main actions, CTAs, form submissions

#### Secondary Button

```css
.btn-secondary {
  @apply bg-secondary-100 hover:bg-secondary-200 text-primary-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus-ring;
}
```

- **Background**: Secondary 100
- **Hover**: Secondary 200
- **Text**: Primary 700
- **Usage**: Secondary actions, alternatives to primary

#### Outline Button

```css
.btn-outline {
  @apply border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 focus-ring;
}
```

- **Border**: Primary 600
- **Text**: Primary 600
- **Hover**: Background Primary 600, Text White
- **Usage**: Subtle actions, cancellations

### Form Elements

#### Input Fields

```css
.input-field {
  @apply w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200;
}
```

- **Border**: Border Default
- **Focus Ring**: Primary 500
- **Focus Border**: Primary 500

---

## 📱 Accessibility Standards

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:

- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum
- **UI components**: 3:1 contrast ratio minimum

### Focus Indicators

```css
.focus-ring:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
  border-radius: 0.25rem;
}
```

### High Contrast Support

The design system includes support for high contrast mode preferences:

```css
@media (prefers-contrast: high) {
  :root {
    --primary-500: #0f5a0f;
    --text-primary: #000000;
    --bg-primary: #ffffff;
  }
}
```

---

## 🚀 Implementation

### CSS Custom Properties

All colors are defined as CSS custom properties for easy theming:

```css
:root {
  --primary-500: #369936;
  --primary-600: #2a7d2a;
  --text-primary: #1b421b;
  --bg-primary: #ffffff;
  /* ... all other colors */
}
```

### Tailwind Configuration

Custom colors are configured in `tailwind.config.js` and can be used with:

- `text-primary-600`
- `bg-primary-500`
- `border-primary-300`
- `hover:bg-primary-700`

### Utility Classes

Pre-built component classes for consistent styling:

- `.btn-primary`
- `.btn-secondary`
- `.btn-outline`
- `.input-field`
- `.booking-card`
- `.feature-card`

---

## 🎨 Design Principles

### 1. Accessibility First

- All interactions work with keyboard navigation
- Screen reader compatible with proper ARIA labels
- Color blind friendly with multiple visual cues
- Touch targets minimum 44px for mobile accessibility

### 2. Consistent Spacing

- 4px base unit system (4, 8, 12, 16, 24, 32px)
- Consistent border radius (4px, 8px, 12px, 16px)
- Uniform padding and margins

### 3. Clear Visual Hierarchy

- Primary actions use primary brand color
- Secondary actions use secondary colors
- Proper contrast ratios for readability
- Consistent typography scales

### 4. Responsive Design

- Mobile-first approach
- Flexible grid system
- Scalable typography
- Touch-friendly interfaces

---

## 📋 Usage Guidelines

### DO ✅

- Use primary colors for main actions and brand elements
- Maintain proper contrast ratios for accessibility
- Use consistent spacing and typography scales
- Test with keyboard navigation and screen readers
- Use semantic HTML elements

### DON'T ❌

- Use blue colors (old brand - now replaced with dark green)
- Create custom colors without following the palette
- Ignore accessibility standards
- Use inconsistent spacing or typography
- Forget to test with assistive technologies

---

## 🔧 Technical Implementation

### Files Modified

1. **`tailwind.config.js`** - Custom color palette configuration
2. **`src/index.css`** - CSS custom properties and component styles
3. **Component files** - Updated all color references to dark green
4. **`BRAND-GUIDE.md`** - This documentation

### Color Migration

- **From**: Blue color scheme (`blue-600`, `blue-700`, etc.)
- **To**: Dark green color scheme (`primary-600`, `primary-700`, etc.)
- **Maintained**: All accessibility and contrast standards

### Testing Required

- Visual regression testing across all components
- Accessibility testing with screen readers
- Keyboard navigation testing
- Color contrast validation
- Cross-browser compatibility testing

---

## 📞 Support

For questions about the brand guidelines or implementation:

1. Refer to this brand guide documentation
2. Check the Tailwind configuration for color references
3. Test accessibility with browser dev tools
4. Validate contrast ratios with online tools

---

**Last Updated**: December 15, 2025
**Version**: 1.0 - Dark Green Redesign
