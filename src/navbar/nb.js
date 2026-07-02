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

  const menu = (path) => ({
    ...styles.menu,
    // 🌟 เปลี่ยนสีเมนูไฮไลต์แบบนุ่มละมุนเมื่อคลิกเลือกหน้านั้นๆ เหมือนหน้าผู้ปกครอง
    backgroundColor: location.pathname === path ? "#f0f2ff" : "transparent",
    color: location.pathname === path ? "#4f46e5" : "#64748b",
    fontWeight: location.pathname === path ? "600" : "500",
    boxShadow: location.pathname === path ? "0 1px 3px 0 rgba(79, 70, 229, 0.1)" : "none",
  });

  return (
    <div style={styles.layout}>

      {/* 🧭 SIDEBAR: ล็อคให้อยู่กับที่ ไม่ขยับตามการ Scroll เป็นธีมขาวคลีนเรียบร้อย */}
      <div style={styles.sidebar}>

        {/* โลโก้โรงเรียน จัดวางสวยงาม */}
        <div style={styles.logoSection}>
          <img
            src={logoSchool}
            alt="ตราสัญลักษณ์โรงเรียน"
            style={styles.logoImage}
          />
        </div>

        {/* รายการเมนูลิงก์ภายในแอป */}
        <div style={styles.menuList}>
          <Link to="/home" style={menu("/home")}>📊 หน้าหลัก</Link>
          <Link to="/personal" style={menu("/personal")}>👤 ข้อมูลส่วนตัว</Link>
          <Link to="/students" style={menu("/students")}>🧑‍🎓 ข้อมูลนักเรียน</Link>
          <Link to="/activity" style={menu("/activity")}>📅 กิจกรรม</Link>
          <Link to="/publicrelations" style={menu("/publicrelations")}>📢 ประชาสัมพันธ์</Link>
          <Link to="/notification" style={menu("/notification")}>📝 แจ้งเตือนการบ้าน</Link>
          <Link to="/event" style={menu("/event")}>🗓️ ปฏิทินกิจกรรม</Link>
          <Link to="/participating" style={menu("/participating")}>🤝 เข้าร่วมกิจกรรม</Link>
          <Link to="/development" style={menu("/development")}>📈 พัฒนาการนักเรียน</Link>
        </div>

        {/* 🚪 ปุ่มออกจากระบบ: จัดไว้ที่ด้านล่างสุด */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 ออกจากระบบ
        </button>
      </div>

      {/* 🖥️ CONTENT AREA: ฝั่งขวาซึ่งเป็นหน้าจอหลัก เลื่อน Scroll ได้ตามใจชอบ */}
      <div style={styles.content}>

        {/* 🔝 TOP NAVBAR: เปลี่ยนจากสีฟ้าทึบเดิม เป็นสีขาวโปร่งแสง Backdrop blur ซ่อนเนียนตา */}
        <div style={styles.topbar}>
          {/* ส่วนแสดงความต้อนรับด้านซ้าย */}
          <div style={styles.welcomeText}>
            ยินดีต้อนรับกลับสู่ระบบ
          </div>

          {/* ปุ่มโปรไฟล์ผู้ใช้งานด้านขวา สไตล์แคปซูลโค้งมน */}
          <div style={styles.profileBadge}>
            <span style={styles.statusDot}></span>
            <span style={styles.username}>🔔 {userName}</span>
          </div>
        </div>

        {/* ส่วนแสดงคอมโพเนนต์ย่อยด้านใน */}
        <div style={styles.main}>
          {children}
        </div>
      </div>
    </div>
  );
}

// 🎨 โครงสร้างเดิมทั้งหมด แก้ไขแค่ลบแถบเลื่อน (Scrollbar) ออกถาวร
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#e0f2fe",
    fontFamily: "'Kanit', 'Segoe UI', sans-serif",
    WebkitFontSmoothing: "antialiased"
  },
  sidebar: {
    width: 256,
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(226, 232, 240, 0.6)",
    boxShadow: "4px 0 24px rgba(0,0,0,0.015)",
    position: "sticky",
    top: 0,
    height: "100vh",
    flexShrink: 0
  },
  logoSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px", // ขนาดเดิม
    borderBottom: "1px solid #f1f5f9",
    marginBottom: "16px", // ขนาดเดิม
  },
  logoImage: {
    width: "110px", // ขนาดเดิม
    height: "auto",
    objectFit: "contain",
  },
  menuList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px", // ระยะห่างเดิม
    overflowY: "hidden" // 🌟 [แก้ไขจุดนี้] เปลี่ยนจาก "auto" เป็น "hidden" เพื่อซ่อนแถบเลื่อนสีเทาออกไปครับ
  },
  menu: {
    display: "block",
    padding: "12px 20px", // ขนาดเดิม
    margin: "0 12px",
    borderRadius: "12px",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "14px", // ขนาดตัวหนังสือเดิมที่ชอบ
    transition: "all 0.2s ease",
  },
  logoutBtn: {
    display: "block",
    width: "calc(100% - 24px)",
    padding: "12px 20px", // ขนาดเดิม
    margin: "12px",
    color: "#e11d48",
    background: "none",
    border: "none",
    borderRadius: "12px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px", // ขนาดเดิม
    fontWeight: "500",
    borderTop: "1px solid #f1f5f9",
    fontFamily: "'Kanit', 'Segoe UI', sans-serif",
    transition: "background-color 0.2s",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0
  },
  topbar: {
    height: 64, // ขนาดเดิม
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 32px",
    borderBottom: "1px solid rgba(226, 232, 240, 0.4)",
    position: "sticky",
    top: 0,
    zIndex: 10
  },
  welcomeText: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "500"
  },
  profileBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#ffffff",
    padding: "6px 16px",
    borderRadius: "9999px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  },
  statusDot: {
    width: "8px",
    height: "8px",
    background: "#10b981",
    borderRadius: "50%",
  },
  username: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569"
  },
  main: {
    padding: "24px",
    flex: 1,
    overflowY: "auto"
  },
};

export default Navbar;