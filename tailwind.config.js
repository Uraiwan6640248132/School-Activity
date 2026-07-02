/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // 🎨 กำหนดชื่อสีหลักของเว็บ (เช่นอยากได้โทนน้ำเงิน-ฟ้า)
                primary: {
                    light: '#eff6ff', // สีฟ้าพาสเทลอ่อนๆ (เดิมคือ bg-indigo-50 หรือ bg-blue-50)
                    DEFAULT: '#1654b7', // สีหลักของปุ่ม/ข้อความ (เดิมคือ text-indigo-600)
                    dark: '#091f5e',   // สีตอนเอาเมาส์ไปชี้ (Hover)
                }
            },
        },
    },
    plugins: [],
}