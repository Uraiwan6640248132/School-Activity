import { Link, useLocation } from "react-router-dom";

function Navbar({ children }) {
  const location = useLocation();

  const menu = (path) => ({
    ...styles.menu,
    backgroundColor: location.pathname === path ? "#9fbef1" : "transparent",
  });

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h3 style={styles.logo}>📘 School</h3>
        <Link to="/personal" style={menu("/personal")}>ข้อมูลส่วนตัว</Link>
        <Link to="/publicRelations" style={menu("/publicRelations")}>ประชาสัมพันธ์</Link>
        <Link to="/activity" style={menu("/activity")}>กิจกรรม</Link>
        <Link to="/students" style={menu("/students")}>ข้อมูลนักเรียน</Link>
        <Link to="/notification" style={menu("/notification")}>แจ้งเตือนการบ้าน</Link>
        <Link to="/event" style={menu("/event")}>ปฏิทินกิจกรรม</Link>
        <Link to="/participating" style={menu("/participating")}>เข้าร่วมกิจกรรม</Link>
        <Link to="/development" style={menu("/development")}>พัฒนาการนักเรียน</Link>
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
  sidebar: { width: 220, background: "#5b95e5", color: "#fff" },
  logo: { padding: 20, fontSize: 20, fontWeight: "bold" },
  menu: {
    display: "block",
    padding: "12px 20px",
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
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