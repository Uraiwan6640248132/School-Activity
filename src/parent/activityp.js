import React, { useEffect, useState } from "react";
import axios from "axios";

function ActivityP() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🌟 State สำหรับเปิด-ปิด Modal และเก็บข้อมูลกิจกรรมที่ถูกคลิกเลือก
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // 🔗 ดึงข้อมูลจาก API เส้นเดียวกันกับที่คุณครูบันทึก
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

  // 📦 ฟังก์ชันแปลงข้อมูลรูปภาพใน DB (JSON String) ออกมาเป็น Array []
  const parseActivityImages = (imageStr) => {
    try {
      const parsed = JSON.parse(imageStr);
      return Array.isArray(parsed) ? parsed : (imageStr ? [imageStr] : []);
    } catch (e) {
      return imageStr ? [imageStr] : []; // รองรับกรณีข้อมูลรูปภาพระบบเก่าที่มีรูปเดียว
    }
  };

  // 📥 ฟังก์ชันดาวน์โหลดรูปภาพเดี่ยว (ทีละรูป) จาก Base64 Data URL
  const downloadSingleImage = (base64Data, index, activityName) => {
    if (!base64Data) return alert("ไม่พบข้อมูลรูปภาพ");
    const link = document.createElement("a");
    link.href = base64Data;
    // ตั้งชื่อไฟล์ดาวน์โหลดให้อัตโนมัติแยกตามกิจกรรมและลำดับรูป
    link.download = `กิจกรรม_${activityName || "school"}_รูปที่_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 📥 ฟังก์ชันดาวน์โหลดรูปภาพ "ทั้งหมด" ในกิจกรรมนั้น ๆ พร้อมกันในคลิกเดียว
  const downloadAllImages = (e, imagesArray, activityName) => {
    e.stopPropagation(); // ป้องกันไม่ให้แผง Modal เด้งซ้อนขึ้นมาตอนกดดาวน์โหลดหน้าการ์ด
    if (imagesArray.length === 0) return alert("ไม่มีรูปภาพให้ดาวน์โหลด");
    
    if (window.confirm(`คุณต้องการดาวน์โหลดรูปภาพทั้งหมดจำนวน ${imagesArray.length} รูปใช่หรือไม่?`)) {
      imagesArray.forEach((imgData, idx) => {
        // ใช้ setTimeout หน่วงเวลาเล็กน้อย เพื่อไม่ให้ Browser บล็อกการดาวน์โหลดแบบรัว ๆ
        setTimeout(() => {
          downloadSingleImage(imgData, idx, activityName);
        }, idx * 250);
      });
    }
  };

  // 🔍 ฟังก์ชันกรองค้นหาข้อมูลกิจกรรม
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

        {/* ส่วนหัวหน้าจอ ดีไซน์คลีนๆ แบบฝั่งผู้ปกครอง */}
        <div style={page.header}>
          <div>
            <button style={page.titleBtn}>กิจกรรม</button>
            <h1 style={page.pageTitle}>จัดการข้อมูลกิจกรรม</h1>
          </div>
        </div>

        {/* ช่องค้นหาทริปหรือกิจกรรมของลูก */}
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
                  onClick={() => { setSelectedActivity(item); setShowModal(true); }} // คลิกที่ตัวการ์ดเพื่อเปิดดูรูปทั้งหมด
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

                  {/* แถวล่างสุด: ป้ายจำนวนรูปภาพ และ ปุ่มดาวน์โหลดทั้งหมด ตาม UX เป๊ะๆ */}
                  <div style={page.actionsRow}>
                    <span style={page.imageCountBadge}>{imgList.length} ภาพ</span>
                    <button 
                      onClick={(e) => downloadAllImages(e, imgList, item.Name_activity)} 
                      style={page.downloadAllBtn}
                    >
                      📥 ดาวน์โหลดทั้งหมด
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* 🌟 หน้าต่างป๊อปอัป Modal กางแกลเลอรีรูปภาพย่อยแบบ Grid 4 คอลัมน์ */}
        {showModal && selectedActivity && (
          <div style={modal.overlay} onClick={() => setShowModal(false)}>
            <div style={modal.box} onClick={(e) => e.stopPropagation()}>
              
              {/* ส่วนหัวป๊อปอัป */}
              <div style={modal.header}>
                <div>
                  <h2 style={modal.mainTitle}>{selectedActivity.Name_activity}</h2>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>คลิกไอคอนที่มุมภาพเพื่อดาวน์โหลดรายรูป</p>
                </div>
                <button onClick={() => setShowModal(false)} style={modal.closeBtn}>✕</button>
              </div>

              {/* Grid 4 คอลัมน์ วนรูปภาพย่อยทั้งหมดตามแบบดีไซน์ผู้ปกครอง */}
              <div style={modal.galleryGrid}>
                {parseActivityImages(selectedActivity.Image).map((imgUrl, idx) => (
                  <div key={idx} style={modal.galleryItem}>
                    <img src={imgUrl} alt={`sub-img-${idx}`} style={modal.galleryImage} />
                    {/* ไอคอนปุ่มดาวน์โหลดรูปภาพชิ้นนี้แบบเดี่ยว ๆ ที่มุมขวาล่าง */}
                    <button 
                      onClick={() => downloadSingleImage(imgUrl, idx, selectedActivity.Name_activity)}
                      style={modal.singleDownloadBtn}
                      title="ดาวน์โหลดรูปภาพนี้"
                    >
                      📥
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

        {/* สไตล์การรองรับหน้าจอ Responsive (Responsive Breakpoints) */}
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

// 🎨 Styles จัดวางตำแหน่งและสีสันตาม UX/UI ที่กำหนด
const page = {
  container: { backgroundColor: "#ffffff", minHeight: "100vh", padding: "1.5rem", display: "flex", justifyContent: "center", color: "#334155", fontFamily: "'Inter', 'Kanit', sans-serif" },
  wrapper: { width: "100%", maxWidth: "1200px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" },
  titleBtn: { backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", padding: "4px 16px", borderRadius: "6px", fontSize: "14px", marginBottom: "6px", cursor: "default" },
  pageTitle: { fontSize: "18px", fontWeight: "normal", paddingLeft: "2px", margin: 0, color: "#1e293b" },
  searchContainer: { marginBottom: "1.5rem" },
  searchInput: { width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  noData: { gridColumn: "span 4", textAlign: "center", padding: "3rem 0", fontSize: "14px", color: "#94a3b8" },
  
  // โครงสร้างการ์ดกิจกรรมฝั่งผู้ปกครอง (เน้นคลิกเพื่อขยายดูภาพ)
  card: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", display: "flex", flexDirection: "column", minHeight: "280px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.01)", cursor: "pointer", transition: "transform 0.2s" },
  cardImageContainer: { width: "100%", height: "130px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  cardImagePlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  cardContent: { padding: "12px 14px 4px 14px" },
  cardTitle: { fontSize: "16px", fontWeight: "600", margin: "0 0 6px 0", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  infoList: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" },
  infoText: { color: "#64748b", fontSize: "13px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  
  // ส่วนท้ายของการ์ด: ป้ายจำนวนภาพ และ ปุ่มดาวน์โหลดทั้งหมด
  actionsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", padding: "0 14px 14px 14px" },
  imageCountBadge: { border: "1px solid #cbd5e1", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", color: "#475569", backgroundColor: "#f8fafc" },
  downloadAllBtn: { backgroundColor: "#ffffff", border: "1px solid #1e293b", color: "#1e293b", fontSize: "12px", fontWeight: "bold", padding: "5px 12px", borderRadius: "6px", cursor: "pointer" }
};

const modal = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 },
  // กล่องป๊อปอัปขยายภาพกว้าง 500px ตามสัดส่วน UX
  box: { background: "#ffffff", padding: "24px", borderRadius: "12px", width: "500px", maxWidth: "90%,", maxHeight: "85vh", overflowY: "auto", display: "flex", flexDirection: "column", boxSizing: "border-box", border: "1px solid #e2e8f0", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" },
  mainTitle: { fontSize: "18px", fontWeight: "600", margin: 0, color: "#1e293b" },
  closeBtn: { background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer", padding: "0 4px" },
  
  // แผงรูปแกลเลอรีแบบ Grid 4 คอลัมน์
  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "4px" },
  galleryItem: { position: "relative", width: "100%", paddingBottom: "100%", height: 0, borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" },
  galleryImage: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" },
  
  // ไอคอนดาวน์โหลดดักที่มุมล่างขวาของแต่ละภาพ
  singleDownloadBtn: { position: "absolute", bottom: "4px", right: "4px", backgroundColor: "rgba(255, 255, 255, 0.9)", border: "1px solid #cbd5e1", borderRadius: "4px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }
};

export default ActivityP;