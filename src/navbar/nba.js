import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
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
        // ✨ [แก้ไข] ดึงคีย์ให้ตรงกับข้อมูลที่เราส่งมาจากฐานข้อมูล (Name หรือ UserName)
        if (userData.Name) {
          setAdminName(userData.Name);
        } else if (userData.UserName) {
          setAdminName(userData.UserName);
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
        <h3 style={styles.logo}>📘 ADMIN PANEL</h3>
        
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
          <div style={styles.avatarPlaceholder}>
            {adminName.charAt(0).toUpperCase()}
          </div>
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
  logo: { 
    padding: "30px 20px 20px 20px", 
    fontSize: 20, 
    fontWeight: "bold",
    textAlign: "left",
    letterSpacing: "1px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    marginBottom: "10px"
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
  avatarPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: "50%",
    background: "#3498db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#ffffff"
  },
  main: { padding: 25, flex: 1 },
};

export default Navbar;