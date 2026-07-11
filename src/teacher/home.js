import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [counts, setCounts] = useState({ students: 0, users: 0, activities: 0 });
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const studentRes = await axios.get("http://localhost:3001/api/students");
        const userRes = await axios.get("http://localhost:3001/users");
        const activityRes = await axios.get("http://localhost:3001/activities");
        const notificationRes = await axios.get("http://localhost:3001/notifications");

        /// เปลี่ยนตรงท่อนกรองข้อมูล (Filter) ใน useEffect ให้เป็นแบบนี้:
        const teacherUsers = userRes.data.filter(user => user.Role === "ครูผู้สอน");

        setCounts({
          students: studentRes.data.length,
          users: teacherUsers.length, // ✅ ตัวเลขครูจะขึ้นถูกต้องตามฐานข้อมูลแล้วครับ
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
      {/* 🟢 ส่วนบน: เมนูการ์ดตัวนับจำนวน */}
      <div style={styles.cardRow}>
        {/* การ์ดนักเรียน */}
        <div onClick={() => navigate("/students")} style={styles.card}>
          <div>
            <p style={styles.cardLabel}>นักเรียนทั้งหมด</p>
            <h3 style={styles.cardValue}>
              {loading ? <span style={styles.loadingDots}>...</span> : counts.students}
              {!loading && <span style={styles.cardUnit}> คน</span>}
            </h3>
          </div>
          <div style={styles.iconCircleBlue}>🧑‍🎓</div>
        </div>

        {/* การ์ดครูผู้สอน */}
        <div onClick={() => navigate("/users")} style={styles.card}>
          <div>
            <p style={styles.cardLabel}>ครูผู้สอน</p>
            <h3 style={styles.cardValue}>
              {loading ? <span style={styles.loadingDots}>...</span> : counts.users}
              {!loading && <span style={styles.cardUnit}> คน</span>}
            </h3>
          </div>
          <div style={styles.iconCircleGreen}>👩‍🏫</div>
        </div>

        {/* การ์ดกิจกรรม */}
        <div onClick={() => navigate("/activity")} style={styles.card}>
          <div>
            <p style={styles.cardLabel}>กิจกรรมระบบ</p>
            <h3 style={styles.cardValue}>
              {loading ? <span style={styles.loadingDots}>...</span> : counts.activities}
              {!loading && <span style={styles.cardUnit}> กิจกรรม</span>}
            </h3>
          </div>
          <div style={styles.iconCircleOrange}>🎯</div>
        </div>
      </div>

      {/* 🔵 ส่วนล่าง: กล่องข้อมูลอัปเดตล่าสุด */}
      <div style={styles.contentRow}>

        {/* กล่องซ้าย: การแจ้งเตือนการบ้านล่าสุด */}
        <div style={styles.infoBox}>
          <div style={styles.headerRow}>
            <div style={styles.iconCircleBlue}>📚</div>
            <div style={styles.headerTitleWrapper}>
              <h3 style={styles.boxTitle}>การแจ้งเตือนการบ้านล่าสุด</h3>
              <span onClick={() => navigate("/notification")} style={styles.viewAllLink}>ดูทั้งหมด</span>
            </div>
          </div>

          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูลการบ้าน...</p>
            ) : latestNotifications.length > 0 ? (
              latestNotifications.map((item, index) => (
                <div
                  key={index}
                  style={styles.listItem}
                  onClick={() => navigate(`/homework/${item.id || index}`)}
                >
                  <div style={styles.itemMainText}>
                    <strong style={styles.subjectText}>{item.Subject}</strong>
                    <span style={styles.detailsText}>{item.Details || "ไม่มีรายละเอียด"}</span>
                  </div>
                  <span style={styles.itemBadge}>ชั้น {item.Class_level}</span>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>ไม่มีข้อมูลการบ้านล่าสุด</p>
              </div>
            )}
          </div>
        </div>

        {/* กล่องขวา: กิจกรรมล่าสุด */}
        <div style={styles.infoBox}>
          <div style={styles.headerRow}>
            <div style={styles.iconCircleOrange}>📍</div>
            <h3 style={styles.boxTitle}>กิจกรรมล่าสุด</h3>
          </div>

          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูลกิจกรรม...</p>
            ) : latestActivities.length > 0 ? (
              latestActivities.map((item, index) => (
                <div
                  key={index}
                  style={styles.listItem}
                  onClick={() => navigate(`/activity/${item.id || index}`)}
                >
                  <div style={styles.itemMainText}>
                    <strong style={styles.subjectText}>{item.Name_activity}</strong>
                  </div>
                  <span style={styles.locationBadge}>
                    {item.Location || "ไม่ระบุสถานที่"}
                  </span>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>ไม่มีข้อมูลกิจกรรมล่าสุด</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// 🎨 Styles
const styles = {
  container: {
    padding: "40px 24px",
    fontFamily: "'Inter', 'Kanit', sans-serif",
    backgroundColor: "rgba(223, 243, 255, 0.48)",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box"
  },
  cardRow: {
    display: "flex",
    gap: "24px",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto 30px auto",
    flexWrap: "wrap"
  },
  card: {
    flex: 1,
    minWidth: "250px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.05), 0 8px 10px -6px rgba(14, 165, 233, 0.05)",
    border: "1px solid #f0f4f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    color: "inherit"
  },
  cardLabel: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 6px 0",
    fontWeight: "500"
  },
  cardValue: {
    fontSize: "28px",
    fontWeight: "700",
    margin: 0,
    color: "#0f172a"
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
  contentRow: {
    display: "flex",
    gap: "24px",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap"
  },
  infoBox: {
    flex: 1,
    minWidth: "320px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.05), 0 8px 10px -6px rgba(14, 165, 233, 0.05)",
    border: "1px solid #f0f4f8",
    display: "flex",
    flexDirection: "column",
    minHeight: "420px"
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "16px",
    width: "100%"
  },
  headerTitleWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1
  },
  iconCircleBlue: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#e0f2fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px"
  },
  iconCircleGreen: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px"
  },
  iconCircleOrange: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#ffedd5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px"
  },
  boxTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    color: "#0f172a"
  },
  viewAllLink: {
    fontSize: "13px",
    color: "#0284c7",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "none"
  },
  listBox: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    flex: 1
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    fontSize: "15px",
    border: "1px solid transparent",
    cursor: "pointer"
  },
  itemMainText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    paddingRight: "12px"
  },
  subjectText: {
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "500"
  },
  detailsText: {
    color: "#64748b",
    fontSize: "13px"
  },
  itemBadge: {
    fontSize: "12px",
    color: "#0284c7",
    backgroundColor: "#e0f2fe",
    padding: "4px 10px",
    borderRadius: "8px",
    fontWeight: "500",
    whiteSpace: "nowrap"
  },
  locationBadge: {
    fontSize: "12px",
    color: "#ea580c",
    backgroundColor: "#ffedd5",
    padding: "4px 10px",
    borderRadius: "8px",
    fontWeight: "500",
    whiteSpace: "nowrap"
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "14px"
  }
};

export default Home;