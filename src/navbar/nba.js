import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // 🔐 ตรวจสอบสิทธิ์และดึงข้อมูลชื่อแอดมินมาแสดง
    const storedUser = localStorage.getItem("user");
    
    if (!storedUser) {
      navigate("/login"); // ถ้าไม่ได้ล็อกอิน ให้เด้งออกไปข้างนอก
    } else {
      try {
        const userData = JSON.parse(storedUser);
        // แสดงชื่อจริงที่ส่งมาจาก PHP (ดักไว้ทั้ง name และ username)
        setAdminName(userData.name || userData.username || userData.UserName || "ผู้ดูแลระบบ");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  const menu = (path) => ({
    ...styles.menu,
    backgroundColor: location.pathname === path ? "#4a5568" : "transparent", // ไฮไลท์เมนูที่เลือก
  });

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user");
      window.location.href = "/login"; // ดีดกลับหน้าล็อกอินและเคลียร์สถานะเว็บ
    }
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar เมนูฝั่งซ้าย */}
      <div style={styles.sidebar}>
        <h3 style={styles.logo}>⚙️ ADMIN PANEL</h3>
        
        <Link to="/homeadmin" style={menu("/homeadmin")}>หน้าหลัก</Link>
        <Link to="/personal_dataad" style={menu("/personal_dataad")}>ข้อมูลส่วนตัว</Link>
        <Link to="/user_information" style={menu("/user_information")}>ข้อมูลผู้ใช้</Link>
        
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 ออกจากระบบ
        </button>
      </div>

      {/* Content พื้นที่แสดงผลเนื้อหาฝั่งขวา */}
      <div style={styles.content}>
        {/* Topbar แถบขาวด้านบนแสดงชื่อโพรไฟล์ตามภาพร่าง */}
        <div style={styles.topbar}>
          <span style={styles.username}>{adminName}</span>
          <div style={styles.avatarPlaceholder}>A</div>
        </div>
        <div style={styles.main}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif" },
  sidebar: { 
    width: 240, 
    background: "#1e293b", // สีเทาเข้มโทนแอดมิน เพื่อความสากลและแยกสิทธิ์ง่าย
    color: "#fff",
    display: "flex",
    flexDirection: "column"
  },
  logo: { padding: "30px 20px 20px 20px", fontSize: 20, fontWeight: "bold" },
  menu: {
    display: "block", padding: "14px 20px", color: "#fff",
    textDecoration: "none", cursor: "pointer", fontSize: "16px",
  },
  logoutBtn: {
    display: "block", width: "100%", padding: "16px 20px", color: "#f87171",
    background: "none", border: "none", textAlign: "left", cursor: "pointer",
    fontSize: "16px", marginTop: "auto", borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    fontFamily: "Segoe UI, sans-serif"
  },
  content: { flex: 1, background: "#f8f9fa" },
  topbar: {
    height: 60, background: "#fff", color: "#333",
    display: "flex", justifyContent: "flex-end", alignItems: "center",
    padding: "0 20px", borderBottom: "1px solid #e5e7eb"
  },
  username: { marginRight: 12, fontSize: 15, fontWeight: "600" },
  avatarPlaceholder: {
    width: 35, height: 35, borderRadius: "50%", background: "#cbd5e1",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#475569"
  },
  main: { padding: 25 },
};

export default Navbar;