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
                    50: "#fff0f3",
                    100: "#ffd6de",
                    200: "#ffb3c1",
                    300: "#ff8fa3",
                    400: "#e8628a",
                    500: "#d63d6e",
                    600: "#b52d5a",
                    700: "#8c2247",
                    800: "#5e1731",
                    900: "#350d1c",
                },
            },
            fontFamily: {
                sans: ["Cairo", "sans-serif"],
            },
        },
    },
    plugins: [],
};
