import React, { useState, useEffect } from 'react';

export default function ActivityP() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State สำหรับจัดการหน้าต่าง Modal เปิดดูภาพทั้งหมดตามดีไซน์
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const API_URL = 'http://localhost:3001/api/activity';

  // 🔄 ดึงข้อมูลกิจกรรมที่ดึงมาจากฐานข้อมูลเดียวกับที่คุณครูลงไว้
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // 📦 แปลง JSON string รูปภาพในฐานข้อมูลกลับมาเป็น Array
  const parseImages = (imgString) => {
    try {
      const parsed = JSON.parse(imgString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return imgString ? [imgString] : []; // ดักเคสรูปเก่าที่มีรูปเดียว
    }
  };

  // 📥 ฟังก์ชันดาวน์โหลดรูปภาพเดี่ยว
  const downloadSingleImage = (base64Data, index, activityName) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = `กิจกรรม_${activityName}_รูปที่_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 📥 ฟังก์ชันดาวน์โหลดรูปภาพทั้งหมดของกิจกรรมนั้นๆ (วนดาวน์โหลดทีละภาพให้ทันที)
  const downloadAllImages = (imagesArray, activityName) => {
    imagesArray.forEach((img, idx) => {
      setTimeout(() => {
        downloadSingleImage(img, idx, activityName);
      }, idx * 300); // ดีเลย์ป้องกันเบราว์เซอร์บล็อกการโหลดรัวๆ
    });
  };

  // เปิดดู Pop-up แสดงภาพทั้งหมด
  const openImageModal = (activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.tabBadge}>กิจกรรม</span>
        <h2 style={styles.title}>จัดการข้อมูลกิจกรรม</h2>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>กำลังโหลดภาพกิจกรรมล่าสุด...</p>}

      {/* Grid รายการการ์ดกิจกรรมของผู้ปกครอง */}
      <div style={styles.cardGrid}>
        {activities.map((item) => {
          const imgList = parseImages(item.Image);
          const previewImg = imgList.length > 0 ? imgList[0] : null;

          return (
            <div key={item.Activity_id} style={styles.card}>
              {/* ส่วนคลิกเพื่อดูรูปภาพทั้งหมด */}
              <div style={styles.imageZone} onClick={() => openImageModal(item)}>
                {previewImg ? (
                  <img src={previewImg} alt="preview" style={styles.mainImg} />
                ) : (
                  <div style={styles.noImgPlaceholder}>ไม่มีรูปภาพ</div>
                )}
                <span style={styles.viewAllBadge}>ดูภาพทั้งหมด</span>
              </div>

              {/* รายละเอียดเนื้อหากิจกรรม */}
              <div style={styles.contentZone}>
                <h3 style={styles.activityName}>{item.Name_activity}</h3>
                <p style={styles.detailText}>
                  ผู้บันทึกภาพ: {item.User_id ? `คุณครู (ID: ${item.User_id})` : 'ไม่ระบุชื่อ'} <br />
                  วัน/เดือน/ปี: {item.Date ? item.Date.substring(0, 10) : '-'} <br />
                  สถานที่: {item.Location}
                </p>

                {/* แถวล่าง: แสดงจำนวนรูปภาพ และ ปุ่มดาวน์โหลดทั้งหมด */}
                <div style={styles.cardFooter}>
                  <span style={styles.imageCountBadge}>{imgList.length} ภาพ</span>
                  <button 
                    style={styles.downloadAllBtn}
                    onClick={() => downloadAllImages(imgList, item.Name_activity)}
                  >
                    📥 ดาวน์โหลดทั้งหมด
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 หน้าต่าง Modal Pop-up แสดงรูปทั้งหมดตามเงื่อนไขที่พี่ส่งมา */}
      {isModalOpen && selectedActivity && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedActivity.Name_activity}</h3>
                <small style={{ color: '#666' }}>ภาพทั้งหมดในกิจกรรมนี้</small>
              </div>
              <button style={styles.closeBtn} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {/* ตารางสี่เหลี่ยมวนลูปรูปภาพย่อยทั้งหมดตามแบบ */}
            <div style={styles.modalGrid}>
              {parseImages(selectedActivity.Image).map((imgData, idx) => (
                <div key={idx} style={styles.gridItem}>
                  <img src={imgData} alt="sub" style={styles.gridImg} />
                  {/* ปุ่มดาวน์โหลดเล็กๆ ใต้รูปภาพแต่ละภาพ */}
                  <button 
                    style={styles.singleDownloadBtn}
                    onClick={() => downloadSingleImage(imgData, idx, selectedActivity.Name_activity)}
                    title="ดาวน์โหลดรูปนี้"
                  >
                    📥
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 Styles ตกแต่งตามแบบ Mockup ฝั่งผู้ปกครอง
const styles = {
  container: { padding: '20px', fontFamily: 'sans-serif', background: '#f9fafb', minHeight: '100vh' },
  header: { marginBottom: '25px' },
  tabBadge: { display: 'inline-block', border: '1px solid #ccc', padding: '4px 15px', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', marginBottom: '8px' },
  title: { margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#222' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: { border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  imageZone: { position: 'relative', height: '180px', backgroundColor: '#eaeaea', cursor: 'pointer' },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
  noImgPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' },
  viewAllBadge: { position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.85)', padding: '4px 10px', borderRadius: '15px', fontSize: '11px', color: '#555', border: '1px solid #ccc' },
  contentZone: { padding: '15px' },
  activityName: { margin: '0 0 10px 0', fontSize: '18px', color: '#111' },
  detailText: { fontSize: '13px', color: '#666', lineHeight: '1.6', margin: '0 0 15px 0' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '12px' },
  imageCountBadge: { border: '1px solid #ddd', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', color: '#777', backgroundColor: '#f5f5f5' },
  downloadAllBtn: { border: '1px solid #333', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  
  // CSS สำหรับ Pop-up Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '550px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' },
  modalGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  gridItem: { position: 'relative', border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden', paddingBottom: '100%', height: 0 },
  gridImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  singleDownloadBtn: { position: 'absolute', bottom: '5px', right: '5px', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', padding: '2px 4px', fontSize: '11px' }
};