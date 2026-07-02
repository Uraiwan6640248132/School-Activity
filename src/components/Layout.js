import React from 'react';
// สมมติว่ามี Navbar อยู่ในโฟลเดอร์ navbar
import Navbar from '../navbar/Navbar'; 

function Layout({ children }) {
  return (
    // bg-brand-light จะทำให้พื้นหลังทุกหน้าเป็นสีโทนเดียวกันสม่ำเสมอ
    <div className="min-h-screen flex flex-col bg-brand-light text-brand-dark">
      <Navbar />
      
      {/* ส่วนเนื้อหาหลัก ควบคุมความกว้างให้เท่ากันทุกหน้าด้วย container mx-auto */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;