import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // AFARI brand palette — calm in the middle of chaos
        navy: {
          50: "#F2F5FA",
          100: "#DDE4F0",
          200: "#B6C4DC",
          300: "#8FA3C8",
          400: "#5C77A8",
          500: "#2E4F84",
          600: "#1B3461",
          700: "#122648",
          800: "#0B1F3A",
          900: "#06132A",
        },
        terracotta: {
          50: "#FBF1ED",
          100: "#F6DCD0",
          200: "#EEB59E",
          300: "#E58E6D",
          400: "#D97449",
          500: "#C0592E",
          600: "#9C4322",
          700: "#73311A",
          800: "#4D2113",
          900: "#2A130B",
        },
        sand: {
          50: "#FAFAF7",
          100: "#F4F2EA",
          200: "#E8E3D2",
          300: "#D7CFB6",
          400: "#B8AC8B",
          500: "#998966",
        },
        emerald: {
          DEFAULT: "#10B981",
          soft: "#D1FAE5",
        },
        amber: {
          DEFAULT: "#F59E0B",
          soft: "#FEF3C7",
        },
        ruby: {
          DEFAULT: "#DC2626",
          soft: "#FEE2E2",
        },
        ink: "#0B1F3A",
        paper: "#FAFAF7",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-1": ["clamp(3rem, 7vw, 5.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-2": ["clamp(2.25rem, 5vw, 3.75rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-3": ["clamp(1.75rem, 3.5vw, 2.5rem)", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,31,58,0.04), 0 4px 16px rgba(11,31,58,0.06)",
        lift: "0 4px 8px rgba(11,31,58,0.06), 0 16px 32px rgba(11,31,58,0.08)",
        focus: "0 0 0 4px rgba(217,116,73,0.20)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
