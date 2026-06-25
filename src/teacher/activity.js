import React, { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [nameActivity, setNameActivity] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [location, setLocation] = useState("");
  const [activityDate, setActivityDate] = useState("");

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 🌟 State สำหรับเปิดดูป๊อปอัปคลังรูปภาพแบบ Grid View
  const [galleryTitle, setGalleryTitle] = useState(""); // เก็บชื่อกิจกรรมมาแสดงเป็นหัวข้อป๊อปอัป
  const [activeGalleryImages, setActiveGalleryImages] = useState(null); // เก็บ Array รูปภาพทั้งหมดที่จะเอามาเรียง

  // 🌟 ----------------- เพิ่ม State สำหรับระบบสไลด์ภาพขนาดใหญ่ซ้อนอีกชั้น (LightBox) -----------------
  const [lightBoxImage, setLightBoxImage] = useState(null); // เก็บรูปภาพที่กำลังขยายใหญ่
  const [currentLightBoxIndex, setCurrentLightBoxIndex] = useState(0); // เก็บตำแหน่งดัชนีภาพที่กำลังเปิดดู
  // -----------------------------------------------------------------------------------------

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
      console.error("ดึงข้อมูลไม่สำเร็จ! ตรวจสอบการเชื่อมต่อ API:", err);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // 1. แสดงรูปภาพพรีวิวตัวอย่างทันที
      const objectUrls = files.map(file => URL.createObjectURL(file));
      setPreviewImages(objectUrls);

      // 2. ฟังก์ชันย่อขนาดภาพอัตโนมัติด้วย HTML5 Canvas ก่อนแปลงเป็น Base64
      const resizeAndCompress = (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;

              // กำหนดความกว้างสูงสุดไม่เกิน 1024px (ชัดเพียงพอสำหรับเปิดดูในป๊อปอัป)
              const MAX_WIDTH = 1024;
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, width, height);

              // บีบอัดคุณภาพรูปภาพเหลือ 70% (ช่วยลดขนาดไฟล์จากหลาย MB เหลือไม่กี่ KB แต่ภาพยังชัดสวย)
              const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
              resolve(compressedBase64);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      };

      // วนลูปบีบอัดรูปภาพผู้ปกครองทุกภาพที่เลือกมาพร้อมกันเยอะ ๆ
      const compressPromises = files.map(file => resizeAndCompress(file));
      Promise.all(compressPromises).then(base64Strings => {
        setImages(base64Strings); // บันทึกก้อนข้อมูลที่ย่อขนาดแล้วเตรียมส่งไปหลังบ้าน
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nameActivity) {
      return alert("กรุณากรอกชื่อกิจกรรม");
    }

    let finalImages = null;
    if (images.length > 0) {
      finalImages = images;
    } else if (editId && previewImages.length > 0) {
      finalImages = previewImages;
    }

    const requestData = {
      Name_activity: nameActivity,
      Photographer: photographer,
      Location: location,
      Activity_date: activityDate ? activityDate : null,
      User_id: 1,
      Image: finalImages ? JSON.stringify(finalImages) : null 
    };

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, requestData);
        alert("แก้ไขข้อมูลกิจกรรมสำเร็จ");
      } else {
        await axios.post(API_URL, requestData);
        alert("เพิ่มข้อมูลกิจกรรมสำเร็จ");
      }
      clearForm();
      fetchActivities();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchActivities();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (item) => {
    setEditId(item.Activity_id);
    setNameActivity(item.Name_activity || "");
    setPhotographer(item.Photographer || "");
    setLocation(item.Location || "");
    setActivityDate(item.Activity_date ? item.Activity_date.split("T")[0] : "");

    setImages([]);

    let oldImages = [];
    const rawImage = item.Image || item.Images;

    if (rawImage) {
      if (typeof rawImage === "string") {
        if (rawImage.startsWith("[")) {
          try {
            oldImages = JSON.parse(rawImage);
          } catch (e) {
            oldImages = [rawImage];
          }
        } else {
          oldImages = [rawImage];
        }
      } else if (Array.isArray(rawImage)) {
        oldImages = rawImage;
      }
    }
    
    setPreviewImages(oldImages);
    setShowForm(true);
  };

  const clearForm = () => {
    setNameActivity("");
    setPhotographer("");
    setLocation("");
    setActivityDate("");
    setImages([]);
    setPreviewImages([]);
    setEditId(null);
    setShowForm(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "ไม่ระบุวันเวลา";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredActivities = activities.filter((item) => {
    return (
      item.Name_activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Photographer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={page.container}>
      <div style={page.wrapper}>

        <div style={page.header}>
          <div>
            <button style={page.titleBtn}>กิจกรรม</button>
            <h1 style={page.pageTitle}>จัดการข้อมูลกิจกรรม</h1>
          </div>
          <button onClick={() => { if (showForm) clearForm(); else setShowForm(true); }} style={page.toggleBtn}>
            {showForm ? "✕ ปิดแผงคุม" : "➕ เพิ่มกิจกรรมใหม่"}
          </button>
        </div>

        <div style={page.searchContainer}>
          <input
            type="text"
            placeholder="ค้นหากิจกรรม"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={page.searchInput}
          />
        </div>

        {showForm && (
          <div style={modal.overlay}>
            <form onSubmit={handleSubmit} style={modal.box}>
              <div style={modal.header}>
                <h2 style={modal.mainTitle}>{editId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรม"}</h2>
                <button type="button" onClick={clearForm} style={modal.closeBtn}>✕</button>
              </div>

              <div style={modal.imageUploadWrapper}>
                <label style={modal.imageSelectorLabel}>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <svg width="24" height="24" fill="none" stroke="#64748b" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span style={{ marginTop: "4px", fontSize: "11px", color: "#64748b" }}>อัปโหลดรูป</span>
                  </div>
                </label>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flex: 1, marginLeft: "10px" }}>
                  {previewImages.map((src, index) => (
                    <div key={index} style={{ width: "45px", height: "45px", borderRadius: "6px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <img src={src} alt={`preview-${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={modal.field}>
                <label style={modal.label}>ชื่อกิจกรรม</label>
                <input type="text" placeholder="กรอกชื่อกิจกรรม" value={nameActivity} onChange={(e) => setNameActivity(e.target.value)} style={modal.input} />
              </div>

              <div style={modal.field}>
                <label style={modal.label}>ผู้บันทึกภาพ</label>
                <input type="text" placeholder="กรอกชื่อผู้บันทึกภาพ" value={photographer} onChange={(e) => setPhotographer(e.target.value)} style={modal.input} />
              </div>

              <div style={modal.field}>
                <label style={modal.label}>วันที่</label>
                <input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} style={modal.input} />
              </div>

              <div style={modal.field}>
                <label style={modal.label}>สถานที่</label>
                <input type="text" placeholder="กรอกสถานที่" value={location} onChange={(e) => setLocation(e.target.value)} style={modal.input} />
              </div>

              <button type="submit" style={modal.saveButton}>บันทึก</button>
            </form>
          </div>
        )}

        <div style={page.grid} className="activity-responsive-grid">
          {filteredActivities.length === 0 ? (
            <p style={page.noData}>ไม่พบข้อมูลกิจกรรมในระบบ</p>
          ) : (
            filteredActivities.map((item) => {
              let itemImages = [];
              const targetField = item.Image || item.Images;

              if (targetField) {
                if (typeof targetField === "string") {
                  if (targetField.startsWith("[")) {
                    try {
                      itemImages = JSON.parse(targetField);
                    } catch (e) {
                      itemImages = [targetField];
                    }
                  } else {
                    itemImages = [targetField];
                  }
                } else if (Array.isArray(targetField)) {
                  itemImages = targetField;
                }
              }

              return (
                <div key={item.Activity_id} style={page.card}>

                  {/* 🛠️ เมื่อกดคลิกที่พื้นที่รูปภาพปก จะทำการเปิดกล่อง Grid คลังรูปภาพทั้งหมด */}
                  <div 
                    style={{ ...page.cardImageContainer, cursor: itemImages.length > 0 ? "pointer" : "default" }}
                    onClick={() => {
                      if (itemImages.length > 0) {
                        setGalleryTitle(item.Name_activity || "คลังรูปภาพกิจกรรม");
                        setActiveGalleryImages(itemImages);
                      }
                    }}
                  >
                    {itemImages.length > 0 && itemImages[0] ? (
                      <div style={{ width: "100%", height: "100%", position: "relative" }}>
                        <img src={itemImages[0]} alt={item.Name_activity} style={page.cardImage} />
                        {itemImages.length > 1 && (
                          <div style={{ position: "absolute", bottom: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>
                            +{itemImages.length - 1} รูป
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={page.cardImagePlaceholder}>
                        <svg style={{ width: 36, height: 36, color: "#cbd5e1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div style={page.cardContent}>
                    <h2 style={page.cardTitle} title={item.Name_activity}>
                      {item.Name_activity || "ชื่อกิจกรรม"}
                    </h2>
                    <div style={page.infoList}>
                      <p style={page.infoText}>📸 ผู้บันทึกภาพ: {item.Photographer || "ไม่ระบุชื่อ"}</p>
                      <p style={page.infoText}>📅 วัน/เดือน/ปี: {formatDate(item.Activity_date)}</p>
                      <p style={page.infoText}>📍 สถานที่: {item.Location || "ไม่ระบุสถานที่"}</p>
                    </div>
                  </div>

                  <div style={page.actionsRow}>
                    <button onClick={() => handleEdit(item)} style={page.editBtn}>แก้ไข</button>
                    <button onClick={() => handleDelete(item.Activity_id)} style={page.deleteBtn}>ลบ</button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* 🌟 ป๊อปอัปดีไซน์คลังภาพแบบ Grid View (ไม่มีปุ่มดาวน์โหลด ป้องกันภาพหน้าผู้ปกครอง) */}
        {activeGalleryImages && activeGalleryImages.length > 0 && (
          <div style={gridGalleryModal.overlay} onClick={() => setActiveGalleryImages(null)}>
            <div style={gridGalleryModal.box} onClick={(e) => e.stopPropagation()}>
              
              {/* ส่วนหัวแสดงชื่อกิจกรรม และปุ่มปิดสีเทาตัวใหญ่ตัว 'X' ด้านขวา */}
              <div style={gridGalleryModal.header}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h2 style={gridGalleryModal.mainTitle}>{galleryTitle}</h2>
                  <span style={gridGalleryModal.subTitle}>ภาพทั้งหมด ({activeGalleryImages.length} ภาพ)</span>
                </div>
                <button onClick={() => setActiveGalleryImages(null)} style={gridGalleryModal.closeBtn}>X</button>
              </div>

              {/* พื้นที่แสดงรูปภาพเรียงกันเยอะ ๆ เป็น Grid */}
              <div style={gridGalleryModal.gridScrollArea} className="modal-gallery-scrollbar">
                {activeGalleryImages.map((imgSrc, idx) => (
                  <div 
                    key={idx} 
                    style={{ ...gridGalleryModal.imageCard, cursor: "zoom-in" }} // ✨ เปลี่ยน Cursor ให้เป็นรูปแว่นขยาย
                    onClick={() => {
                      // ✨ เมื่อกดที่รูปเล็ก ให้เซ็ตค่าเปิดหน้าต่างขยายรูปใหญ่ซ้อนอีกชั้น
                      setLightBoxImage(imgSrc);
                      setCurrentLightBoxIndex(idx);
                    }}
                  >
                    <img src={imgSrc} alt={`gallery-item-${idx}`} style={gridGalleryModal.imageItem} />
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* 🌟 ----------------- เพิ่มระบบป๊อปอัปสไลด์ภาพขนาดใหญ่ (LightBox Carousel) ซ้อนอีกชั้น ----------------- */}
        {lightBoxImage && (
          <div style={lightBoxModal.overlay} onClick={() => setLightBoxImage(null)}>
            {/* สกัดคลิกโดนกล่องรูปภาพใหญ่ ไม่ให้ม่านดำปิด */}
            <div style={lightBoxModal.box} onClick={(e) => e.stopPropagation()}>
              
              {/* ปุ่มปิดสีขาวมุมขวาบน */}
              <button onClick={() => setLightBoxImage(null)} style={lightBoxModal.closeBtn}>✕</button>

              {/* ส่วนแสดงรูปภาพใหญ่และปุ่มลูกศรเลื่อน */}
              <div style={lightBoxModal.viewerRow}>
                {/* ปุ่มลูกศรซ้าย (◀) แสดงผลเมื่อมีภาพก่อนหน้า */}
                {currentLightBoxIndex > 0 ? (
                  <button 
                    onClick={() => {
                      const nextIndex = currentLightBoxIndex - 1;
                      setCurrentLightBoxIndex(nextIndex);
                      setLightBoxImage(activeGalleryImages[nextIndex]);
                    }} 
                    style={lightBoxModal.navBtn}
                  >
                    ◀
                  </button>
                ) : <div style={{ width: 45 }} />}

                {/* ตัวรูปภาพขยายใหญ่ */}
                <div style={lightBoxModal.imageWrapper}>
                  <img src={lightBoxImage} alt="ขยายใหญ่" style={lightBoxModal.mainImage} />
                </div>

                {/* ปุ่มลูกศรขวา (▶) แสดงผลเมื่อยังมีภาพถัดไป */}
                {currentLightBoxIndex < activeGalleryImages.length - 1 ? (
                  <button 
                    onClick={() => {
                      const nextIndex = currentLightBoxIndex + 1;
                      setCurrentLightBoxIndex(nextIndex);
                      setLightBoxImage(activeGalleryImages[nextIndex]);
                    }} 
                    style={lightBoxModal.navBtn}
                  >
                    ▶
                  </button>
                ) : <div style={{ width: 45 }} />}
              </div>

              {/* ข้อความบอกตำแหน่งรูปภาพ เช่น รูปภาพที่ 2 / 8 */}
              <p style={lightBoxModal.counterText}>
                รูปภาพที่ {currentLightBoxIndex + 1} จาก {activeGalleryImages.length}
              </p>

            </div>
          </div>
        )}
        {/* ------------------------------------------------------------------------------------------------------ */}

        <style>{`
          @media (max-width: 1100px) {
            .activity-responsive-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
          @media (max-width: 768px) {
            .activity-responsive-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .activity-responsive-grid { grid-template-columns: 1fr !important; }
          }
          /* ซ่อน/ปรับแต่ง Scrollbar ในกล่องคลังรูปภาพให้สวยงามสไตล์มินิมอล */
          .modal-gallery-scrollbar::-webkit-scrollbar { width: 6px; }
          .modal-gallery-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
          .modal-gallery-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .modal-gallery-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}</style>

      </div>
    </div>
  );
}

const page = {
  container: { padding: '20px', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%', boxSizing: 'border-box' },
  wrapper: { maxWidth: '1200px', margin: '0 auto', width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  titleBtn: { padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '20px', color: '#475569', marginBottom: '4px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  toggleBtn: { backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  searchContainer: { marginBottom: '24px', width: '100%' },
  searchInput: { width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', width: '100%' },
  card: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  cardImageContainer: { width: '100%', height: '160px', backgroundColor: '#f1f5f9' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardImagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardContent: { padding: '16px', flexGrow: 1 },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 10px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  infoList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  infoText: { fontSize: '13px', color: '#64748b', margin: 0 },
  actionsRow: { display: 'flex', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  editBtn: { flex: 1, padding: '10px', fontSize: '13px', color: '#4f46e5', background: 'none', border: 'none', borderRight: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '500' },
  deleteBtn: { flex: 1, padding: '10px', fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' },
  noData: { gridColumn: '1/-1', textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '40px 0' }
};

const modal = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' },
  box: { backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '460px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', boxSizing: 'border-box', position: 'relative' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  mainTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', color: '#94a3b8', cursor: 'pointer' },
  imageUploadWrapper: { display: 'flex', alignItems: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '16px', backgroundColor: '#f8fafc' },
  imageSelectorLabel: { cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', backgroundColor: '#fff', display: 'inline-block' },
  field: { marginBottom: '14px', width: '100%' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px', textAlign: 'left' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff' },
  saveButton: { width: '100%', padding: '11px', marginTop: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};

const gridGalleryModal = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' },
  box: { backgroundColor: '#fff', border: '2.5px solid #38bdf8', borderRadius: '24px', width: '100%', maxWidth: '580px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', position: 'relative', boxSizing: 'border-box', maxHeight: '85vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '16px' },
  mainTitle: { fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: 0, textAlign: 'left' },
  subTitle: { fontSize: '12px', color: '#94a3b8', marginTop: '2px', textAlign: 'left' },
  closeBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', lineHeight: '20px', padding: '0 4px', fontWeight: '300', transition: 'color 0.2s' },
  gridScrollArea: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', overflowY: 'auto', paddingRight: '4px', width: '100%', boxSizing: 'border-box' },
  imageCard: { width: '100%', aspectRatio: '1/1', borderRadius: '16px', border: '1.5px solid #cbd5e1', overflow: 'hidden', backgroundColor: '#f8fafc', position: 'relative', boxSizing: 'border-box' },
  imageItem: { width: '100%', height: '100%', objectFit: 'cover' }
};

// 🌟 ----------------- เพิ่มสไตล์ Object สำหรับระบบสไลด์ภาพขนาดใหญ่ (LightBox) -----------------
const lightBoxModal = {
  // ม่านดำซ้อนทับชั้นบนสุด
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, padding: '16px' },
  // กล่องบรรจุรูปภาพใหญ่
  box: { backgroundColor: 'transparent', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', boxSizing: 'border-box' },
  // ปุ่มปิดสีขาวมุมขวาบน
  closeBtn: { position: 'absolute', top: '-40px', right: '0px', background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', fontWeight: '300' },
  // ส่วนแสดงรูปภาพและปุ่มเลื่อน
  viewerRow: { display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  // ปุ่มลูกศร ซ้าย-ขวา
  navBtn: { width: '45px', height: '45px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background-color 0.2s' },
  // พื้นที่ครอบรูปภาพ
  imageWrapper: { flex: 1, height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  // ตัวรูปภาพขนาดใหญ่
  mainImage: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' },
  // ข้อความบอกตำแหน่ง
  counterText: { margin: '16px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '400' }
};
// ------------------------------------------------------------------------------------------------------

export default Activity;