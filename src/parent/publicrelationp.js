import React, { useState, useEffect } from 'react';

export default function PublicRelationsP() {
  const [prList, setPrList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔗 จุดเชื่อมโยง: ใช้ API เส้นเดียวกันกับฝั่งครู เป๊ะๆ เพื่อดึงข้อมูลชุดเดียวกันมาแสดงผล
  const API_URL = 'http://localhost:3001/api/publicrelations';

  const fetchPRData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setPrList(data); // เก็บข้อมูลประชาสัมพันธ์ที่ครูบันทึกไว้ลง state
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRData(); // สั่งทำงานดึงข้อมูลทันทีที่เปิดหน้านี้
  }, []);

  return (
    <div style={styles.container}>
      {/* ส่วนหัวแสดงผลสำหรับผู้ปกครอง */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>ข่าวสารประชาสัมพันธ์</h2>
          <small style={{ color: '#666' }}>ข้อมูลกิจกรรมส่งตรงจากคุณครูและโรงเรียน</small>
        </div>
        <div style={styles.badgeParent}>ฝั่งผู้ปกครอง</div>
      </div>

      {loading && <p style={styles.statusText}>กำลังอัปเดตข่าวประกาศใหม่ล่าสุด...</p>}

      {/* ส่วนแสดงรายการการ์ดข่าวสาร (ไม่มีปุ่ม เพิ่ม ลบ แก้ไข) */}
      <div style={styles.cardContainer}>
        {prList.map((item) => (
          <div key={item.PublicRelation_id} style={styles.card}>
            <div style={styles.cardLeft}>
              
              {/* ตรวจสอบรูปภาพที่คุณครูอัปโหลดเข้ามา */}
              {item.Image ? (
                <img src={item.Image} alt="public relations" style={styles.cardImg} />
              ) : (
                <div style={styles.cardImgPlaceholder}>ไม่มีรูปภาพประกอบ</div>
              )}
              
              {/* แสดงข้อมูลข่าวสารที่ดึงมาจากฝั่งครูประกาศ */}
              <div style={styles.cardInfo}>
                <strong style={styles.topicText}>ชื่อเรื่อง:</strong> {item.Name_activity} <br />
                <strong>วัน/เดือน/ปี:</strong> {item.Date ? item.Date.substring(0, 10) : '-'} <br />
                <strong>สถานที่:</strong> {item.Location} <br />
                <span style={styles.authorText}>📢 ประกาศโดย: คุณครูประจำชั้น (ID: {item.User_id})</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* ดักกรณีที่คุณครูยังไม่ได้กดประกาศข่าวใดๆ เลยในระบบ */}
        {!loading && prList.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
            ยังไม่มีข่าวประชาสัมพันธ์ใหม่จากคุณครูในขณะนี้
          </p>
        )}
      </div>
    </div>
  );
}

// Styles สไตล์กล่องและการจัดวาง (ไม่มีปุ่ม Action รบกวนสายตา)
const styles = {
  container: { padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
  badgeParent: { padding: '5px 14px', backgroundColor: '#eef2f7', color: '#4a5568', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  statusText: { fontSize: '14px', color: '#666', textAlign: 'center', margin: '20px 0' },
  cardContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', padding: '16px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  cardLeft: { display: 'flex', gap: '20px', alignItems: 'center' },
  cardImg: { width: '110px', height: '110px', borderRadius: '6px', border: '1px solid #eaeaea', objectFit: 'cover' },
  cardImgPlaceholder: { width: '110px', height: '110px', borderRadius: '6px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#aaa', backgroundColor: '#fafafa' },
  cardInfo: { fontSize: '14px', lineHeight: '1.7', color: '#444' },
  topicText: { fontSize: '15px', color: '#111', fontWeight: 'bold' },
  authorText: { fontSize: '12px', color: '#888', display: 'inline-block', marginTop: '6px' }
};