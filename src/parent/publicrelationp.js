import React, { useState, useEffect } from 'react';

export default function PublicRelationsP() {
  const [prList, setPrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const API_URL = 'http://localhost:3001/api/publicrelations';
  const USERS_API_URL = 'http://localhost:3001/users';
  // 🌟 เพิ่ม URL สำหรับดึงรูปภาพจากหลังบ้านให้ถูกต้อง
  const BACKEND_IMAGE_URL = "http://localhost:3001/uploads/";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 🔒 ปิดปากคำเตือน ESLint ป้องกันหน้าเว็บค้างวนลูปเรียบร้อย

  return (
    <div style={styles.container}>
      {/* ส่วนหัวแสดงผลสำหรับผู้ปกครอง */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ margin: 0, color: '#0369a1' }}>ข่าวสารประชาสัมพันธ์</h2>
        </div>
      </div>

      {loading && <p style={styles.statusText}>กำลังอัปเดตประกาศข่าวสารใหม่ล่าสุด...</p>}

      {/* ส่วนแสดงรายการการ์ดข่าวสาร */}
      <div style={styles.cardContainer}>
        {prList.map((item, index) => {
          const prId = item.PublicRelation_id || item.publicrelation_id || index;
          const activityName = item.Name_activity || item.name_activity || 'ไม่ได้ระบุชื่อกิจกรรม';
          const prLocation = item.Location || item.location || 'ไม่ได้ระบุสถานที่';
          const prDetail = item.Detail || item.detail || '';

          // 🌟 จัดการแปลง URL รูปภาพประชาสัมพันธ์ให้ถูกต้องสมบูรณ์
          const currentImage = item.Image;
          const finalImageUrl = currentImage
            ? (currentImage.startsWith("data:") || currentImage.startsWith("http") ? currentImage : `${BACKEND_IMAGE_URL}${currentImage}`)
            : null;

          return (
            <div key={prId} style={styles.card}>
              <div style={styles.cardLeft}>
                {finalImageUrl ? (
                  <img
                    src={finalImageUrl}
                    alt="public relations"
                    style={styles.cardImg}
                    onError={(e) => {
                      // ดักกรณีไฟล์รูปภาพในโฟลเดอร์พัง ให้แสดงข้อความแทนรูปภาพ
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent && !parent.querySelector('.img-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'img-fallback';
                        fallback.innerText = 'โหลดรูปภาพไม่สำเร็จ';
                        Object.assign(fallback.style, styles.cardImgPlaceholder);
                        parent.insertBefore(fallback, parent.firstChild);
                      }
                    }}
                  />
                ) : (
                  <div style={styles.cardImgPlaceholder}>ไม่มีรูปภาพประกอบ</div>
                )}

                <div style={styles.cardInfo}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong style={styles.topicText}>ชื่อเรื่อง:</strong> {activityName}
                  </div>
                  <div><strong>วัน/เดือน/ปี:</strong> {item.Date ? item.Date.substring(0, 10) : '-'}</div>
                  <div><strong>สถานที่:</strong> {prLocation}</div>

                  {/* บล็อกรายละเอียดข่าวสาร */}
                  <div style={styles.detailBox}>
                    <strong>รายละเอียด:</strong> {prDetail || '-'}
                  </div>

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

        {/* ดักกรณีไม่มีข้อมูลข่าว */}
        {!loading && prList.length === 0 && (
          <div style={styles.emptyState}>
            ยังไม่มีข่าวประชาสัมพันธ์ใหม่จากคุณครูในขณะนี้
          </div>
        )}
      </div>
    </div>
  );
}

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
  detailBox: { marginTop: '6px', marginBottom: '6px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #2563eb', fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }
};