import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  ScrollText,
  Megaphone,
  BellRing,
  CalendarDays,
  Users2,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Sparkles
} from "lucide-react";

// 🌟 Import ตราสัญลักษณ์โรงเรียน
import logoSchool from "../logo_school.png";

function Navbar({ children }) {
  const location = useLocation();
  const [userName, setUserName] = useState("ผู้ใช้งานระบบ");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        const firstname = userObj.Firstname || userObj.firstname || userObj.Name || userObj.name || "";
        const lastname = userObj.Lastname || userObj.lastname || userObj.Surname || userObj.surname || "";

        if (firstname || lastname) {
          setUserName(`${firstname} ${lastname}`.trim());
        } else {
          setUserName("ผู้ใช้งานระบบ");
        }
      } catch (e) {
        console.error("เกิดข้อผิดพลาดในการอ่านข้อมูลผู้ใช้งาน:", e);
      }
    }
  }, []);

  // ปิด Sidebar บนมือถือเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user");
      window.location.href = "/HomePage";
    }
  };

  // 📌 รายการเมนูพร้อม Lucide Icons
  const menuItems = [
    { path: "/home", label: "หน้าหลัก", icon: LayoutDashboard },
    { path: "/personal", label: "ข้อมูลส่วนตัว", icon: User },
    { path: "/students", label: "ข้อมูลนักเรียน", icon: GraduationCap },
    { path: "/activity", label: "กิจกรรมนักเรียน", icon: ScrollText },
    { path: "/publicrelations", label: "ข่าวประชาสัมพันธ์", icon: Megaphone },
    { path: "/notification", label: "แจ้งเตือนการบ้าน", icon: BellRing },
    { path: "/event", label: "ปฏิทินกิจกรรม", icon: CalendarDays },
    { path: "/participating", label: "การเข้าร่วมกิจกรรม", icon: Users2 },
    { path: "/development", label: "พัฒนาการนักเรียน", icon: TrendingUp },
  ];

  return (
    <div style={styles.layout}>
      {/* 📱 Overlay สำหรับปิด Sidebar บนมือถือ */}
      {isMobileOpen && (
        <div
          style={styles.mobileOverlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🧭 SIDEBAR */}
      <aside
        style={{
          ...styles.sidebar,
          transform: isMobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="app-sidebar"
      >
        {/* ส่วนแสดงโลโก้โรงเรียน */}
        <div style={styles.logoSection}>
          <div style={styles.logoWrapper}>
            <img
              src={logoSchool}
              alt="ตราสัญลักษณ์โรงเรียน"
              style={styles.logoImage}
            />
          </div>
          {/* ปุ่มปิดบนมือถือ */}
          <button
            style={styles.closeBtn}
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close Menu"
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* รายการเมนูหลัก */}
        <nav style={styles.menuList}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuItemActive : {}),
                }}
              >
                <IconComponent
                  size={18}
                  style={{
                    color: isActive ? "#0284c7" : "#64748b",
                    transition: "color 0.2s ease"
                  }}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ปุ่มออกจากระบบด้านล่างสุด */}
        <div style={styles.footerSection}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={18} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* 🖥️ CONTENT AREA */}
      <div style={styles.content}>
        {/* 🔝 TOP NAVBAR */}
        <header style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <button
              style={styles.hamburgerBtn}
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={22} color="#0369a1" />
            </button>
            <div style={styles.welcomeContainer}>
              <Sparkles size={16} color="#0ea5e9" style={{ marginRight: 6 }} />
              <span style={styles.welcomeText}>ระบบบันทึกกิจกรรมนักเรียนอนุบาล</span>
            </div>
          </div>

          {/* โปรไฟล์ผู้ใช้ (ปรับแก้ให้แสดงชื่อ และ บทบาท "ครูผู้สอน" ซ้อนกัน) */}
          <div style={styles.profileBadge}>
            <div style={styles.statusDotWrapper}>
              <span style={styles.statusDot}></span>
            </div>
            <div style={styles.userInfoWrapper}>
              <span style={styles.username}>{userName}</span>
              <span style={styles.userRole}>ครูผู้สอน</span>
            </div>
          </div>
        </header>

        {/* ส่วนเนื้อหาหลัก */}
        <main style={styles.main}>
          {children}
        </main>
      </div>

      {/* 🛠️ CSS Injection สำหรับ Custom Scrollbar & Animations */}
      <style>{`
        @media (min-width: 1024px) {
          .app-sidebar {
            transform: translateX(0) !important;
          }
        }
        nav::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// 🎨 Styling ในรูปแบบ Inline Styles
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
    fontFamily: "'Kanit', 'Prompt', 'Segoe UI', sans-serif",
    WebkitFontSmoothing: "antialiased",
    position: "relative",
    overflowX: "hidden"
  },
  mobileOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    backdropFilter: "blur(4px)",
    zIndex: 40,
    transition: "opacity 0.3s ease"
  },
  sidebar: {
    width: 270,
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(16px)",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(224, 242, 254, 0.8)",
    boxShadow: "4px 0 25px rgba(14, 165, 233, 0.05)",
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  logoSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoImage: {
    maxHeight: "210px",
    maxWidth: "200px",
    objectFit: "contain",
  },
  closeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    padding: 0,
  },
  menuList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "16px 14px",
    overflowY: "auto",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 16px",
    borderRadius: "14px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  menuItemActive: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.12)",
  },
  footerSection: {
    padding: "16px 14px",
    borderTop: "1px solid #f1f5f9",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "12px",
    color: "#e11d48",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "'Kanit', sans-serif",
    transition: "all 0.2s ease",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    marginLeft: 0,
  },
  topbar: {
    height: 68,
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    borderBottom: "1px solid rgba(224, 242, 254, 0.8)",
    position: "sticky",
    top: 0,
    zIndex: 30,
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  hamburgerBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "10px",
    padding: "8px",
    cursor: "pointer",
  },
  welcomeContainer: {
    display: "flex",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: "14px",
    color: "#0369a1",
    fontWeight: "600",
  },
  profileBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    padding: "6px 16px 6px 12px",
    borderRadius: "9999px",
    border: "1px solid #e0f2fe",
    boxShadow: "0 2px 8px rgba(14, 165, 233, 0.08)",
  },
  statusDotWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    background: "#10b981",
    borderRadius: "50%",
    boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
  },
  userInfoWrapper: {
    display: "flex",
    flexDirection: "column",
    lineHeight: "1.2",
  },
  username: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
  },
  userRole: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#0ea5e9",
  },
  main: {
    padding: "24px",
    flex: 1,
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box"
  },
};

// CSS Injection สไตล์เฉพาะเพื่อดัน Margin ฝั่งขวาเฉพาะเมื่ออยู่หน้าจอคอมพิวเตอร์
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @media (min-width: 1024px) {
      .app-sidebar + div {
        margin-left: 270px !important;
      }
      button[aria-label="Open Menu"] {
        display: none !important;
      }
      button[aria-label="Close Menu"] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Navbar;