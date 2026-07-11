import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ⚡️ นำเข้า useNavigate เพื่อใช้เปลี่ยนหน้าใน React

const HomeParent = () => {
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // ⚡️ เรียกใช้งานฟังก์ชันสำหรับเปลี่ยนหน้า

  // 🛠️ จุดแก้ไขสำคัญ: ดึงข้อมูลห้องเรียนจากก้อนวัตถุ user เหมือนหน้าอื่น ๆ ไม่ไปดึง parentClass ตรง ๆ แล้ว
  const getParentClass = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // ดึง Class_level หรือ class_level ออกมา ถ้าไม่มีให้ default เป็น อนุบาล1 ห้องปกติ
        return userData.Class_level || userData.class_level || "อนุบาล1 ห้องปกติ";
      } catch (e) {
        console.error("Error parsing user data for class level:", e);
        return "อนุบาล1 ห้องปกติ";
      }
    }
    return "อนุบาล1 ห้องปกติ";
  };

  const parentClass = getParentClass();

  useEffect(() => {
    const fetchParentHomeData = async () => {
      try {
        const activityRes = await axios.get("http://localhost:3001/activities");
        const notificationRes = await axios.get("http://localhost:3001/notifications");

        // กรองข้อมูลการบ้านให้ตรงกับห้องเรียน (ลบช่องว่างออกอัตโนมัติเพื่อป้องกันอักษรเขยื้อนไม่ตรงกัน)
        const filteredHomework = notificationRes.data.filter((item) => {
          if (!item.Class_level || !parentClass) return false;

          const dbClass = item.Class_level.toString().replace(/\s+/g, '');
          const currentParentClass = parentClass.toString().replace(/\s+/g, '');

          return dbClass.includes(currentParentClass) || currentParentClass.includes(dbClass);
        });

        // ดึงมาแสดงผลฝั่งละ 4 รายการล่าสุด
        setLatestNotifications(filteredHomework.slice(0, 4));
        setLatestActivities(activityRes.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน้าผู้ปกครอง:", error);
        setLoading(false);
      }
    };

    fetchParentHomeData();
  }, [parentClass]);

  // 📚 ฟังก์ชันเมื่อคลิกการบ้าน
  const handleHomeworkClick = (id) => {
    navigate(`/homework/${id}`);
    console.log("ดูการบ้าน ID:", id);
  };

  // 📍 ฟังก์ชันเมื่อคลิกกิจกรรม
  const handleActivityClick = (id) => {
    navigate(`/activity/${id}`);
    console.log("ดูกิจกรรม ID:", id);
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentRow}>

        {/* กล่องซ้าย: การแจ้งเตือนการบ้านล่าสุด */}
        <div style={styles.infoBox}>
          <div style={styles.headerRow}>
            <div style={styles.iconCircleBlue}>📚</div>
            <h3 style={styles.boxTitle}>
              การบ้านล่าสุด
            </h3>
          </div>

          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูลการบ้าน...</p>
            ) : latestNotifications.length > 0 ? (
              latestNotifications.map((item, index) => (
                <div
                  key={index}
                  style={styles.listItem}
                  onClick={() => handleHomeworkClick(item.id || index)}
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
                <p style={styles.emptyText}>ไม่มีข้อมูลการบ้านของห้องเรียนนี้</p>
              </div>
            )}
          </div>
        </div>

        {/* กล่องขวา: กิจกรรมล่าสุด */}
        <div style={styles.infoBox}>
          <div style={styles.headerRow}>
            <div style={styles.iconCircleOrange}>📍</div>
            <h3 style={styles.boxTitle}>กิจกรรมล่าสุดของโรงเรียน</h3>
          </div>

          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูลกิจกรรม...</p>
            ) : latestActivities.length > 0 ? (
              latestActivities.map((item, index) => (
                <div
                  key={index}
                  style={styles.listItem}
                  onClick={() => handleActivityClick(item.id || index)}
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

// 🎨 Minimalist Soft-Blue Styles
const styles = {
  container: { padding: "40px 24px", fontFamily: "'Inter', 'Kanit', sans-serif", backgroundColor: "#dff3ff 48%", minHeight: "100vh", width: "100%", boxSizing: "border-box" },
  contentRow: { display: "flex", gap: "24px", width: "100%", maxWidth: "1200px", margin: "0 auto", flexWrap: "wrap" },
  infoBox: { flex: 1, minWidth: "320px", backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.05), 0 8px 10px -6px rgba(14, 165, 233, 0.05)", border: "1px solid #f0f4f8", display: "flex", flexDirection: "column", minHeight: "420px" },
  headerRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" },
  iconCircleBlue: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" },
  iconCircleOrange: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" },
  boxTitle: { fontSize: "18px", fontWeight: "600", margin: 0, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" },
  listBox: { display: "flex", flexDirection: "column", gap: "14px", flex: 1 },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", backgroundColor: "#f8fafc", borderRadius: "12px", fontSize: "15px", border: "1px solid transparent", cursor: "pointer" },
  itemMainText: { display: "flex", flexDirection: "column", gap: "4px", flex: 1, paddingRight: "12px" },
  subjectText: { color: "#1e293b", fontSize: "15px", fontWeight: "500" },
  detailsText: { color: "#64748b", fontSize: "13px" },
  itemBadge: { fontSize: "12px", color: "#0284c7", backgroundColor: "#81bbe1", padding: "4px 10px", borderRadius: "8px", fontWeight: "500", whiteSpace: "nowrap" },
  locationBadge: { fontSize: "12px", color: "#ea580c", backgroundColor: "#ffedd5", padding: "4px 10px", borderRadius: "8px", fontWeight: "500", whiteSpace: "nowrap" },
  emptyState: { display: "flex", alignItems: "center", justifyContent: "center", flex: 1 },
  emptyText: { color: "#94a3b8", textAlign: "center", fontSize: "14px" },
};

export default HomeParent;