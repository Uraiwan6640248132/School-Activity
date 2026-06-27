import React, { useState, useEffect } from "react";
import axios from "axios";

const HomeAdmin = () => {
  const [users, setUsers] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [studentCount, setStudentCount] = useState(0); // 🆕 เพิ่ม State เก็บจำนวนนักเรียน
  const [loading, setLoading] = useState(true);

  // 🌐 ฟังก์ชันดึงข้อมูลจาก API ผู้ใช้งาน, กิจกรรม และ นักเรียน
  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        const userRes = await axios.get("http://localhost:3001/users");
        const activityRes = await axios.get("http://localhost:3001/activities");
        
        // 🆕 ดึงข้อมูลจาก API นักเรียนเพิ่มเติม เพื่อเอายอดรวมทั้งหมด
        const studentRes = await axios.get("http://localhost:3001/students").catch(() => ({ data: [] }));

        // เก็บข้อมูลลงใน State
        setUsers(userRes.data);
        setStudentCount(studentRes.data.length || 0);

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

  // 🧮 ฟังก์ชันคำนวณหาจำนวนสมาชิกแต่ละบทบาทจากข้อมูลที่ดึงมา
  const teacherCount = users.filter(user => user.Role === "ครูผู้สอน").length;
  const parentCount = users.filter(user => user.Role === "ผู้ปกครอง").length;
  const activityCount = latestActivities.length; // หรือใช้ค่าเต็มของตารางกิจกรรมถ้าหลังบ้านส่งมาทั้งหมด

  return (
    <div style={styles.container}>

      {/* 📊 🆕 เพิ่มส่วนแผงบล็อกสรุปจำนวนด้านบน 4 การ์ด ตามรูปของพี่ */}
      <div style={styles.topCardsGrid}>
        
        <div style={styles.summaryCard}>
          <span style={styles.cardLabel}>นักเรียน</span>
          <span style={styles.cardValue}>{loading ? "..." : `${studentCount} คน`}</span>
        </div>

        <div style={styles.summaryCard}>
          <span style={styles.cardLabel}>ครูผู้สอน</span>
          <span style={styles.cardValue}>{loading ? "..." : `${teacherCount} คน`}</span>
        </div>

        <div style={styles.summaryCard}>
          <span style={styles.cardLabel}>ผู้ปกครอง</span>
          <span style={styles.cardValue}>{loading ? "..." : `${parentCount} คน`}</span>
        </div>

        <div style={styles.summaryCard}>
          <span style={styles.cardLabel}>กิจกรรม</span>
          <span style={styles.cardValue}>{loading ? "..." : `${activityCount} กิจกรรม`}</span>
        </div>

      </div>

      {/* 📋 บล็อกแผงข้อมูลแสดงความเคลื่อนไหว (ตารางด้านล่าง) */}
      <div style={styles.bottomMainGrid}>

        {/* 🎯 บล็อกซ้าย: "ผู้ใช้งาน" */}
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

        {/* บล็อกขวา: กิจกรรมล่าสุด */}
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

// 🎨 ปรับปรุงรายละเอียด Styles ให้มีกล่องการ์ดสรุปด้านบน
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Kanit', sans-serif, Arial"
  },
  // 🆕 สไตล์สำหรับ Grid การ์ดด้านบน 4 ช่อง
  topCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    width: '100%'
  },
  // 🆕 รูปแบบกล่องการ์ดสีขาว ขอบมน ตามแบบของหน้าครู
  summaryCard: {
    background: '#ffffff',
    padding: '20px 24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  cardLabel: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#000000'
  },
  cardValue: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '2px'
  },
  bottomMainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    minHeight: '380px'
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
    marginLeft: "auto"
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '14px',
    textAlign: 'center',
    padding: '40px 0'
  },
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