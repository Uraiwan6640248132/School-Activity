import React, { useState, useEffect } from "react";
import axios from "axios";

const HomeAdmin = () => {
  const [users, setUsers] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌐 ฟังก์ชันดึงข้อมูลจาก API ผู้ใช้งาน และ กิจกรรม
  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        const userRes = await axios.get("http://localhost:3001/users");
        const activityRes = await axios.get("http://localhost:3001/activities");

        // เก็บรายชื่อผู้ใช้งานทั้งหมด
        setUsers(userRes.data);

        // ดึงรายการกิจกรรม ล่าสุด 4 อันดับแรกมาแสดงผลด้านขวา
        setLatestActivities(activityRes.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน้าเดชบอร์ดแอดมิน:", error);
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  return (
    <div style={styles.container}>

      {/* 📋 บล็อกแผงข้อมูลแสดงความเคลื่อนไหว (ส่วนการ์ดสรุปจำนวน 4 อันด้านบนถูกลบออกแล้ว) */}
      <div style={styles.bottomMainGrid}>

        {/* 🎯 ปรับปรุงบล็อกซ้าย: เปลี่ยนจาก การบ้านล่าสุด เป็น "ผู้ใช้งาน" */}
        <div style={styles.infoBlock}>
          <h3 style={styles.blockTitle}>ผู้ใช้งาน</h3>
          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูลผู้ใช้งาน...</p>
            ) : users.length > 0 ? (
              users.map((user, index) => {
                const isSuspended = user.Role === 'ถูกระงับสิทธิ์';
                return (
                  <div key={index} style={styles.listItem}>
                    <strong style={{ color: isSuspended ? '#94a3b8' : '#333333' }}>{user.Name}</strong>
                    <span style={styles.itemDate}>
                      {/* แสดงสถานะหรือบทบาทของผู้ใช้แอดมิน/ครู/ผู้ปกครอง */}
                      <span style={styles.roleBadge(user.Role)}>
                        {user.Role || "ทั่วไป"}
                      </span>
                    </span>
                  </div>
                );
              })
            ) : (
              <p style={styles.emptyText}>ไม่มีข้อมูลผู้ใช้งานในระบบขณะนี้</p>
            )}
          </div>
        </div>

        {/* บล็อกขวา: กิจกรรมล่าสุด (ยังคงไว้ตามเดิม) */}
        <div style={styles.infoBlock}>
          <h3 style={styles.blockTitle}>กิจกรรมล่าสุด</h3>
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
              <p style={styles.emptyText}>ไม่มีกิจกรรมใหม่ในขณะนี้</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

// 🎨 ปรับปรุงรายละเอียด Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Kanit', sans-serif, Arial"
  },
  bottomMainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    minHeight: '380px',
    marginTop: '20px' // เพิ่มระยะด้านบนให้ดูสมดุลหลังจากลบการ์ดออก
  },
  infoBlock: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column'
  },
  blockTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#000000',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '12px'
  },
  listBox: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%"
  },
  listItem: {
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    fontSize: "15px",
    color: "#333333",
    display: "flex",
    justifyContent: "between",
    alignItems: "center"
  },
  itemDate: {
    fontSize: "13px",
    color: "#888888",
    marginLeft: "auto" // ดันสถานะไปชิดขวาสุดให้สวยงามเหมือนเดิม
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '14px',
    textAlign: 'center',
    padding: '40px 0'
  },
  // 🎨 ฟังก์ชันช่วยเปลี่ยนสีตัวอักษรและพื้นหลังของสิทธิ์ในหน้า Dashboard ให้อ่านง่ายขึ้น
  roleBadge: (role) => {
    let baseStyle = {
      padding: "3px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "500",
      display: "inline-block"
    };
    if (role === "แอดมิน") {
      return { ...baseStyle, backgroundColor: "#fee2e2", color: "#ef4444" };
    } else if (role === "ครูผู้สอน") {
      return { ...baseStyle, backgroundColor: "#dbeafe", color: "#2563eb" };
    } else if (role === "ผู้ปกครอง") {
      return { ...baseStyle, backgroundColor: "#dcfce7", color: "#16a34a" };
    } else if (role === "ถูกระงับสิทธิ์") {
      return { ...baseStyle, backgroundColor: "#e2e8f0", color: "#64748b" };
    }
    return { ...baseStyle, backgroundColor: "#f1f5f9", color: "#475569" };
  }
};

export default HomeAdmin;