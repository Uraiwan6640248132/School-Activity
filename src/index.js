import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 1. บรรทัดนี้ต้องเพิ่มเข้ามาครับ!
import './styles/globals.css';                       // 2. ไฟล์สไตล์ Tailwind ของเรา
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* ตัวนี้แหละครับที่เคยมฟ้องว่าหาไม่เจอ */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();