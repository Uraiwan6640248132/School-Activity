/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // กำหนดชื่อสีและรหัสสีโค้ดเนมของเว็บเราที่นี่
                brand: {
                    primary: '#4F46E5',   // สีหลัก (เช่น เงิน, น้ำเงินอินดิโก้)
                    secondary: '#818CF8', // สีรอง
                    dark: '#1E1B4B',      // สีเข้มสำหรับตัวอักษรหรือพื้นหลัง
                    light: '#F5F3FF',     // สีสว่างสำหรับพื้นหลังย่อย
                }
            },
        },
    },
    plugins: [],
}