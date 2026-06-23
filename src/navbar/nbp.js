import { Link, useLocation } from "react-router-dom";

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
        <h3 style={styles.logo}>LOGO</h3>
        
        {/* รายการเมนูตามรูปภาพ image_d5822f.png */}
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
  logo: { 
    padding: "30px 20px 20px 20px", 
    fontSize: 22, 
    fontWeight: "bold",
    textAlign: "left"
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
    background: "#fff", // ปรับเป็นสีขาวตามโครงร่างรูปภาพ
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