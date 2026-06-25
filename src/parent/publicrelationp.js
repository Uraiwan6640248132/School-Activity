import React, { useState, useEffect } from 'react';

export default function PublicRelationsP() {
  const [prList, setPrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const API_URL = 'http://localhost:3001/api/publicrelations';
  const USERS_API_URL = 'http://localhost:3001/users';

  // ดึงรายชื่อผู้ใช้งานเพื่อนำมาแมตช์หาชื่อคุณครูในกรณีที่ CreatedBy_Name ไม่มีค่าส่งมา
  const fetchUsersData = async () => {
    try {
      const res = await fetch(USERS_API_URL);
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching users list:", err);
    }
  };

  const fetchPRData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setPrList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData(); 
    fetchPRData();
  }, []);

  return (
    <div style={styles.container}>
      {/* ส่วนหัวแสดงผลสำหรับผู้ปกครอง (ไม่มีปุ่มเพิ่มประชาสัมพันธ์) */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>ข่าวสารประชาสัมพันธ์</h2>
          <small style={{ color: '#666' }}>ข้อมูลกิจกรรมส่งตรงจากคุณครูและโรงเรียน</small>
        </div>
        <div style={styles.badgeParent}>ฝั่งผู้ปกครอง</div>
      </div>

      {loading && <p style={styles.statusText}>กำลังอัปเดตประกาศข่าวสารใหม่ล่าสุด...</p>}

      {/* ส่วนแสดงรายการการ์ดข่าวสาร (ไม่มีกลุ่มปุ่มแก้ไข-ลบข้อมูล) */}
      <div style={styles.cardContainer}>
        {prList.map((item, index) => {
          // ดักคีย์ตัวเล็กตัวใหญ่จากฐานข้อมูลเพื่อไม่ให้ระบบพัง
          const prId = item.PublicRelation_id || item.publicrelation_id || index;
          const activityName = item.Name_activity || item.name_activity || 'ไม่ได้ระบุชื่อกิจกรรม';
          const prLocation = item.Location || item.location || 'ไม่ได้ระบุสถานที่';
          
          // 🌟 เพิ่มการดักรับค่ารายละเอียด (Detail) จากฐานข้อมูลทั้งตัวเล็กและตัวใหญ่
          const prDetail = item.Detail || item.detail || '';

          return (
            <div key={prId} style={styles.card}>
              <div style={styles.cardLeft}>
                {item.Image ? (
                  <img src={item.Image} alt="public relations" style={styles.cardImg} />
                ) : (
                  <div style={styles.cardImgPlaceholder}>ไม่มีรูปภาพประกอบ</div>
                )}
                
                <div style={styles.cardInfo}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong style={styles.topicText}>ชื่อเรื่อง:</strong> {activityName}
                  </div>
                  <div><strong>วัน/เดือน/ปี:</strong> {item.Date ? item.Date.substring(0, 10) : '-'}</div>
                  <div><strong>สถานที่:</strong> {prLocation}</div>
                  
                  {/* 🌟 ส่วนแสดงรายละเอียดเพิ่มเติม (จะแสดงต่อเมื่อมีข้อมูล Detail กรอกมาจากฝั่งครู) */}
                  {prDetail && (
                    <div style={styles.detailBox}>
                      <strong>รายละเอียดข่าวสาร:</strong> <span style={{ color: '#555' }}>{prDetail}</span>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '6px' }}>
                    <strong>📢 ประชาสัมพันธ์โดย:</strong>{' '}
                    <span style={styles.authorText}>
                      {item.CreatedBy_Name || (users.find(u => Number(u.User_id || u.id) === Number(item.User_id))?.Name) || `คุณครูประจำชั้น (ID: ${item.User_id})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* ดักกรณีที่ระบบยังไม่มีข้อมูลข่าวประชาสัมพันธ์ใดๆ */}
        {!loading && prList.length === 0 && (
          <div style={styles.emptyState}>
            ยังไม่มีข่าวประชาสัมพันธ์ใหม่จากคุณครูในขณะนี้
          </div>
        )}
      </div>
    </div>
  );
}

// Styles สไตล์สำหรับการแสดงผลแบบอ่านอย่างเดียว (สะอาดตา และปลอดภัยสำหรับผู้ปกครอง)
const styles = {
  container: { padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
  badgeParent: { padding: '5px 14px', backgroundColor: '#eef2f7', color: '#4a5568', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  statusText: { fontSize: '14px', color: '#666', textAlign: 'center', margin: '20px 0' },
  cardContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', padding: '16px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  cardLeft: { display: 'flex', gap: '20px', alignItems: 'center', width: '100%' },
  cardImg: { width: '110px', height: '110px', borderRadius: '6px', border: '1px solid #eaeaea', objectFit: 'cover' },
  cardImgPlaceholder: { width: '110px', height: '110px', borderRadius: '6px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#aaa', backgroundColor: '#fafafa', textAlign: 'center' },
  cardInfo: { fontSize: '14px', lineHeight: '1.7', color: '#444', flex: 1 },
  topicText: { fontSize: '16px', color: '#1e3a8a', fontWeight: 'bold' },
  authorText: { color: '#2563eb', fontWeight: 'bold' },
  emptyState: { color: '#888', textAlign: 'center', marginTop: '40px', padding: '30px', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: '#fafafa' },
  
  // 🌟 สไตล์กล่องข้อความรายละเอียดเพิ่มเติม
  detailBox: { 
    marginTop: '8px', 
    marginBottom: '4px',
    padding: '10px', 
    backgroundColor: '#f8fafc', 
    borderRadius: '6px', 
    borderLeft: '4px solid #2563eb',
    fontSize: '13px',
    lineHeight: '1.5'
  }
};