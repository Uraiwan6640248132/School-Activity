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
    // 🌟 ปรับไฮไลต์สีเมื่ออยู่หน้านั้นๆ เป็นสีฟ้านุ่มละมุน (Indigo-50) และเปลี่ยนตัวอักษรเป็นสีฟ้าคราม
    backgroundColor: location.pathname === path ? "#e0f2fe" : "transparent",
    color: location.pathname === path ? "#0369a1" : "#426277",
    fontWeight: location.pathname === path ? "600" : "500",
    boxShadow: location.pathname === path ? "0 10px 24px rgba(14, 165, 233, 0.12)" : "none",
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
      {/* 🧭 Sidebar: ล็อคให้อยู่กับที่ด้วย position: "sticky" และเปลี่ยนเป็นธีมสีขาวคลีน */}
      <div style={styles.sidebar}>

        {/* 🌟 ตราสัญลักษณ์โรงเรียน จัดวางสวยงาม มีเส้นคั่นบางๆ */}
        <div style={styles.logoSection}>
          <img
            src={logoSchool}
            alt="ตราสัญลักษณ์โรงเรียน"
            style={styles.logoImage}
          />
        </div>

        {/* รายการเมนูตามรูปภาพ (เพิ่มอีโมจิให้หน้าตาสวยงามเหมือนหน้าผู้ใช้งานทั่วไป) */}
        <div style={styles.menuList}>
          <Link to="/homeparent" style={menu("/homeparent")}>📊 หน้าหลัก</Link>
          <Link to="/personal_dataparent" style={menu("/personal_dataparent")}>👤 ข้อมูลส่วนตัว</Link>
          <Link to="/student_data" style={menu("/student_data")}>🧑‍🎓 ข้อมูลนักเรียน</Link>
          <Link to="/activityp" style={menu("/activityp")}>📅 กิจกรรม</Link>
          <Link to="/publicrelationp" style={menu("/publicrelationp")}>📢 ประชาสัมพันธ์</Link>
          <Link to="/notificationp" style={menu("/notificationp")}>📝 แจ้งเตือนการบ้าน</Link>
          <Link to="/calendarp" style={menu("/calendarp")}>🗓️ ปฏิทินกิจกรรม</Link>
          <Link to="/developmentp" style={menu("/developmentp")}>📈 พัฒนาการนักเรียน</Link>
        </div>

        {/* ปุ่มออกจากระบบอยู่ล่างสุด */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 ออกจากระบบ
        </button>
      </div>

      {/* 🖥️ Content Area: ฝั่งขวาเลื่อนขึ้นลงได้อิสระ */}
      <div style={styles.content}>
        {/* 🔝 TOP NAVBAR: สีขาวโปร่งแสง Backdrop blur */}
        <div style={styles.topbar}>
          {/* ส่วนแสดงความต้อนรับด้านซ้าย */}
          <div style={styles.welcomeText}>
            ยินดีต้อนรับกลับสู่ระบบผู้ปกครอง
          </div>

          {/* ส่วนแสดง ชื่อ-นามสกุล ด้านบนขวา ครอบดีไซน์แบบแคปซูลมนๆ */}
          <div style={styles.profileBadge}>
            <span style={styles.statusDot}></span>
            <span style={styles.username}>🔔 {parentName}</span>
          </div>
        </div>
        <div style={styles.main}>{children}</div>
      </div>
    </div>
  );
}

// 🎨 ปรับปรุงสไตล์ใหม่ทั้งหมด คุมโทนให้ตรงกันทุกหน้าจอ
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
    position: "sticky", // 🌟 ตรึงให้อยู่กับที่
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
    overflowY: "auto" // เมนูย่อยเลื่อนตัวเองได้หากในอนาคตมีเมนูเพิ่มขึ้นมา
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
