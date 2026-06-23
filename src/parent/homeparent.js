import React, { useState, useEffect } from "react";
import axios from "axios";

const HomeParent = () => {
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌐 ดึงข้อมูลกิจกรรมและการบ้านล่าสุดจาก API
  useEffect(() => {
    const fetchParentHomeData = async () => {
      try {
        const activityRes = await axios.get("http://localhost:3001/activities");
        const notificationRes = await axios.get("http://localhost:3001/notifications");

        // ดึงข้อมูลการบ้านล่าสุด และ กิจกรรมล่าสุด มาแสดงฝั่งละ 4 รายการ
        setLatestNotifications(notificationRes.data.slice(0, 4));
        setLatestActivities(activityRes.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน้าผู้ปกครอง:", error);
        setLoading(false);
      }
    };

    fetchParentHomeData();
  }, []);

  return (
    <div style={styles.container}>
      {/* 🔵 ส่วนล่าง: กล่องข้อมูลอัปเดตล่าสุด 2 ฝั่งแยกตามภาพดีไซน์ผู้ปกครองของคุณ */}
      <div style={styles.contentRow}>
        
        {/* กล่องซ้าย: การแจ้งเตือนการบ้านล่าสุด */}
        <div style={styles.infoBox}>
          <h3 style={styles.boxTitle}>การแจ้งเตือนการบ้านล่าสุด</h3>
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
          <h3 style={styles.boxTitle}>กิจกรรมล่าสุด</h3>
          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูลกิจกรรม...</p>
            ) : latestActivities.length > 0 ? (
              latestActivities.map((item, index) => (
                <div key={index} style={styles.listItem}>
                  <strong>{item.Name_activity}</strong>
                  <span style={styles.itemDate}> 📍 {item.Location || "ไม่ระบุสถานที่"}</span>
                </div>
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
  container: { 
    padding: "20px 10px", 
    fontFamily: "sans-serif", 
    backgroundColor: "transparent",
    width: "100%",
    boxSizing: "border-box"
  },
  contentRow: { 
    display: "flex", 
    gap: "30px",
    width: "100%"
  },
  infoBox: { 
    flex: 1, 
    backgroundColor: "#ffffff", 
    border: "1px solid #ccc", 
    borderRadius: "8px", 
    padding: "25px", 
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)", 
    minHeight: "400px" 
  },
  boxTitle: { 
    fontSize: "18px", 
    fontWeight: "bold", 
    margin: "0 0 20px 0", 
    color: "#333333" 
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





export default HomeParent;