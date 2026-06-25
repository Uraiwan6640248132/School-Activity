import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [counts, setCounts] = useState({ students: 0, users: 0, activities: 0 });
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const studentRes = await axios.get("http://localhost:3001/api/students");
        const userRes = await axios.get("http://localhost:3001/users");
        const activityRes = await axios.get("http://localhost:3001/activities");
        const notificationRes = await axios.get("http://localhost:3001/notifications");

        setCounts({
          students: studentRes.data.length,
          users: userRes.data.length,
          activities: activityRes.data.length,
        });

        setLatestNotifications(notificationRes.data.slice(0, 4));
        setLatestActivities(activityRes.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน้า Home:", error);
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div style={styles.container}>
      {/* 🟢 ส่วนบน: เมนูการ์ดตัวนับจำนวนและลิงก์เชื่อมหน้า (ลบผู้ปกครองออกแล้ว) */}
      <div style={styles.cardRow}>
        <Link to="/students" style={styles.card}>
          <div style={styles.cardTitle}>นักเรียน</div>
          <div style={styles.cardCount}>{loading ? "..." : `${counts.students} คน`}</div>
        </Link>

        <Link to="/users" style={styles.card}>
          <div style={styles.cardTitle}>ครูผู้สอน</div>
          <div style={styles.cardCount}>{loading ? "..." : `${counts.users} คน`}</div>
        </Link>

        <Link to="/activity" style={styles.card}>
          <div style={styles.cardTitle}>กิจกรรม</div>
          <div style={styles.cardCount}>{loading ? "..." : `${counts.activities} กิจกรรม`}</div>
        </Link>
      </div>

      {/* 🔵 ส่วนล่าง: กล่องข้อมูลอัปเดตล่าสุด 2 ฝั่ง */}
      <div style={styles.contentRow}>
        {/* กล่องการบ้านล่าสุด */}
        <div style={styles.infoBox}>
          <h3 style={styles.boxTitle}>การบ้านล่าสุด</h3>
          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูล...</p>
            ) : latestNotifications.length > 0 ? (
              latestNotifications.map((item, index) => (
                <div key={index} style={styles.listItem}>
                  <strong>{item.Subject}</strong> - {item.Details || "ไม่มีรายละเอียด"}
                  <span style={styles.itemDate}> (ชั้น: {item.Class_level})</span>
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>ไม่มีข้อมูลการบ้านล่าสุด</p>
            )}
          </div>
        </div>

        {/* กล่องกิจกรรมล่าสุด */}
        <div style={styles.infoBox}>
          <h3 style={styles.boxTitle}>กิจกรรมล่าสุด</h3>
          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูล...</p>
            ) : latestActivities.length > 0 ? (
              latestActivities.map((item, index) => (
                /* 🌟 ปรับปรุงใหม่: เปลี่ยนเป็น Link เพื่อให้กดคลิกเข้าไปดูหน้ารายละเอียดกิจกรรมได้ */
                <Link to="/activity" key={index} style={styles.linkItem}>
                  <strong>{item.Name_activity}</strong>
                  <span style={styles.itemDate}> 📍 {item.Location || "ไม่ระบุสถานที่"}</span>
                </Link>
              ))
            ) : (
              <p style={styles.emptyText}>ไม่มีข้อมูลกิจกรรมล่าสุด</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "40px", fontFamily: "sans-serif", backgroundColor: "#ffffff", minHeight: "100vh" },
  cardRow: { display: "flex", gap: "20px", marginBottom: "40px", justifyContent: "space-between" },
  card: { flex: 1, backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #ccc", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textDecoration: "none", color: "#333333", minHeight: "60px" },
  cardTitle: { fontSize: "16px", fontWeight: "bold", color: "#333333", marginBottom: "5px" },
  cardCount: { fontSize: "14px", color: "#666666" },
  contentRow: { display: "flex", gap: "30px" },
  infoBox: { flex: 1, backgroundColor: "#ffffff", border: "1px solid #ccc", borderRadius: "8px", padding: "25px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", minHeight: "350px" },
  boxTitle: { fontSize: "20px", fontWeight: "bold", margin: "0 0 20px 0", color: "#000000" },
  listBox: { display: "flex", flexDirection: "column", gap: "12px" },
  listItem: { padding: "10px 0", borderBottom: "1px solid #eee", fontSize: "15px", color: "#333" },

  // 🌟 เพิ่มสไตล์ใหม่สำหรับลิงก์กิจกรรมล่าสุด เพื่อให้เวลาเอาเมาส์ไปชี้ (Hover) แล้วแสดงว่าเป็นปุ่มกดได้
  linkItem: {
    display: "block",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    fontSize: "15px",
    color: "#333",
    textDecoration: "none",
    transition: "background-color 0.2s",
    cursor: "pointer"
  },

  itemDate: { fontSize: "13px", color: "#888888", float: "right" },
  emptyText: { color: "#999999", textAlign: "center", padding: "20px" },
};

export default Home;