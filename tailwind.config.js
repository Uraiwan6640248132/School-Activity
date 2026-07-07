/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Kanit', 'Segoe UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
            colors: {
                // 🎨 กำหนดชื่อสีหลักของเว็บ (เช่นอยากได้โทนน้ำเงิน-ฟ้า)
                primary: {
                    light: '#eff8ff',
                    DEFAULT: '#0284c7',
                    dark: '#0369a1',
                }
            },
        },
    },
    plugins: [],
}
