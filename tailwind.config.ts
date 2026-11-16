import type { Config } from "tailwindcss";

/**
 * BudgetKu — konfigurasi Tailwind.
 * Nilai warna/tipografi/spasi dibaca dari CSS variabel di docs/tokens.css
 * (impor tokens.css sebelum globals Tailwind).
 * Rujukan: docs/design-system.md §2 (token) dan §9 (layout/breakpoint).
 */
const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
          sunken: "var(--surface-sunken)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          DEFAULT: "var(--action-primary)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          900: "var(--color-primary-900)",
        },
        income: {
          surface: "var(--amount-income-surface)",
          DEFAULT: "var(--amount-income)",
          solid: "var(--color-income-600)",
        },
        expense: {
          surface: "var(--amount-expense-surface)",
          DEFAULT: "var(--amount-expense)",
          solid: "var(--color-expense-600)",
        },
        warning: {
          surface: "var(--color-warning-100)",
          DEFAULT: "var(--color-warning-900)",
          solid: "var(--color-warning-600)",
        },
        danger: {
          surface: "var(--color-danger-100)",
          DEFAULT: "var(--color-danger-900)",
          solid: "var(--color-danger-600)",
        },
        success: {
          surface: "var(--color-success-100)",
          DEFAULT: "var(--color-success-900)",
          solid: "var(--color-success-600)",
        },
        focus: "var(--focus-ring)",
        cat: {
          1: "var(--cat-1)",
          2: "var(--cat-2)",
          3: "var(--cat-3)",
          4: "var(--cat-4)",
          5: "var(--cat-5)",
          6: "var(--cat-6)",
          7: "var(--cat-7)",
          8: "var(--cat-8)",
          9: "var(--cat-9)",
          10: "var(--cat-10)",
          11: "var(--cat-11)",
          12: "var(--cat-12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        display: ["var(--text-display-size)", { lineHeight: "var(--text-display-line)", fontWeight: "700", letterSpacing: "-0.02em" }],
        h1: ["var(--text-h1-size)", { lineHeight: "var(--text-h1-line)", fontWeight: "600", letterSpacing: "-0.01em" }],
        h2: ["var(--text-h2-size)", { lineHeight: "var(--text-h2-line)", fontWeight: "600" }],
        h3: ["var(--text-h3-size)", { lineHeight: "var(--text-h3-line)", fontWeight: "600" }],
        body: ["var(--text-body-size)", { lineHeight: "var(--text-body-line)" }],
        small: ["var(--text-small-size)", { lineHeight: "var(--text-small-line)" }],
        caption: ["var(--text-caption-size)", { lineHeight: "var(--text-caption-line)" }],
        amount: ["var(--text-amount-size)", { lineHeight: "var(--text-amount-line)", fontWeight: "700", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }],
      },
      fontWeight: {
        regular: "var(--font-regular)",
        medium: "var(--font-medium)",
        semibold: "var(--font-semibold)",
        bold: "var(--font-bold)",
      },
      spacing: {
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        touch: "var(--touch-min)",
        control: "var(--control-h)",
        "control-lg": "var(--control-h-lg)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
        sheet: "var(--shadow-sheet)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        exit: "var(--ease-exit)",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      maxWidth: {
        page: "640px",
        app: "1200px",
      },
      minHeight: {
        touch: "var(--touch-min)",
      },
      keyframes: {
        "sheet-in": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "sheet-out": { from: { transform: "translateY(0)" }, to: { transform: "translateY(100%)" } },
        "skeleton-pulse": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.55" } },
        "toast-in": { from: { transform: "translateY(8px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
      },
      animation: {
        "sheet-in": "sheet-in var(--duration-slow) var(--ease-standard)",
        "sheet-out": "sheet-out var(--duration-base) var(--ease-exit)",
        skeleton: "skeleton-pulse 1.4s var(--ease-standard) infinite",
        "toast-in": "toast-in var(--duration-base) var(--ease-standard)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
