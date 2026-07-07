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
      {/* 🟢 ส่วนบน: เมนูการ์ดตัวนับจำนวน (ใช้ระบบ Stylesheet แบบเดียวกับกล่องข้อมูล) */}
      <div style={styles.cardRow}>
        {/* การ์ดนักเรียน */}
        <Link to="/students" style={styles.card}>
          <div>
            <p style={styles.cardLabel}>นักเรียนทั้งหมด</p>
            <h3 style={styles.cardValue}>
              {loading ? <span style={styles.loadingDots}>...</span> : counts.students}
              {!loading && <span style={styles.cardUnit}> คน</span>}
            </h3>
          </div>
          <div style={styles.cardIcon}>🧑‍🎓</div>
        </Link>

        {/* การ์ดครูผู้สอน */}
        <Link to="/users" style={styles.card}>
          <div>
            <p style={styles.cardLabel}>ครูผู้สอน</p>
            <h3 style={styles.cardValue}>
              {loading ? <span style={styles.loadingDots}>...</span> : counts.users}
              {!loading && <span style={styles.cardUnit}> คน</span>}
            </h3>
          </div>
          <div style={styles.cardIcon}>👩‍🏫</div>
        </Link>

        {/* การ์ดกิจกรรม */}
        <Link to="/activity" style={styles.card}>
          <div>
            <p style={styles.cardLabel}>กิจกรรมระบบ</p>
            <h3 style={styles.cardValue}>
              {loading ? <span style={styles.loadingDots}>...</span> : counts.activities}
              {!loading && <span style={styles.cardUnit}> กิจกรรม</span>}
            </h3>
          </div>
          <div style={styles.cardIcon}>🎯</div>
        </Link>
      </div>

      {/* 🔵 ส่วนล่าง: กล่องข้อมูลอัปเดตล่าสุด 2 ฝั่งสไตล์เดียวกับ HomeParent */}
      <div style={styles.contentRow}>

        {/* กล่องซ้าย: การแจ้งเตือนการบ้านล่าสุด */}
        <div style={styles.infoBox}>
          <div style={styles.boxHeader}>
            <h3 style={styles.boxTitle}>📝 การแจ้งเตือนการบ้านล่าสุด</h3>
            <Link to="/notification" style={styles.viewAllLink}>ดูทั้งหมด</Link>
          </div>

          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูลการบ้าน...</p>
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

        {/* กล่องขวา: กิจกรรมล่าสุด */}
        <div style={styles.infoBox}>
          <div style={styles.boxHeader}>
            <h3 style={styles.boxTitle}>🚩 กิจกรรมล่าสุด</h3>
          </div>

          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูลกิจกรรม...</p>
            ) : latestActivities.length > 0 ? (
              latestActivities.map((item, index) => (
                <Link to="/activity" key={index} style={styles.listItemLink}>
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

// 💡 ยกรีเซ็ตสไตล์ของ HomeParent มาผสมผสานกับสไตล์ของการ์ดตัวนับแบบ CSS-in-JS ทั้งหมด
const styles = {
  container: {
    padding: "20px 10px",
    fontFamily: "sans-serif",
    backgroundColor: "transparent",
    width: "100%",
    boxSizing: "border-box"
  },
  cardRow: {
    display: "flex",
    gap: "20px",
    width: "100%",
    marginBottom: "30px",
    flexWrap: "wrap"
  },
  card: {
    flex: 1,
    minWidth: "250px",
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "between",
    textDecoration: "none",
    color: "inherit"
  },
  cardLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "0 0 5px 0",
    fontWeight: "500"
  },
  cardValue: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0,
    color: "#333333"
  },
  cardUnit: {
    fontSize: "14px",
    color: "#94a3b8",
    fontWeight: "normal",
    marginLeft: "4px"
  },
  loadingDots: {
    fontSize: "20px",
    color: "#cbd5e1"
  },
  cardIcon: {
    fontSize: "24px",
    marginLeft: "auto"
  },
  contentRow: {
    display: "flex",
    gap: "30px",
    width: "100%",
    flexWrap: "wrap"
  },
  infoBox: {
    flex: 1,
    minWidth: "300px",
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "25px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
    minHeight: "400px"
  },
  boxHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "0 0 20px 0"
  },
  boxTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    color: "#333333"
  },
  viewAllLink: {
    fontSize: "13px",
    color: "#0284c7",
    textDecoration: "none",
    fontWeight: "bold"
  },
  listBox: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  listItem: {
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "15px",
    color: "#475569"
  },
  listItemLink: {
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "15px",
    color: "#475569",
    textDecoration: "none",
    display: "block"
  },
  itemDate: {
    fontSize: "13px",
    color: "#94a3b8",
    float: "right"
  },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "40px"
  },
};

export default Home;