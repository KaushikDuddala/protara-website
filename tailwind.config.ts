import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        void: "rgb(31, 31, 44)",
        obsidian: "#222231",
        "slate-dark": "rgb(30, 30, 42)",
        molten: "#FF4500",
        "molten-ember": "#FF6B2C",
        resonance: "#0052FF",
        steel: "#8a8a9a",
        chrome: "#c8c8d4",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FF4500",
          foreground: "#f0f0f5",
        },
        secondary: {
          DEFAULT: "#0a0a0f",
          foreground: "#c8c8d4",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "#f0f0f5",
        },
        muted: {
          DEFAULT: "#0a0a0f",
          foreground: "#8a8a9a",
        },
        accent: {
          DEFAULT: "#0a0a0f",
          foreground: "#f0f0f5",
        },
        popover: {
          DEFAULT: "#0a0a0f",
          foreground: "#f0f0f5",
        },
        card: {
          DEFAULT: "#0a0a0f",
          foreground: "#f0f0f5",
        },
        orange: {
          400: "#FF6B2C",
          500: "#FF4500",
          600: "#CC3700",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "resonant-pulse": {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "50%": { opacity: "0.3" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "laser-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(255, 69, 0, 0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(255, 69, 0, 0.4), 0 0 50px rgba(255, 69, 0, 0.1)" },
        },
        "particle-drift": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "100% 100%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "resonant-pulse": "resonant-pulse 1.5s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        "laser-glow": "laser-glow 2s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        glass: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        "slicer-grid": "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
