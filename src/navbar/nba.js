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
    // 🌟 ปรับไฮไลต์สีเมื่ออยู่หน้านั้นๆ เป็นสีฟ้านุ่มละมุนตามไอเดียต้นแบบรูปตัวอย่าง
    backgroundColor: location.pathname === path ? "#f0f2ff" : "transparent",
    color: location.pathname === path ? "#4f46e5" : "#64748b",
    fontWeight: location.pathname === path ? "600" : "500",
    boxShadow: location.pathname === path ? "0 1px 3px 0 rgba(79, 70, 229, 0.1)" : "none",
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
      {/* 🧭 Sidebar: ถูกล็อคให้อยู่กับที่ด้วย position: "sticky" และเปลี่ยนเป็นธีมสีขาวคลีน */}
      <div style={styles.sidebar}>

        {/* 🌟 ตราสัญลักษณ์โรงเรียน จัดวางสวยงาม มีเส้นคั่นบางๆ */}
        <div style={styles.logoSection}>
          <img
            src={logoSchool}
            alt="ตราสัญลักษณ์โรงเรียน"
            style={styles.logoImage}
          />
        </div>

        {/* รายการเมนูสำหรับแอดมิน */}
        <div style={styles.menuList}>
          <Link to="/homeadmin" style={menu("/homeadmin")}>🏠 หน้าหลัก</Link>
          <Link to="/personal_dataad" style={menu("/personal_dataad")}>👤 ข้อมูลส่วนตัว</Link>
          <Link to="/user_information" style={menu("/user_information")}>👥 ข้อมูลผู้ใช้</Link>
        </div>

        {/* ปุ่มออกจากระบบอยู่ล่างสุด แยกสัดส่วนชัดเจน */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 ออกจากระบบ
        </button>
      </div>

      {/* 🖥️ Content Area: ฝั่งขวาที่จะเลื่อน Scroll ได้อย่างอิสระ */}
      <div style={styles.content}>
        {/* 🔝 TOP NAVBAR: สีขาวโปร่งแสง เนียนไปกับ Dashboard */}
        <div style={styles.topbar}>
          {/* ส่วนแสดงความต้อนรับด้านซ้าย */}
          <div style={styles.welcomeText}>
            ยินดีต้อนรับกลับสู่ระบบแอดมิน
          </div>

          {/* ส่วนแสดงชื่อแอดมินด้านขวา ครอบดีไซน์แบบแคปซูลมนๆ */}
          <div style={styles.profileBadge}>
            <span style={styles.statusDot}></span>
            <span style={styles.username}>🔔 {adminName}</span>
          </div>
        </div>
        <div style={styles.main}>{children}</div>
      </div>
    </div>
  );
}

// 🎨 ปรับโฉมสไตล์ใหม่ทั้งหมดให้เหมือนกับโค้ดชุดแรก (ธีมสว่าง คลีน โมเดิร์น)
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#e0f2fe", // สีฟ้าอมเทาสว่างขับตัว Dashboard (bg-sky-100)
    fontFamily: "'Kanit', 'Segoe UI', sans-serif",
    WebkitFontSmoothing: "antialiased"
  },
  sidebar: {
    width: 256,
    background: "#ffffff", // เปลี่ยนเป็นสีขาว คลีนตา
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(226, 232, 240, 0.6)",
    boxShadow: "4px 0 24px rgba(0,0,0,0.015)",
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
    borderBottom: "1px solid #f1f5f9",
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
    gap: "4px"
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
    color: "#e11d48", // สีชมพูอมแดง Rose-600
    background: "none",
    border: "none",
    borderRadius: "12px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    borderTop: "1px solid #f1f5f9",
    fontFamily: "'Kanit', 'Segoe UI', sans-serif",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#fff1f2" // เอฟเฟกต์ตอนชี้ปุ่มออก
    }
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0
  },
  topbar: {
    height: 64,
    background: "rgba(255, 255, 255, 0.6)", // ขาวโปร่งแสง
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 32px",
    borderBottom: "1px solid rgba(226, 232, 240, 0.4)",
    position: "sticky",
    top: 0,
    zIndex: 10
  },
  welcomeText: {
    fontSize: "12px",
    color: "#94a3b8", // Slate-400
    fontWeight: "500"
  },
  profileBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#ffffff",
    padding: "6px 16px",
    borderRadius: "9999px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  },
  statusDot: {
    width: "8px",
    height: "8px",
    background: "#10b981", // จุดสีเขียวมรกตแบบกระพริบ
    borderRadius: "50%",
  },
  username: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569" // Slate-600
  },
  main: {
    padding: "24px",
    flex: 1,
    overflowY: "auto" // ปล่อยให้แสดงผลหน้าต่างเนื้อหาหลักเลื่อนขึ้นลงได้
  },
};

export default Navbar;