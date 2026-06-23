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
        // สมมติว่าใน object user มี key ชื่อ 'name' หรือ 'username' 
        // ให้ปรับตามโครงสร้างข้อมูลที่เซฟไว้ตอน login นะครับ
        if (userData.name) {
          setAdminName(userData.name);
        } else if (userData.username) {
          setAdminName(userData.username);
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
        <Link to="/homeadmin" style={menu("/homeadmin")}>หน้าหลัก</Link>
        <Link to="/personal_dataad" style={menu("/personal_dataad")}>ข้อมูลส่วนตัว</Link>
        <Link to="/user_information" style={menu("/user_information")}>ข้อมูลผู้ใช้</Link>
        
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
    background: "#2c3e50", // เปลี่ยนสีโทนเข้มขึ้นเพื่อให้เข้ากับธีม Admin
    color: "#fff",
    display: "flex",
    flexDirection: "column"
  },
  logo: { 
    padding: "30px 20px 20px 20px", 
    fontSize: 20, 
    fontWeight: "bold",
    textAlign: "left",
    letterSpacing: "1px"
  },
  menu: {
    display: "block",
    padding: "14px 20px",
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.2s"
  },
  logoutBtn: {
    display: "block",
    width: "100%",
    padding: "16px 20px",
    color: "#ff7675", // สีแดงอ่อนสำหรับปุ่มออกจากระบบของแอดมิน
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "auto", 
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    fontFamily: "Segoe UI, sans-serif"
  },
  content: { flex: 1, background: "#f8f9fa" },
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
    fontWeight: "600"
  },
  avatarPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: "50%",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#4a5568"
  },
  main: { padding: 25 },
};

export default Navbar;