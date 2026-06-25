import React, { useEffect, useState } from "react";
import axios from "axios";

// 🌟 สร้างไอคอน SVG สำหรับเรียกใช้งานซ้ำเพื่อความสะอาดของโค้ด
const DownloadIcon = ({ size = 16, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

function ActivityP() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const API_URL = "http://127.0.0.1:3001/activities";

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' }
      });
      setActivities(res.data);
    } catch (err) {
      console.error("ดึงข้อมูลกิจกรรมมาแสดงฝั่งผู้ปกครองไม่สำเร็จ:", err);
    }
  };

  const parseActivityImages = (imageStr) => {
    try {
      const parsed = JSON.parse(imageStr);
      return Array.isArray(parsed) ? parsed : (imageStr ? [imageStr] : []);
    } catch (e) {
      return imageStr ? [imageStr] : [];
    }
  };

  const downloadSingleImage = (base64Data, index, activityName) => {
    if (!base64Data) return alert("ไม่พบข้อมูลรูปภาพ");
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = `กิจกรรม_${activityName || "school"}_รูปที่_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = (e, imagesArray, activityName) => {
    e.stopPropagation();
    if (imagesArray.length === 0) return alert("ไม่มีรูปภาพให้ดาวน์โหลด");
    
    if (window.confirm(`คุณต้องการดาวน์โหลดรูปภาพทั้งหมดจำนวน ${imagesArray.length} รูปใช่หรือไม่?`)) {
      imagesArray.forEach((imgData, idx) => {
        setTimeout(() => {
          downloadSingleImage(imgData, idx, activityName);
        }, idx * 250);
      });
    }
  };

  const filteredActivities = activities.filter((item) => {
    return (
      item.Name_activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Photographer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "ไม่ระบุวันเวลา";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={page.container}>
      <div style={page.wrapper}>

        {/* ส่วนหัวหน้าจอ */}
        <div style={page.header}>
          <div>
            <button style={page.titleBtn}>กิจกรรม</button>
            <h1 style={page.pageTitle}>จัดการข้อมูลกิจกรรม</h1>
          </div>
        </div>

        {/* ช่องค้นหา */}
        <div style={page.searchContainer}>
          <input
            type="text"
            placeholder="ค้นหากิจกรรม"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={page.searchInput}
          />
        </div>

        {/* แผง Grid รายการการ์ดกิจกรรม */}
        <div style={page.grid} className="parent-responsive-grid">
          {filteredActivities.length === 0 ? (
            <p style={page.noData}>ไม่มีข้อมูลกิจกรรมประชาสัมพันธ์ในขณะนี้</p>
          ) : (
            filteredActivities.map((item) => {
              const imgList = parseActivityImages(item.Image);
              const previewImg = imgList.length > 0 ? imgList[0] : null;

              return (
                <div 
                  key={item.Activity_id} 
                  style={page.card} 
                  onClick={() => { setSelectedActivity(item); setShowModal(true); }}
                >
                  {/* รูปภาพพรีวิวหลักของการ์ด */}
                  <div style={page.cardImageContainer}>
                    {previewImg ? (
                      <img src={previewImg} alt={item.Name_activity} style={page.cardImage} />
                    ) : (
                      <div style={page.cardImagePlaceholder}>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>ไม่มีรูปภาพประกอบ</span>
                      </div>
                    )}
                  </div>

                  {/* ส่วนเนื้อหารายละเอียดกิจกรรม */}
                  <div style={page.cardContent}>
                    <h2 style={page.cardTitle}>{item.Name_activity || "ชื่อกิจกรรม"}</h2>
                    <div style={page.infoList}>
                      <p style={page.infoText}>ผู้บันทึกภาพ: {item.Photographer || "คุณครูประจำชั้น"}</p>
                      <p style={page.infoText}>วัน/เดือน/ปี: {formatDate(item.Activity_date)}</p>
                      <p style={page.infoText}>สถานที่: {item.Location || "โรงเรียน"}</p>
                    </div>
                  </div>

                  {/* แถวล่างสุด: ป้ายจำนวนรูปภาพ และ ปุ่มดาวน์โหลดทั้งหมด */}
                  <div style={page.actionsRow}>
                    <span style={page.imageCountBadge}>{imgList.length} ภาพ</span>
                    <button 
                      onClick={(e) => downloadAllImages(e, imgList, item.Name_activity)} 
                      style={page.downloadAllBtn}
                    >
                      <DownloadIcon size={14} color="#1e293b" />
                      <span style={{ marginLeft: "6px" }}>ดาวน์โหลดทั้งหมด</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* 🌟 หน้าต่างป๊อปอัป Modal */}
        {showModal && selectedActivity && (
          <div style={modal.overlay} onClick={() => setShowModal(false)}>
            <div style={modal.box} onClick={(e) => e.stopPropagation()}>
              
              <div style={modal.header}>
                <div>
                  <h2 style={modal.mainTitle}>{selectedActivity.Name_activity}</h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>คลิกไอคอนที่มุมภาพเพื่อดาวน์โหลดรายรูป</p>
                </div>
                <button onClick={() => setShowModal(false)} style={modal.closeBtn}>✕</button>
              </div>

              <div style={modal.galleryGrid}>
                {parseActivityImages(selectedActivity.Image).map((imgUrl, idx) => (
                  <div key={idx} style={modal.galleryItem}>
                    <img src={imgUrl} alt={`sub-img-${idx}`} style={modal.galleryImage} />
                    {/* เปลี่ยนไอคอนดาวน์โหลดรูปเดี่ยวเป็น SVG มินิมอล */}
                    <button 
                      onClick={() => downloadSingleImage(imgUrl, idx, selectedActivity.Name_activity)}
                      style={modal.singleDownloadBtn}
                      title="ดาวน์โหลดรูปภาพนี้"
                    >
                      <DownloadIcon size={12} color="#475569" />
                    </button>
                  </div>
                ))}
                
                {parseActivityImages(selectedActivity.Image).length === 0 && (
                  <p style={{ gridColumn: "span 4", textAlign: "center", color: "#94a3b8", padding: "20px 0" }}>ไม่มีรูปภาพในอัลบั้มนี้</p>
                )}
              </div>

            </div>
          </div>
        )}

        <style>{`
          @media (max-width: 1100px) {
            .parent-responsive-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
          @media (max-width: 768px) {
            .parent-responsive-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .parent-responsive-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

      </div>
    </div>
  );
}

const page = {
  container: { backgroundColor: "#f8fafc", minHeight: "100vh", padding: "1.5rem", display: "flex", justifyContent: "center", color: "#334155", fontFamily: "'Inter', 'Kanit', sans-serif" },
  wrapper: { width: "100%", maxWidth: "1200px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" },
  titleBtn: { backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", padding: "4px 16px", borderRadius: "6px", fontSize: "14px", marginBottom: "6px", cursor: "default" },
  pageTitle: { fontSize: "18px", fontWeight: "normal", paddingLeft: "2px", margin: 0, color: "#1e293b" },
  searchContainer: { marginBottom: "1.5rem" },
  searchInput: { width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  noData: { gridColumn: "span 4", textAlign: "center", padding: "3rem 0", fontSize: "14px", color: "#94a3b8" },
  
  card: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", display: "flex", flexDirection: "column", minHeight: "280px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", cursor: "pointer", transition: "transform 0.2s" },
  cardImageContainer: { width: "100%", height: "130px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f1f5f9" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  cardImagePlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  cardContent: { padding: "12px 14px 4px 14px" },
  cardTitle: { fontSize: "16px", fontWeight: "600", margin: "0 0 6px 0", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  infoList: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" },
  infoText: { color: "#64748b", fontSize: "13px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  
  actionsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", padding: "0 14px 14px 14px" },
  imageCountBadge: { border: "1px solid #e2e8f0", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", color: "#475569", backgroundColor: "#f8fafc" },
  
  // 🌟 ปรับแต่งสไตล์ปุ่มดาวน์โหลดหลักให้มี Flexbox รองรับไอคอน SVG อย่างสวยงาม
  downloadAllBtn: { 
    backgroundColor: "#ffffff", 
    border: "1px solid #cbd5e1", 
    color: "#1e293b", 
    fontSize: "12px", 
    fontWeight: "500", 
    padding: "6px 12px", 
    borderRadius: "6px", 
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
  }
};

const modal = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999, backdropFilter: "blur(2px)" },
  box: { background: "#ffffff", padding: "24px", borderRadius: "12px", width: "500px", maxWidth: "90%", maxHeight: "85vh", overflowY: "auto", display: "flex", flexDirection: "column", boxSizing: "border-box", border: "1px solid #e2e8f0", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" },
  mainTitle: { fontSize: "18px", fontWeight: "600", margin: 0, color: "#1e293b" },
  closeBtn: { background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer", padding: "0 4px" },
  
  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "4px" },
  galleryItem: { position: "relative", width: "100%", paddingBottom: "100%", height: 0, borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" },
  galleryImage: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" },
  
  // 🌟 ปรับปุ่มดาวน์โหลดเดี่ยวบนรูปภาพให้กลม มินิมอล มีมิติขึ้นเมื่อได้ไอคอน SVG ไปใส่
  singleDownloadBtn: { 
    position: "absolute", 
    bottom: "6px", 
    right: "6px", 
    backgroundColor: "rgba(255, 255, 255, 0.95)", 
    border: "1px solid #e2e8f0", 
    borderRadius: "50%", // ปรับเป็นวงกลมให้ดูโมเดิร์นขึ้น
    width: "28px", 
    height: "28px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    cursor: "pointer", 
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)" 
  }
};

export default ActivityP;