import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; 

const HomeAdmin = () => {
  // 📊 สร้าง State สำหรับเก็บข้อมูลนับจำนวน
  const [counts, setCounts] = useState({ students: 0, users: 0, activities: 0, parents: 0 });
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌐 ฟังก์ชันดึงข้อมูลจาก API หลังบ้านทั้งหมดมารวมกันในครั้งเดียว
  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        const studentRes = await axios.get("http://localhost:3001/api/students");
        const userRes = await axios.get("http://localhost:3001/users");
        const activityRes = await axios.get("http://localhost:3001/activities");
        const notificationRes = await axios.get("http://localhost:3001/notifications");

        // สมมติคัดกรองข้อมูลผู้ปกครองจาก API users (ถ้ามีแบ่ง role ชัดเจน) 
        // หรือถ้าไม่มีข้อมูลให้ปล่อยนับจำนวนรวมของ userRes ไปพรางก่อนได้ครับ
        const parentUsers = userRes.data.filter(u => String(u.role || u.Role || u.status).toLowerCase() === 'parent');

        setCounts({
          students: studentRes.data.length || 0,
          users: userRes.data.length || 0,
          activities: activityRes.data.length || 0,
          parents: parentUsers.length || 0, // หรือใส่ดึงความยาวตรงๆ ตามโครงสร้างหลังบ้าน
        });

        // ดึงรายการแจ้งเตือนการบ้านและกิจกรรม ล่าสุด 4 อันดับแรกมาแสดงผลด้านล่าง
        setLatestNotifications(notificationRes.data.slice(0, 4));
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
      
      {/* 📊 ส่วนที่ 1: การ์ดสรุปจำนวนด้านบน พร้อมผูก Link ลิงก์ย้ายหน้าตามสิทธิ์แอดมิน */}
      <div style={styles.topCardsGrid}>
        <Link to="/students" style={styles.statCard}>
          <span style={styles.statLabel}>นักเรียน</span>
          <h2 style={styles.statValue}>
            {loading ? "..." : counts.students} <span style={styles.unitText}>คน</span>
          </h2>
        </Link>
        
        <Link to="/user_information" style={styles.statCard}>
          <span style={styles.statLabel}>ครูผู้สอน</span>
          <h2 style={styles.statValue}>
            {loading ? "..." : counts.users} <span style={styles.unitText}>คน</span>
          </h2>
        </Link>
        
        <Link to="/activity" style={styles.statCard}>
          <span style={styles.statLabel}>กิจกรรม</span>
          <h2 style={styles.statValue}>
            {loading ? "..." : counts.activities} <span style={styles.unitText}>งาน</span>
          </h2>
        </Link>
        
        <Link to="/user_information" style={styles.statCard}>
          <span style={styles.statLabel}>ผู้ปกครอง</span>
          <h2 style={styles.statValue}>
            {loading ? "..." : counts.parents} <span style={styles.unitText}>คน</span>
          </h2>
        </Link>
      </div>

      {/* 📋 ส่วนที่ 2: บล็อกแผงข้อมูลแสดงความเคลื่อนไหวอัปเดตล่าสุด */}
      <div style={styles.bottomMainGrid}>
        
        {/* บล็อกซ้าย: การบ้านล่าสุด */}
        <div style={styles.infoBlock}>
          <h3 style={styles.blockTitle}>การบ้านล่าสุด</h3>
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
              <p style={styles.emptyText}>ไม่มีข้อมูลการบ้านในระบบขณะนี้</p>
            )}
          </div>
        </div>
        
        {/* บล็อกขวา: กิจกรรมล่าสุด */}
        <div style={styles.infoBlock}>
          <h3 style={styles.blockTitle}>กิจกรรมล่าสุด</h3>
          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>กำลังโหลดข้อมูล...</p>
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

// 🎨 ปรับปรุงรายละเอียด CSS Styles ให้ดูทันสมัยและรองรับการเป็น Link กดคลิกได้
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "sans-serif"
  },
  topCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px'
  },
  statCard: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textDecoration: 'none', // ตัดเส้นใต้ข้อความ Link
    color: 'inherit',
    cursor: 'pointer'
  },
  statLabel: {
    fontSize: '15px',
    color: '#475569',
    fontWeight: '600'
  },
  statValue: {
    margin: 0,
    fontSize: '26px',
    color: '#1e293b',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px'
  },
  unitText: {
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#94a3b8'
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
    color: "#333333"
  },
  itemDate: {
    fontSize: "13px",
    color: "#888888",
    float: "right"
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '14px',
    textAlign: 'center',
    padding: '40px 0'
  }
};

export default HomeAdmin;