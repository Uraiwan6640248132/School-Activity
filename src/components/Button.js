import React from 'react';

function Button({ children, onClick, variant = 'primary' }) {
    // สไตล์พื้นฐานของปุ่ม เช่น ความโค้งมน (rounded) ช่องไฟ (px, py) การเปลี่ยนสี (transition)
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm";

    // สไตล์แยกตามประเภท โดยดึงสีที่เราเซ็ตไว้ใน tailwind.config.js มาใช้
    const styles = variant === 'primary'
        ? "bg-brand-primary text-white hover:bg-brand-secondary shadow-md"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300";

    return (
        <button onClick={onClick} className={`${baseStyle} ${styles}`}>
            {children}
        </button>
    );
}

export default Button;