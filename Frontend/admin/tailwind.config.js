/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#020817",
          900: "#072047",
          800: "#0B1F3B",
          700: "#102B4A",
        },
        gold: {
          400: "#d4a557",
          500: "#C6A64A",
          600: "#b8943d",
        },
        luxe: {
          gray: "#e8e8e8",
          "gray-100": "#f5f5f5",
          "gray-200": "#eeeeee",
          "gray-300": "#e0e0e0",
          "gray-400": "#bdbdbd",
          "gray-500": "#9e9e9e",
          "gray-600": "#757575",
          "gray-dark": "#a0a0a0",
        },
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        "luxury-gradient": "linear-gradient(135deg, #020817 0%, #072047 52%, #0B1F3B 100%)",
        "gold-gradient": "linear-gradient(135deg, #d4a557 0%, #C6A64A 100%)",
      },
      boxShadow: {
        "luxury": "0 20px 60px rgba(198, 166, 74, 0.15)",
        "luxury-lg": "0 30px 80px rgba(198, 166, 74, 0.2)",
        "glass": "0 8px 32px rgba(198, 166, 74, 0.1)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
        "scale-in": "scaleIn 0.5s ease-out",
        "glow": "glow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        scaleIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(198, 166, 74, 0.5)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(198, 166, 74, 0.8)",
          },
        },
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
};
