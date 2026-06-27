import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// 🌟 Import ตราสัญลักษณ์โรงเรียนเข้ามาจากโฟลเดอร์ src หลัก
import logoSchool from "../logo_school.png";

function Navbar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  // 🌟 เริ่มต้นค่าเริ่มต้นเป็นแอดมินหรือคำว่างๆ ไว้ก่อน
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // 🔐 ดึงข้อมูลผู้ใช้ที่ล็อกอินมาจาก localStorage
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // ถ้าไม่มีข้อมูลการล็อกอิน ให้ดีดกลับไปหน้า Login ทันที
      navigate("/login");
    } else {
      try {
        const userData = JSON.parse(storedUser);

        // 🌟 ดึงค่าชื่อ (ตรวจสอบสัญกรณ์ทั้งตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก)
        const firstname = userData.Firstname || userData.firstname || userData.Name || userData.name || userData.UserName || "";

        // 🌟 ดึงค่านามสกุล (ตรวจสอบสัญกรณ์ทั้งตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก)
        const lastname = userData.Lastname || userData.lastname || userData.Surname || userData.surname || "";

        // นำชื่อและนามสกุลมาต่อกันแบบเว้นวรรคสวยงาม
        if (firstname || lastname) {
          setAdminName(`${firstname} ${lastname}`.trim());
        } else {
          setAdminName("Admin");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  const menu = (path) => ({
    ...styles.menu,
    // ทำไฮไลต์สีเมื่ออยู่หน้านั้นๆ
    backgroundColor: location.pathname === path ? "#34495e" : "transparent",
    borderLeft: location.pathname === path ? "4px solid #3498db" : "4px solid transparent",
  });

  // 🚪 ฟังก์ชันเมื่อกดปุ่มออกจากระบบ
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user"); // ลบเซสชันการเข้าสู่ระบบ
      window.location.href = "/login"; // เคลียร์สเตทและนำกลับไปหน้าล็อกอิน
    }
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>

        {/* 🌟 ปรับปรุงใหม่: เอาคำว่า ADMIN PANEL ออก และใส่ตราสัญลักษณ์โรงเรียนแบบกระชับระยะไม่ให้ห่างหน้าหลัก */}
        <div style={styles.logoSection}>
          <img
            src={logoSchool}
            alt="ตราสัญลักษณ์โรงเรียน"
            style={styles.logoImage}
          />
        </div>

        {/* รายการเมนูสำหรับแอดมิน */}
        <Link to="/homeadmin" style={menu("/homeadmin")}>🏠 หน้าหลัก</Link>
        <Link to="/personal_dataad" style={menu("/personal_dataad")}>👤 ข้อมูลส่วนตัว</Link>
        {/* ⚙️ ปุ่มไปหน้ากำหนดสิทธิ์ จัดการผู้ใช้งาน */}
        <Link to="/user_information" style={menu("/user_information")}>👥 ข้อมูลผู้ใช้</Link>

        {/* ปุ่มออกจากระบบอยู่ล่างสุด */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 ออกจากระบบ
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* ส่วนแสดง ชื่อแอดมินที่ดึงมาจากระบบ ด้านบนขวา */}
        <div style={styles.topbar}>
          <span style={styles.username}>{adminName}</span>
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
    background: "#2c3e50",
    color: "#fff",
    display: "flex",
    flexDirection: "column"
  },

  logoSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px 16px 12px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    marginBottom: "4px",
  },
  logoImage: {
    width: "110px",
    height: "auto",
    objectFit: "contain",
  },

  menu: {
    display: "block",
    padding: "14px 20px",
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s"
  },
  logoutBtn: {
    display: "block",
    width: "100%",
    padding: "16px 20px",
    color: "#ff7675",
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "auto",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    fontFamily: "'Kanit', 'Segoe UI', sans-serif"
  },
  content: { flex: 1, background: "#f8f9fa", display: "flex", flexDirection: "column" },
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
    marginRight: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#475569"
  },
  main: { padding: 25, flex: 1 },
};



export default Navbar;