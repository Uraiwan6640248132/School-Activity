import React, { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  // State สำหรับฟอร์มจัดการข้อมูลกิจกรรม
  const [nameActivity, setNameActivity] = useState(""); 
  const [photographer, setPhotographer] = useState(""); 
  const [location, setLocation] = useState("");         
  const [activityDate, setActivityDate] = useState("");   
  const [image, setImage] = useState(""); 
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameActivity) return alert("กรุณากรอกชื่อกิจกรรม");

    const activityData = {
      Name_activity: nameActivity,
      Photographer: photographer, 
      Location: location,
      Activity_date: activityDate,
      Image: image, 
      User_id: 1 
    };

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, activityData);
      } else {
        await axios.post(API_URL, activityData);
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
    setImage(item.Image || ""); 
    setShowForm(true);
  };

  const clearForm = () => {
    setNameActivity("");
    setPhotographer(""); 
    setLocation("");
    setActivityDate("");
    setImage("");
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
        
        {/* ส่วนหัวหน้าเว็บ */}
        <div style={page.header}>
          <div>
            <button style={page.titleBtn}>กิจกรรม</button>
            <h1 style={page.pageTitle}>จัดการข้อมูลกิจกรรม</h1>
          </div>

          <button onClick={() => { if(showForm) clearForm(); else setShowForm(true); }} style={page.toggleBtn}>
            {showForm ? "✕ ปิดแผงคุม" : "➕ เพิ่มกิจกรรมใหม่"}
          </button>
        </div>

        {/* ช่องค้นหากิจกรรม */}
        <div style={page.searchContainer}>
          <input
            type="text"
            placeholder="ค้นหากิจกรรม"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={page.searchInput}
          />
        </div>

        {/* หน้าต่างฟอร์มจัดการข้อมูล */}
        {showForm && (
          <div style={modal.overlay}>
            <form onSubmit={handleSubmit} style={modal.box}>
              <div style={modal.header}>
                <h2 style={modal.mainTitle}>{editId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรม"}</h2>
                <button type="button" onClick={clearForm} style={modal.closeBtn}>✕</button>
              </div>
              
              {/* ช่องอัปโหลดรูปภาพกิจกรรม */}
              <div style={modal.imageUploadWrapper}>
                <label style={modal.imageSelectorLabel}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                  {image ? (
                    <img src={image} alt="Uploaded preview" style={modal.imagePreview} />
                  ) : (
                    <div style={modal.uploadPlaceholder}>
                      <svg style={{ width: 32, height: 32, color: "#64748b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span style={modal.uploadText}>Add Image</span>
                    </div>
                  )}
                </label>
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
              
              <button type="submit" style={modal.saveButton}>
                บันทึก
              </button>
            </form>
          </div>
        )}

        {/* แผง Grid แสดงการ์ดกิจกรรม */}
        <div style={page.grid} className="activity-responsive-grid">
          {filteredActivities.length === 0 ? (
            <p style={page.noData}>ไม่พบข้อมูลกิจกรรมในระบบ</p>
          ) : (
            filteredActivities.map((item) => (
              <div key={item.Activity_id} style={page.card}>
                
                {/* ครึ่งบน: พื้นที่แสดงรูปภาพ */}
                <div style={page.cardImageContainer}>
                  {item.Image ? (
                    <img src={item.Image} alt={item.Name_activity} style={page.cardImage} />
                  ) : (
                    <div style={page.cardImagePlaceholder}>
                      <svg style={{ width: 36, height: 36, color: "#cbd5e1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  )}
                </div>

                {/* ครึ่งล่าง: รายละเอียดข้อความ */}
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

                {/* ปุ่มกด แก้ไข - ลบ */}
                <div style={page.actionsRow}>
                  <button onClick={() => handleEdit(item)} style={page.editBtn}>แก้ไข</button>
                  <button onClick={() => handleDelete(item.Activity_id)} style={page.deleteBtn}>ลบ</button>
                </div>

              </div>
            ))
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



/* ==========================================
   🎨 JS STYLES OBJECT (ปรับลดขนาดและเอาตัวหนาออก)
   ========================================== */
const page = {
  container: { backgroundColor: "#ffffff", minHeight: "100vh", padding: "1.5rem", display: "flex", justifyContent: "center", color: "#334155", fontFamily: "'Inter', 'Kanit', sans-serif" },
  wrapper: { width: "100%", maxWidth: "1200px" }, 
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" },
  titleBtn: { backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", fontWeight: "normal", padding: "4px 16px", borderRadius: "6px", fontSize: "14px", marginBottom: "6px", cursor: "default" },
  pageTitle: { fontSize: "18px", fontWeight: "normal", paddingLeft: "2px", margin: 0, color: "#1e293b" },
  toggleBtn: { backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", fontSize: "13px", fontWeight: "normal", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" },
  
  searchContainer: { marginBottom: "1.5rem" },
  searchInput: { width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", fontSize: "14px", outline: "none", color: "#334155", boxSizing: "border-box", fontWeight: "normal" },
  
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  noData: { gridColumn: "span 4", textAlign: "center", padding: "3rem 0", fontSize: "14px", color: "#94a3b8" },
  
  card: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "280px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  cardImageContainer: { width: "100%", height: "120px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  cardImagePlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  
  cardContent: { padding: "12px 14px 4px 14px" },
  cardTitle: { fontSize: "16px", fontWeight: "600", margin: "0 0 6px 0", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  
  infoList: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" },
  infoText: { color: "#64748b", fontSize: "13px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "normal" },
  
  actionsRow: { display: "flex", gap: "8px", marginTop: "auto", padding: "0 14px 14px 14px" },
  editBtn: { flex: 1, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", fontSize: "12px", fontWeight: "normal", padding: "5px 0", borderRadius: "6px", cursor: "pointer", textAlign: "center" },
  deleteBtn: { flex: 1, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#ef4444", fontSize: "12px", fontWeight: "normal", padding: "5px 0", borderRadius: "6px", cursor: "pointer", textAlign: "center" }
};

const modal = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,.25)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 },
  box: { background: "#ffffff", padding: "20px 20px", borderRadius: "10px", width: "360px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", boxSizing: "border-box", border: "1px solid #e2e8f0" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  mainTitle: { fontSize: "18px", fontWeight: "600", margin: 0, color: "#1e293b" },
  closeBtn: { background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" },
  
  imageUploadWrapper: { display: "flex", justifyContent: "center", marginBottom: "16px" },
  imageSelectorLabel: { width: "90px", height: "90px", border: "1px dashed #cbd5e1", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", backgroundColor: "#f8fafc" },
  uploadPlaceholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  uploadText: { fontSize: "12px", fontWeight: "normal", marginTop: "4px", color: "#64748b" },
  imagePreview: { width: "100%", height: "100%", objectFit: "cover" },

  field: { display: "flex", flexDirection: "column", marginBottom: "12px" },
  label: { fontSize: "14px", fontWeight: "normal", marginBottom: "4px", color: "#475569" },
  input: { width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", outline: "none", fontSize: "14px", backgroundColor: "#ffffff", fontWeight: "normal", color: "#334155" },
  
  saveButton: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", fontWeight: "normal", fontSize: "14px", cursor: "pointer", marginTop: "8px" }
};

export default Activity;