import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// Import ตราสัญลักษณ์โรงเรียนเข้ามาจากโฟลเดอร์ src หลัก
import logoSchool from "../logo_school.png";

function Navbar({ children }) {
  const location = useLocation();
  // 🌟 เพิ่ม State สำหรับเก็บชื่อผู้ใช้งานที่ดึงมาจากระบบ
  const [userName, setUserName] = useState("ผู้ใช้งานระบบ");

  useEffect(() => {
    // 🌟 ดึงข้อมูล user จาก localStorage ตอนเริ่มต้นโหลดคอมโพเนนต์
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);

        // 1. ดึงค่าชื่อ (เช็คเผื่อไว้ทั้งตัวพิมพ์ใหญ่/พิมพ์เล็ก)
        const firstname = userObj.Firstname || userObj.firstname || userObj.Name || userObj.name || "";

        // 2. ดึงค่านามสกุล (เช็คเผื่อไว้ทั้งตัวพิมพ์ใหญ่/พิมพ์เล็ก)
        const lastname = userObj.Lastname || userObj.lastname || userObj.Surname || userObj.surname || "";

        // 3. นำชื่อและนามสกุลมาต่อกัน ถ้ามีข้อมูลครบถ้วน
        if (firstname || lastname) {
          setUserName(`${firstname} ${lastname}`.trim());
        } else {
          setUserName("ผู้ใช้งานระบบ");
        }
      } catch (e) {
        console.error("เกิดข้อผิดพลาดในการอ่านข้อมูลผู้ใช้งาน:", e);
      }
    }
  }, []);

  // 🚪 ฟังก์ชันเมื่อกดปุ่มออกจากระบบ
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user"); // ลบความจำการล็อกอินออกทั้งหมด
      window.location.href = "/login"; // ดีดตัวกลับไปหน้าล็อกอินด้านนอกสุด
    }
  };

  // 🌟 ฟังก์ชันเช็คสีเมนูแบบ Active ปรับเป็นสีฟ้านุ่มละมุนตามไอเดียต้นแบบรูปตัวอย่าง
  const getMenuClass = (path) => {
    const baseClass = "flex items-center gap-3 px-5 py-3 mx-3 rounded-xl font-medium text-sm transition-all duration-200 no-underline";
    return location.pathname === path
      ? `${baseClass} bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100` // หน้าปัจจุบัน
      : `${baseClass} text-slate-500 hover:bg-slate-50 hover:text-slate-800`;  // หน้าปกติเวลา Hover
  };

  return (
    // 1. พื้นหลังรอบนอกปรับเป็นสีเทาอมฟ้าสว่าง (Slate-100/70) เพื่อขับให้ชิ้นงานลอยขึ้นมาเด่นชัดแบบ Dashboard สากล
    <div className="flex min-h-screen bg-sky-100 font-sans antialiased text-slate-800">

      {/* 🧭 SIDEBAR: เปลี่ยนเป็นสีขาว คลีนตา มีขอบมนและเงา Soft Shadow แบบในรูปตัวอย่าง */}
      <aside className="w-64 bg-white flex flex-col border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.015)] shrink-0">

        {/* โลโก้โรงเรียน จัดวางกึ่งกลาง มีระยะเว้นกระชับพอดี */}
        <div className="p-6 flex justify-center items-center border-b border-slate-100 mb-4">
          <img
            src={logoSchool}
            alt="ตราสัญลักษณ์โรงเรียน"
            className="w-[110px] h-auto object-contain"
          />
        </div>

        {/* รายการเมนูลิงก์ภายในแอป */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <Link to="/home" className={getMenuClass("/home")}>
            <span className="text-base">📊</span> หน้าหลัก
          </Link>
          <Link to="/personal" className={getMenuClass("/personal")}>
            <span className="text-base">👤</span> ข้อมูลส่วนตัว
          </Link>
          <Link to="/students" className={getMenuClass("/students")}>
            <span className="text-base">🧑‍🎓</span> ข้อมูลนักเรียน
          </Link>
          <Link to="/activity" className={getMenuClass("/activity")}>
            <span className="text-base">📅</span> กิจกรรม
          </Link>
          <Link to="/publicrelations" className={getMenuClass("/publicrelations")}>
            <span className="text-base">📢</span> ประชาสัมพันธ์
          </Link>
          <Link to="/notification" className={getMenuClass("/notification")}>
            <span className="text-base">📝</span> แจ้งเตือนการบ้าน
          </Link>
          <Link to="/event" className={getMenuClass("/event")}>
            <span className="text-base">🗓️</span> ปฏิทินกิจกรรม
          </Link>
          <Link to="/participating" className={getMenuClass("/participating")}>
            <span className="text-base">🤝</span> เข้าร่วมกิจกรรม
          </Link>
          <Link to="/development" className={getMenuClass("/development")}>
            <span className="text-base">📈</span> พัฒนาการนักเรียน
          </Link>
        </nav>

        {/* 🚪 ปุ่มออกจากระบบ: จัดไว้ที่ด้านล่างสุด แยกสัดส่วนด้วยเส้นบางๆ */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left bg-transparent border-none cursor-pointer"
          >
            <span>🚪</span> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* 🖥️ CONTENT AREA: ฝั่งขวาซึ่งเป็นหน้าจอหลัก */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* 🔝 TOP NAVBAR: เปลี่ยนจากสีฟ้าทึบเดิม เป็นสีขาวโปร่งแสง Backdrop blur ซ่อนเนียนตาไปกับ Dashboard */}
        <header className="h-16 bg-white/60 backdrop-blur-md border-b border-slate-200/40 px-8 flex justify-between items-center sticky top-0 z-10">

          {/* ส่วนแสดงความต้อนรับด้านซ้าย (ดัดแปลงเพิ่มตามสไตล์รูปตัวอย่าง) */}
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400 font-medium">ยินดีต้อนรับกลับสู่ระบบ</p>
          </div>

          {/* ปุ่มโปรไฟล์ผู้ใช้งานด้านขวา */}
          <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border border-slate-200/80 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600">🔔 {userName}</span>
          </div>
        </header>

        {/* ส่วนแสดงคอมโพเนนต์ย่อยด้านใน (หน้า Dashboard หรือหน้าอื่นๆ) */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Navbar;