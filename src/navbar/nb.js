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
    backgroundColor: location.pathname === path ? "#e0f2fe" : "transparent",
    color: location.pathname === path ? "#0369a1" : "#426277",
    fontWeight: location.pathname === path ? "600" : "500",
    boxShadow: location.pathname === path ? "0 10px 24px rgba(14, 165, 233, 0.12)" : "none",
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

        {/* รายการเมนูลิงก์ภายในแอป (ปรับไอคอนให้เป็นทางการขึ้น) */}
        <div style={styles.menuList} className="sidebar-menu-list">
          <Link to="/home" style={menu("/home")}>🏢 หน้าหลัก</Link>
          <Link to="/personal" style={menu("/personal")}>📋 ข้อมูลส่วนตัว</Link>
          <Link to="/students" style={menu("/students")}>🎓 ข้อมูลนักเรียน</Link>
          <Link to="/activity" style={menu("/activity")}>📜 กิจกรรม</Link>
          <Link to="/publicrelations" style={menu("/publicrelations")}>📢 ประชาสัมพันธ์</Link>
          <Link to="/notification" style={menu("/notification")}>📝 แจ้งเตือนการบ้าน</Link>
          <Link to="/event" style={menu("/event")}>📅 ปฏิทินกิจกรรม</Link>
          <Link to="/participating" style={menu("/participating")}>🤝 เข้าร่วมกิจกรรม</Link>
          <Link to="/development" style={menu("/development")}>📊 พัฒนาการนักเรียน</Link>
        </div>

        {/* 🚪 ปุ่มออกจากระบบ: จัดไว้ที่ด้านล่างสุด */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🔒 ออกจากระบบ
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

          {/* ปุ่มโปรไฟล์ผู้ใช้งานด้านขวา สไตล์แคปซูลโค้งมน (นำ 🔔 ออกเพื่อไม่ให้กวนสายตา) */}
          <div style={styles.profileBadge}>
            <span style={styles.statusDot}></span>
            <span style={styles.username}>{userName}</span>
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
    background: "linear-gradient(135deg, #f6fbff 0%, #dff3ff 48%, #eef9ff 100%)",
    fontFamily: "'Kanit', 'Segoe UI', sans-serif",
    WebkitFontSmoothing: "antialiased"
  },
  sidebar: {
    width: 256,
    background: "rgba(255, 255, 255, 0.88)",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(186, 230, 253, 0.85)",
    boxShadow: "8px 0 30px rgba(2, 132, 199, 0.08)",
    position: "sticky",
    top: 0,
    height: "100vh",
    flexShrink: 0
  },
  logoSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #d8eefb",
    marginBottom: "16px",
  },
  logoImage: {
    width: "110px",
    height: "auto",
    objectFit: "contain",
  },
  menuList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    overflowY: "auto", // 🌟 [แนะนำปรับเป็น auto] เพื่อรองรับหน้าจอที่เตี้ย แต่จะซ่อนแถบเลื่อนด้วย CSS แทนเพื่อความเนียนตา
    msOverflowStyle: "none",  /* IE and Edge */
    scrollbarWidth: "none",  /* Firefox */
  },
  menu: {
    display: "block",
    padding: "12px 20px",
    margin: "0 12px",
    borderRadius: "12px",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  logoutBtn: {
    display: "block",
    width: "calc(100% - 24px)",
    padding: "12px 20px",
    margin: "12px",
    color: "#be123c",
    background: "#fff5f7",
    border: "1px solid #fecdd3",
    borderRadius: "12px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    borderTop: "1px solid #d8eefb",
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
    height: 64,
    background: "rgba(255, 255, 255, 0.78)",
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 32px",
    borderBottom: "1px solid rgba(186, 230, 253, 0.7)",
    position: "sticky",
    top: 0,
    zIndex: 10
  },
  welcomeText: {
    fontSize: "12px",
    color: "#4b7188",
    fontWeight: "500"
  },
  profileBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#ffffff",
    padding: "6px 16px",
    borderRadius: "9999px",
    border: "1px solid rgba(186, 230, 253, 0.9)",
    boxShadow: "0 8px 22px rgba(14, 165, 233, 0.12)"
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
    color: "#12324a"
  },
  main: {
    padding: "28px",
    flex: 1,
    overflowY: "auto"
  },
};

export default Navbar;
