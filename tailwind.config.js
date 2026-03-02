/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                rose: {
                    50: "#fff5f5",
                    100: "#ffe0e0",
                    200: "#ffc2c2",
                    300: "#ff9999",
                    400: "#ff6b6b",
                    500: "#ff4444",
                    600: "#e63939",
                    700: "#cc2e2e",
                    800: "#992222",
                    900: "#661717",
                },
                cafe: {
                    50: "#FFF8F4",
                    100: "#FCEEE8",
                    200: "#F5D5C4",
                    300: "#E8B4A0",
                    400: "#D4956F",
                    500: "#C4886D",
                    600: "#A66B4F",
                    700: "#8B5A42",
                    800: "#5A3D2E",
                    900: "#3D2214",
                },
                gold: {
                    50: "#FFF9EB",
                    100: "#FFF0CC",
                    200: "#FFE199",
                    300: "#FFD166",
                    400: "#F0B842",
                    500: "#D4A76A",
                    600: "#B8860B",
                    700: "#8B6914",
                    800: "#5E4709",
                    900: "#302504",
                },
            },
            fontFamily: {
                sans: ["Cairo", "sans-serif"],
                display: ["Playfair Display", "serif"],
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "scale-in": {
                    "0%": { opacity: "0", transform: "scale(0.92)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.4s ease-out",
                "scale-in": "scale-in 0.3s cubic-bezier(0.16,1,0.3,1)",
            },
            boxShadow: {
                "warm-sm": "0 2px 12px rgba(196, 136, 109, 0.08)",
                "warm": "0 8px 32px rgba(196, 136, 109, 0.12)",
                "warm-lg": "0 16px 48px rgba(196, 136, 109, 0.16)",
                "inner-warm": "inset 0 2px 8px rgba(196, 136, 109, 0.06)",
            },
        },
    },
    plugins: [],
};
