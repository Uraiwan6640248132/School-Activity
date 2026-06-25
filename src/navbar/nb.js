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

  const menu = (path) => ({
    ...styles.menu,
    backgroundColor: location.pathname === path ? "#9fbef1" : "transparent",
  });

  // 🚪 ฟังก์ชันเมื่อกดปุ่มออกจากระบบ
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user"); // ลบความจำการล็อกอินออกทั้งหมด
      window.location.href = "/login"; // ดีดตัวกลับไปหน้าล็อกอินด้านนอกสุด
    }
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>

        {/* 🌟 ปรับปรุงพื้นที่ส่วนโลโก้: ขยับความห่างให้ชิดกับเมนูหน้าหลักลงมาเรียบร้อยแล้ว */}
        <div style={styles.logoSection}>
          <img
            src={logoSchool}
            alt="ตราสัญลักษณ์โรงเรียน"
            style={styles.logoImage}
          />
        </div>

        <Link to="/home" style={menu("/home")}>หน้าหลัก</Link>
        <Link to="/personal" style={menu("/personal")}>ข้อมูลส่วนตัว</Link>
        <Link to="/students" style={menu("/students")}>ข้อมูลนักเรียน</Link>
        <Link to="/activity" style={menu("/activity")}>กิจกรรม</Link>
        <Link to="/publicrelations" style={menu("/publicrelations")}>ประชาสัมพันธ์</Link>
        <Link to="/notification" style={menu("/notification")}>แจ้งเตือนการบ้าน</Link>
        <Link to="/event" style={menu("/event")}>ปฏิทินกิจกรรม</Link>
        <Link to="/participating" style={menu("/participating")}>เข้าร่วมกิจกรรม</Link>
        <Link to="/development" style={menu("/development")}>พัฒนาการนักเรียน</Link>

        {/* 🌟 ปุ่มออกจากระบบ ถูกจัดวางไว้ล่างสุดของเมนูทั้งหมด */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 ออกจากระบบ
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.topbar}>
          {/* 🌟 แสดงชื่อจริงที่ดึงมาจากสถานะเข้าสู่ระบบ */}
          🔔 {userName}
        </div>
        <div style={styles.main}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif" },
  sidebar: {
    width: 220,
    background: "#5b95e5",
    color: "#fff",
    display: "flex",
    flexDirection: "column"
  },

  logoSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px 16px 12px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
    marginBottom: "4px",
  },
  logoImage: {
    width: "110px",
    height: "auto",
    objectFit: "contain",
  },

  menu: {
    display: "block",
    padding: "12px 20px",
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
  },
  logoutBtn: {
    display: "block",
    width: "100%",
    padding: "12px 20px",
    color: "#ffebee",
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "auto",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    fontFamily: "Segoe UI, sans-serif"
  },
  content: { flex: 1, background: "#f3f4f6" },
  topbar: {
    height: 60,
    background: "#5b95e5",
    color: "#fff",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0 20px",
  },
  main: { padding: 20 },
};

export default Navbar;