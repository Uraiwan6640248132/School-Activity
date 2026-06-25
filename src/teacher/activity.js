import React, { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [nameActivity, setNameActivity] = useState(""); 
  const [photographer, setPhotographer] = useState(""); 
  const [location, setLocation] = useState("");         
  const [activityDate, setActivityDate] = useState("");   
  
  // 1. เปลี่ยนโครงสร้างจากรูปเดี่ยวเป็น Array สำหรับรองรับหลายรูป
  const [images, setImages] = useState([]);         // เก็บ Base64 ของทุกรูป เช่น ["data:...", "data:..."]
  const [previewImages, setPreviewImages] = useState([]); // เก็บ ObjectURL สำหรับพรีวิวรูป
  
  const [editId, setEditId] = useState(null);           
  const [showForm, setShowForm] = useState(false);

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

  // 2. ปรับฟังก์ชันการเลือกรูปภาพให้วนลูปอ่านไฟล์ทั้งหมดที่เลือก
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); // แปลง FileList ให้เป็น Array ปกติ
    if (files.length > 0) {
      // ทำการพรีวิวรูปภาพทั้งหมดที่เลือก
      const objectUrls = files.map(file => URL.createObjectURL(file));
      setPreviewImages(objectUrls);

      // วนลูปแปลงทุกไฟล์เป็น Base64
      const base64Promises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(base64Promises).then(base64Strings => {
        setImages(base64Strings); // บันทึก Array ของ Base64 เข้า State
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nameActivity) {
      return alert("กรุณากรอกชื่อกิจกรรม");
    }

    // กำหนดค่ารูปภาพที่จะส่งไปหลังบ้าน
    let finalImages = null;
    if (images.length > 0) {
      finalImages = images; // ส่ง Array ของรูปใหม่
    } else if (editId && previewImages.length > 0) {
      finalImages = previewImages; // หากเป็นการแก้ไขและไม่มีการอัปโหลดใหม่ ให้ส่งรูปเดิมกลับไป
    }

    const requestData = {
      Name_activity: nameActivity,
      Photographer: photographer, // เพิ่มส่งค่า Photographer ไปที่ API หลังบ้านด้วย
      Location: location,
      Activity_date: activityDate ? activityDate : null, 
      User_id: 1,
      Images: finalImages // เปลี่ยนชื่อ Key เป็นสัญกรณ์พหูพจน์ (Images) เพื่อให้สอดคล้องกับ Array 
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
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: โปรดตรวจสอบหลังบ้านว่ารองรับข้อมูลแบบ Array ของรูปภาพ (หรือ JSON string) หรือยัง");
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
    
    setImages([]); // เคลียร์ไฟล์รูปภาพที่เพิ่งกดเลือกค้างไว้
    
    // ตรวจสอบข้อมูลรูปภาพจากหลังบ้าน (กรณีหลังบ้านส่งมาเป็น JSON String หรือ Array อยู่แล้ว)
    let oldImages = [];
    if (item.Images) {
      oldImages = typeof item.Images === "string" ? JSON.parse(item.Images) : item.Images;
    } else if (item.Image) {
      // ตัวช่วยเผื่อหลังบ้านยังเป็นคอลัมน์ Image ตัวเดิม (เก็บเป็นสายอักษรเดียว)
      oldImages = [item.Image];
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
          <button onClick={() => { if(showForm) clearForm(); else setShowForm(true); }} style={page.toggleBtn}>
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
              
              {/* ส่วนอัปโหลดรูปภาพที่ปรับปรุงใหม่ */}
              <div style={modal.imageUploadWrapper}>
                <label style={modal.imageSelectorLabel}>
                  {/* ใส่ attribute multiple เพื่อให้เลือกได้มากกว่า 1 รูป */}
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <svg width="24" height="24" fill="none" stroke="#64748b" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span style={{ marginTop: "4px", fontSize: "11px", color: "#64748b" }}>อัปโหลดรูป</span>
                  </div>
                </label>

                {/* แสดงรายการรูปภาพทั้งหมดที่เลือกพรีวิว */}
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
              // จัดการแปลงข้อมูลรูปภาพที่มาจากหลังบ้านให้เป็น Array
              let itemImages = [];
              if (item.Images) {
                itemImages = typeof item.Images === "string" ? JSON.parse(item.Images) : item.Images;
              } else if (item.Image) {
                itemImages = [item.Image]; // รองรับฟิลด์เก่า
              }

              return (
                <div key={item.Activity_id} style={page.card}>
                  
                  {/* ส่วนแสดงรูปภาพบนหน้า Card: แสดงรูปแรกเป็นรูปหลัก และแสดงรูปเล็กๆ ด้านล่างภาพหลัก */}
                  <div style={page.cardImageContainer}>
                    {itemImages.length > 0 ? (
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
                      <p style={page.infoText}>ผู้บันทึกภาพ: {item.Photographer || "ไม่ระบุชื่อ"}</p>
                      <p style={page.infoText}>วัน/เดือน/ปี: {formatDate(item.Activity_date)}</p>
                      <p style={page.infoText}>สถานที่: {item.Location || "ไม่ระบุสถานที่"}</p>
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
        `}</style>

      </div>
    </div>
  );
}


export default Activity;