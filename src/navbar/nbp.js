import { Link, useLocation } from "react-router-dom";
// 🌟 Import ตราสัญลักษณ์โรงเรียนเข้ามาจากโฟลเดอร์ src หลัก
import logoSchool from "../logo_school.png"; 

function Navbar({ children }) {
  const location = useLocation();

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
          <span style={styles.username}>ชื่อ-นามสกุล</span>
          <div style={styles.avatarPlaceholder}></div>
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
    background: "#5b95e5", 
    color: "#fff",
    display: "flex",
    flexDirection: "column"
  },
  
  // 🎨 ปรับแก้ระยะความห่างพิกเซลในจุดนี้ให้กระชับ เพื่อดันตราโรงเรียนลงมาอยู่ใกล้เมนูหน้าหลัก
  logoSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px 16px 12px 16px", // 🌟 ลดขนาด padding พื้นที่บน-ล่างให้บางลง
    borderBottom: "1px solid rgba(255, 255, 255, 0.15)", // เส้นแบ่งบาง ๆ ใต้โลโก้ก่อนเริ่มรายการเมนู
    marginBottom: "4px",            // 🌟 ขยับระยะขอบล่างให้ชิดเกยติดแถบสีไฮไลท์ "หน้าหลัก" พอดี
  },
  logoImage: {
    width: "110px",        // ขนาดสัดส่วนความกว้างของตราขยายใหญ่คมชัดเท่ากันทุกฝั่ง
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
    fontFamily: "Segoe UI, sans-serif"
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
    fontWeight: "600"
  },
  avatarPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: "50%",
    background: "#ccc"
  },
  main: { padding: 20 },
};

export default Navbar;