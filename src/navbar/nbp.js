import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// 🌟 Import ตราสัญลักษณ์โรงเรียนเข้ามาจากโฟลเดอร์ src หลัก
import logoSchool from "../logo_school.png";

function Navbar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // 🌟 เพิ่มสเตทสำหรับเก็บชื่อผู้ปกครอง (ค่าเริ่มต้นเป็นคำว่า "ผู้ปกครอง")
  const [parentName, setParentName] = useState("ผู้ปกครอง");

  useEffect(() => {
    // 🔐 ดึงข้อมูลผู้ใช้ที่ล็อกอินมาจาก localStorage
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // ถ้าไม่มีข้อมูลการล็อกอิน ให้ดีดกลับไปหน้า Login ทันที
      navigate("/login");
    } else {
      try {
        const userData = JSON.parse(storedUser);

        // 🌟 ดึงค่าชื่อ (ตรวจสอบทั้งตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก)
        const firstname = userData.Firstname || userData.firstname || userData.Name || userData.name || userData.UserName || "";

        // 🌟 ดึงค่านามสกุล (ตรวจสอบทั้งตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก)
        const lastname = userData.Lastname || userData.lastname || userData.Surname || userData.surname || "";

        // นำชื่อและนามสกุลมาต่อกันแบบเว้นวรรคสวยงาม
        if (firstname || lastname) {
          setParentName(`${firstname} ${lastname}`.trim());
        } else {
          setParentName("ผู้ปกครอง");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  const menu = (path) => ({
    ...styles.menu,
    backgroundColor: location.pathname === path ? "#9fbef1" : "transparent",
  });

  // ฟังก์ชันเมื่อกดปุ่มออกจากระบบ
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>

        {/* 🌟 ปรับปรุงใหม่: เอาคำว่า LOGO ออก และใส่ตราสัญลักษณ์โรงเรียนแบบกระชับระยะชิดหน้าหลัก */}
        <div style={styles.logoSection}>
          <img
            src={logoSchool}
            alt="ตราสัญลักษณ์โรงเรียน"
            style={styles.logoImage}
          />
        </div>

        {/* รายการเมนูตามรูปภาพ */}
        <Link to="/homeparent" style={menu("/homeparent")}>หน้าหลัก</Link>
        <Link to="/personal_dataparent" style={menu("/personal_dataparent")}>ข้อมูลส่วนตัว</Link>
        <Link to="/student_data" style={menu("/student_data")}>ข้อมูลนักเรียน</Link>
        <Link to="/activityp" style={menu("/activityp")}>กิจกรรม</Link>
        <Link to="/publicrelationp" style={menu("/publicrelationp")}>ประชาสัมพันธ์</Link>
        <Link to="/notificationp" style={menu("/notificationp")}>แจ้งเตือนการบ้าน</Link>
        <Link to="/calendarp" style={menu("/calendarp")}>ปฏิทินกิจกรรม</Link>
        <Link to="/developmentp" style={menu("/developmentp")}>พัฒนาการนักเรียน</Link>

        {/* ปุ่มออกจากระบบอยู่ล่างสุด */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          ออกจากระบบ
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* ส่วนแสดง ชื่อ-นามสกุล ด้านบนขวา */}
        <div style={styles.topbar}>
          {/* 🌟 แสดงชื่อที่ดึงมาจากระบบเรียบร้อยแล้ว */}
          <span style={styles.username}>{parentName}</span>
        </div>
        <div style={styles.main}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", fontFamily: "'Kanit', 'Segoe UI', sans-serif" },
  sidebar: {
    width: 240,
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
    fontSize: "16px",
  },
  logoutBtn: {
    display: "block",
    width: "100%",
    padding: "16px 20px",
    color: "#fff",
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "auto",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    fontFamily: "'Kanit', 'Segoe UI', sans-serif"
  },
  content: { flex: 1, background: "#f3f4f6" },
  topbar: {
    height: 60,
    background: "#fff",
    color: "#333",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "1px solid #e5e7eb"
  },
  username: {
    marginRight: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#475569"
  },
  main: { padding: 20 },
};

export default Navbar;