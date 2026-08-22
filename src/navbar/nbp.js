import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  ScrollText,
  Megaphone,
  BellRing,
  CalendarDays,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Heart
} from "lucide-react";

// 🌟 Import ตราสัญลักษณ์โรงเรียน
import logoSchool from "../logo_school.png";

function Navbar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [parentName, setParentName] = useState("ผู้ปกครอง");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // 🔐 ดึงข้อมูลผู้ใช้ที่ล็อกอินมาจาก localStorage
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
    } else {
      try {
        const userData = JSON.parse(storedUser);

        const firstname = userData.Firstname || userData.firstname || userData.Name || userData.name || userData.UserName || "";
        const lastname = userData.Lastname || userData.lastname || userData.Surname || userData.surname || "";

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

  // ปิด Sidebar บนมือถือเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // ฟังก์ชันเมื่อกดปุ่มออกจากระบบ
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user");
      window.location.href = "/HomePage"; // ❌ เดิม
    }
  };
  // 📌 รายการเมนูสำหรับผู้ปกครอง (ใช้ Lucide Icons)
  const menuItems = [
    { path: "/homeparent", label: "หน้าหลัก", icon: LayoutDashboard },
    { path: "/personal_dataparent", label: "ข้อมูลส่วนตัว", icon: User },
    { path: "/student_data", label: "ข้อมูลนักเรียน", icon: GraduationCap },
    { path: "/activityp", label: "กิจกรรม", icon: ScrollText },
    { path: "/publicrelationp", label: "ประชาสัมพันธ์", icon: Megaphone },
    { path: "/notificationp", label: "แจ้งเตือนการบ้าน", icon: BellRing },
    { path: "/calendarp", label: "ปฏิทินกิจกรรม", icon: CalendarDays },
    { path: "/developmentp", label: "พัฒนาการนักเรียน", icon: TrendingUp },
  ];

  return (
    <div style={styles.layout}>
      {/* Overlay สำหรับปิด Sidebar บนมือถือ */}
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
        {/* ส่วนตราสัญลักษณ์โรงเรียน */}
        <div style={styles.logoSection}>
          <div style={styles.logoWrapper}>
            <img
              src={logoSchool}
              alt="ตราสัญลักษณ์โรงเรียน"
              style={styles.logoImage}
            />
          </div>
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

        {/* ปุ่มออกจากระบบ */}
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
              <Heart size={16} color="#0ea5e9" style={{ marginRight: 6 }} />
              <span style={styles.welcomeText}>ยินดีต้อนรับกลับสู่ระบบผู้ปกครอง</span>
            </div>
          </div>

          <div style={styles.profileBadge}>
            <div style={styles.statusDotWrapper}>
              <span style={styles.statusDot}></span>
            </div>
            <span style={styles.username}>{parentName}</span>
          </div>
        </header>

        <main style={styles.main}>{children}</main>
      </div>

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

// 🎨 CSS Style
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
  username: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
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

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @media (min-width: 1024px) {
      .app-sidebar + div {
        margin-left: 270px !important;
      }
      button[aria-label="Open Menu"], button[aria-label="Close Menu"] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Navbar;