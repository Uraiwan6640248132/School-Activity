import { Link, useLocation } from "react-router-dom";

function Navbar({ children }) {
  const location = useLocation();

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
        <h3 style={styles.logo}>📘 School</h3>
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
          🔔 นางสาวธัณรัตน์ สิงห์มณี
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
    flexDirection: "column" // เพื่อตั้งค่าให้จัดเมนูแบบแนวตั้งและดันปุ่มลงล่างได้ง่ายขึ้น
  },
  logo: { padding: 20, fontSize: 20, fontWeight: "bold" },
  menu: {
    display: "block",
    padding: "12px 20px",
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
  },
  // 🎨 เพิ่มการตกแต่งปุ่มออกจากระบบให้สวยงามและเข้ากับสไตล์เดิม
  logoutBtn: {
    display: "block",
    width: "100%",
    padding: "12px 20px",
    color: "#ffebee", // ใช้สีตัวอักษรโทนขาวอมแดงให้สังเกตง่าย
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "auto", // 🌟 คุณสมบัตินี้จะช่วยดันปุ่มลงไปอยู่ด้านล่างสุดของแถบ Sidebar ตลอดเวลา
    borderTop: "1px solid rgba(255, 255, 255, 0.2)", // เส้นคั่นบาง ๆ ให้ดูเป็นระเบียบ
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