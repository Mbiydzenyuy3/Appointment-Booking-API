/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Mobile-first responsive breakpoints
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        // Custom breakpoints for better mobile experience
        mobile: { max: "767px" },
        tablet: { min: "768px", max: "1023px" },
        desktop: { min: "1024px" }
      },
      colors: {
        // Primary Dark Green Brand Palette
        primary: {
          50: "#f0f9f0",
          100: "#dcf2dc",
          200: "#bce5bc",
          300: "#8dd28d",
          400: "#5bb65b",
          500: "#369936",
          600: "#2a7d2a",
          700: "#236223",
          800: "#1f4f1f",
          900: "#1b421b",
          950: "#0c240c"
        },
        // Secondary Accent Colors
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a"
        },
        // Success/Positive Actions
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d"
        },
        // Warning/Caution Actions
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f"
        },
        // Error/Destructive Actions
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d"
        },
        // Accessible text colors
        text: {
          primary: "#1b421b",
          secondary: "#475569",
          muted: "#64748b",
          inverse: "#ffffff"
        },
        // Background colors
        background: {
          primary: "#ffffff",
          secondary: "#f8fafc",
          muted: "#f1f5f9"
        },
        // Border colors
        border: {
          light: "#e2e8f0",
          default: "#cbd5e1",
          dark: "#94a3b8"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }]
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        // Mobile-optimized spacing
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem"
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium:
          "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)",
        strong:
          "0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        // Mobile-optimized shadows
        touch: "0 2px 8px rgba(0, 0, 0, 0.12)"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-soft": "bounceSoft 0.6s ease-in-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        bounceSoft: {
          "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
          "40%, 43%": { transform: "translate3d(0, -8px, 0)" },
          "70%": { transform: "translate3d(0, -4px, 0)" },
          "90%": { transform: "translate3d(0, -2px, 0)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".8" }
        }
      },
      // Mobile-specific utilities
      minHeight: {
        touch: "44px", // Minimum touch target size (iOS guidelines)
        "screen-safe": "100vh"
      },
      minWidth: {
        touch: "44px" // Minimum touch target size
      },
      // Safe area support for notched devices
      padding: {
        safe: "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)"
      },
      margin: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)"
      }
    }
  },
  plugins: [
    // Add accessibility and mobile utilities
    function ({ addUtilities, addComponents }) {
      const newUtilities = {
        ".focus-ring": {
          "&:focus": {
            outline: "2px solid #369936",
            outlineOffset: "2px"
          }
        },
        ".focus-ring-mobile": {
          "&:focus": {
            outline: "2px solid #369936",
            outlineOffset: "2px",
            // Larger touch target for mobile
            transform: "scale(1.02)"
          }
        },
        ".touch-target": {
          "min-height": "44px",
          "min-width": "44px"
        },
        ".safe-area-top": {
          "padding-top": "env(safe-area-inset-top)"
        },
        ".safe-area-bottom": {
          "padding-bottom": "env(safe-area-inset-bottom)"
        },
        ".sr-only": {
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: "0"
        },
        // Touch-friendly button styles
        ".btn-touch": {
          "min-height": "44px",
          "min-width": "44px",
          padding: "12px 16px",
          "touch-action": "manipulation"
        },
        // Mobile-optimized input styles
        ".input-mobile": {
          "font-size": "16px", // Prevents zoom on iOS
          padding: "12px 16px",
          "min-height": "44px"
        }
      };

      const newComponents = {
        ".btn": {
          display: "inline-flex",
          "align-items": "center",
          "justify-content": "center",
          "border-radius": "0.5rem",
          "font-weight": "500",
          transition: "all 0.2s",
          "touch-action": "manipulation",
          "&:disabled": {
            opacity: "0.6",
            cursor: "not-allowed"
          }
        },
        ".btn-primary": {
          "background-color": "#369936",
          color: "white",
          "&:hover:not(:disabled)": {
            "background-color": "#2a7d2a"
          },
          "&:focus": {
            outline: "2px solid #369936",
            "outline-offset": "2px"
          }
        },
        ".btn-secondary": {
          "background-color": "#f1f5f9",
          color: "#475569",
          "&:hover:not(:disabled)": {
            "background-color": "#e2e8f0"
          },
          "&:focus": {
            outline: "2px solid #369936",
            "outline-offset": "2px"
          }
        }
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    }
  ]
};
