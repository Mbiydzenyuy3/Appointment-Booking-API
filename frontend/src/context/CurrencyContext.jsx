import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export const CURRENCIES = [
  {
    code: "XAF",
    name: "Central African CFA Franc",
    symbol: "FCFA",
    region: "Central Africa",
    countries: [
      "Cameroon",
      "Central African Republic",
      "Chad",
      "Republic of the Congo",
      "Equatorial Guinea",
      "Gabon"
    ]
  },

  // Other African Currencies
  {
    code: "XOF",
    name: "West African CFA Franc",
    symbol: "CFA",
    region: "West Africa",
    countries: [
      "Benin",
      "Burkina Faso",
      "Côte d'Ivoire",
      "Guinea-Bissau",
      "Mali",
      "Niger",
      "Senegal",
      "Togo"
    ]
  },
  {
    code: "MAD",
    name: "Moroccan Dirham",
    symbol: "MAD",
    region: "North Africa",
    countries: ["Morocco", "Western Sahara"]
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    region: "West Africa",
    countries: ["Nigeria"]
  },
  {
    code: "EGP",
    name: "Egyptian Pound",
    symbol: "E£",
    region: "North Africa",
    countries: ["Egypt"]
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    region: "Southern Africa",
    countries: ["South Africa", "Lesotho", "Namibia", "Eswatini"]
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    region: "East Africa",
    countries: ["Kenya"]
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "₵",
    region: "West Africa",
    countries: ["Ghana"]
  },

  // Major International Currencies
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    region: "International",
    countries: [
      "United States",
      "Ecuador",
      "El Salvador",
      "Panama",
      "East Timor"
    ]
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    region: "Europe",
    countries: ["Eurozone (19 countries)", "European Union"]
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    region: "Europe",
    countries: ["United Kingdom"]
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    region: "Asia",
    countries: ["Japan"]
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    region: "North America",
    countries: ["Canada"]
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    region: "Oceania",
    countries: ["Australia", "Kiribati", "Nauru", "Tuvalu"]
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "CHF",
    region: "Europe",
    countries: ["Switzerland", "Liechtenstein"]
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    region: "Asia",
    countries: ["China"]
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    region: "Asia",
    countries: ["India"]
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    region: "South America",
    countries: ["Brazil"]
  },
  {
    code: "MXN",
    name: "Mexican Peso",
    symbol: "$",
    region: "North America",
    countries: ["Mexico"]
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    region: "Asia",
    countries: ["Singapore"]
  },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    region: "Asia",
    countries: ["Hong Kong"]
  },
  {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "NZ$",
    region: "Oceania",
    countries: ["New Zealand"]
  },
  {
    code: "SEK",
    name: "Swedish Krona",
    symbol: "kr",
    region: "Europe",
    countries: ["Sweden"]
  },
  {
    code: "NOK",
    name: "Norwegian Krone",
    symbol: "kr",
    region: "Europe",
    countries: ["Norway"]
  },
  {
    code: "DKK",
    name: "Danish Krone",
    symbol: "kr",
    region: "Europe",
    countries: ["Denmark"]
  },
  {
    code: "PLN",
    name: "Polish Złoty",
    symbol: "zł",
    region: "Europe",
    countries: ["Poland"]
  },
  {
    code: "CZK",
    name: "Czech Koruna",
    symbol: "Kč",
    region: "Europe",
    countries: ["Czech Republic"]
  },
  {
    code: "HUF",
    name: "Hungarian Forint",
    symbol: "Ft",
    region: "Europe",
    countries: ["Hungary"]
  },
  {
    code: "RUB",
    name: "Russian Ruble",
    symbol: "₽",
    region: "Europe/Asia",
    countries: ["Russia"]
  },
  {
    code: "KRW",
    name: "South Korean Won",
    symbol: "₩",
    region: "Asia",
    countries: ["South Korea"]
  },
  {
    code: "THB",
    name: "Thai Baht",
    symbol: "฿",
    region: "Asia",
    countries: ["Thailand"]
  },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    region: "Asia",
    countries: ["Malaysia"]
  },
  {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    region: "Asia",
    countries: ["Indonesia"]
  },
  {
    code: "PHP",
    name: "Philippine Peso",
    symbol: "₱",
    region: "Asia",
    countries: ["Philippines"]
  },
  {
    code: "AED",
    name: "UAE Dirham",
    symbol: "د.إ",
    region: "Middle East",
    countries: ["United Arab Emirates"]
  },
  {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "﷼",
    region: "Middle East",
    countries: ["Saudi Arabia"]
  },
  {
    code: "ILS",
    name: "Israeli Shekel",
    symbol: "₪",
    region: "Middle East",
    countries: ["Israel"]
  },
  {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
    region: "Europe/Asia",
    countries: ["Turkey"]
  },
  {
    code: "CLP",
    name: "Chilean Peso",
    symbol: "$",
    region: "South America",
    countries: ["Chile"]
  },
  {
    code: "COP",
    name: "Colombian Peso",
    symbol: "$",
    region: "South America",
    countries: ["Colombia"]
  },
  {
    code: "PEN",
    name: "Peruvian Sol",
    symbol: "S/",
    region: "South America",
    countries: ["Peru"]
  },
  {
    code: "ARS",
    name: "Argentine Peso",
    symbol: "$",
    region: "South America",
    countries: ["Argentina"]
  }
];

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD"); // Default to USD
  const [userCurrency, setUserCurrency] = useState(null);

  // Auto-detect user's currency based on location
  useEffect(() => {
    const detectUserCurrency = () => {
      // Try to detect from browser language/region
      const language = navigator.language || navigator.userLanguage;

      // Common currency mappings based on country codes
      const currencyMap = {
        // Central Africa (CEMAC)
        CM: "XAF", // Cameroon
        CF: "XAF", // Central African Republic
        TD: "XAF", // Chad
        CG: "XAF", // Republic of Congo
        GQ: "XAF", // Equatorial Guinea
        GA: "XAF", // Gabon

        // West Africa
        BF: "XOF", // Burkina Faso
        CI: "XOF", // Côte d'Ivoire
        GW: "XOF", // Guinea-Bissau
        ML: "XOF", // Mali
        NE: "XOF", // Niger
        SN: "XOF", // Senegal
        TG: "XOF", // Togo
        BJ: "XOF", // Benin
        MA: "MAD", // Morocco
        NG: "NGN", // Nigeria
        EG: "EGP", // Egypt
        ZA: "ZAR", // South Africa
        KE: "KES", // Kenya
        GH: "GHS", // Ghana

        // Major international
        US: "USD",
        GB: "GBP",
        DE: "EUR",
        FR: "EUR",
        IT: "EUR",
        ES: "EUR",
        JP: "JPY",
        CA: "CAD",
        AU: "AUD",
        CN: "CNY",
        IN: "INR",
        BR: "BRL",
        MX: "MXN",
        SG: "SGD",
        HK: "HKD",
        NZ: "NZD",
        SE: "SEK",
        NO: "NOK",
        DK: "DKK",
        CH: "CHF",
        PL: "PLN",
        CZ: "CZK",
        HU: "HUF",
        RU: "RUB",
        KR: "KRW",
        TH: "THB",
        MY: "MYR",
        ID: "IDR",
        PH: "PHP",
        AE: "AED",
        SA: "SAR",
        IL: "ILS",
        TR: "TRY",
        CL: "CLP",
        CO: "COP",
        PE: "PEN",
        AR: "ARS"
      };

      // Extract country code from locale
      const countryCode = language.split("-")[1] || language.split("_")[1];

      if (countryCode && currencyMap[countryCode]) {
        setUserCurrency(currencyMap[countryCode]);
        return currencyMap[countryCode];
      }

      // Default to USD if no match found
      return "USD";
    };

    const detectedCurrency = detectUserCurrency();
    // Only auto-set if user hasn't manually selected a currency
    if (!localStorage.getItem("selectedCurrency")) {
      setSelectedCurrency(detectedCurrency);
    }
  }, []);

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    if (savedCurrency && CURRENCIES.find((c) => c.code === savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  const changeCurrency = (currencyCode) => {
    if (CURRENCIES.find((c) => c.code === currencyCode)) {
      setSelectedCurrency(currencyCode);
      localStorage.setItem("selectedCurrency", currencyCode);
    }
  };

  const formatPrice = (amount, currencyCode = selectedCurrency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode === "XAF" ? "XAF" : currencyCode,
      minimumFractionDigits: currencyCode === "JPY" ? 0 : 2,
      maximumFractionDigits: currencyCode === "JPY" ? 0 : 2
    }).format(amount);
  };

  const getCurrencySymbol = (currencyCode = selectedCurrency) => {
    const currency = CURRENCIES.find((c) => c.code === currencyCode);
    return currency ? currency.symbol : "$";
  };

  const value = {
    selectedCurrency,
    userCurrency,
    currencies: CURRENCIES,
    changeCurrency,
    formatPrice,
    getCurrencySymbol
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
