import React, { useEffect, useState } from "react";
import axios from "axios";

function ParticipatingActivities() {
  // --- State Management ---
  const [activities, setActivities] = useState([]); // รายการกิจกรรมสำหรับ Dropdown
  const [classes, setClasses] = useState([]);      // รายการชั้นเรียนสำหรับ Dropdown
  const [students, setStudents] = useState([]);    // รายชื่อนักเรียนและสถานะการเข้าเรียน
  
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  
  // State สำหรับสลับหน้าตา UI: false = โหมดบันทึก (รูปที่ 1) | true = โหมดแสดงผล (รูปที่ 2)
  const [isViewMode, setIsViewMode] = useState(false); 

  // ✅ แก้ไข: ปรับเป็น Base URL พอร์ตหลัก เพื่อให้ด้านล่างเชื่อมต่อกับพาทหลังบ้านได้ถูกต้อง ไม่หลุด 404
  const API_URL = "http://localhost:3001";

  // --- Initial Fetch ---
  useEffect(() => {
    // เรียกโหลดข้อมูลกิจกรรมและชั้นเรียนจริงจากฐานข้อมูลทันทีเมื่อเปิดหน้าเว็บ
    fetchDropdownData();
  }, []);

  // ฟังก์ชันดึงข้อมูลกิจกรรมและชั้นเรียนจาก API
  const fetchDropdownData = async () => {
    try {
      const resActivity = await axios.get(`${API_URL}/attendance/activities`);
      const resClasses = await axios.get(`${API_URL}/attendance/classes`);
      setActivities(resActivity.data);
      setClasses(resClasses.data);
    } catch (err) {
      console.error("ดึงข้อมูล Dropdown ไม่สำเร็จ:", err);
    }
  };

  // ดึงรายชื่อนักเรียนใหม่โดยอัตโนมัติ เมื่อมีการเปลี่ยนตัวเลือก "กิจกรรม" หรือ "ชั้นเรียน"
  useEffect(() => {
    if (selectedActivity && selectedClass) {
      fetchStudents(selectedActivity, selectedClass);
    } else {
      // หากยังเลือกไม่ครบ ให้เคลียร์รายชื่อนักเรียนเป็นว่างเปล่าก่อน
      setStudents([]);
    }
  }, [selectedActivity, selectedClass]);

  // ฟังก์ชันดึงรายชื่อนักเรียนพร้อมสถานะจากฐานข้อมูลจริง
  const fetchStudents = async (activityId, classId) => {
    try {
      const res = await axios.get(`${API_URL}/attendance/students?activity=${activityId}&class=${classId}`);
      setStudents(res.data);
    } catch (err) {
      console.error("ดึงรายชื่อนักเรียนไม่สำเร็จ:", err);
    }
  };

  // --- Handlers ---
  // ฟังก์ชันกดติ๊กถูก/ยกเลิก (กล่องดำเครื่องหมาย / ) ในโหมดบันทึกข้อมูล
  const handleToggleAttendance = (studentId) => {
    if (isViewMode) return; // ถ้าอยู่ในโหมดแสดงผล (รูปที่ 2) จะล็อกไว้ไม่ให้กดแก้ไขข้อมูล
    
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId 
          ? { ...student, attended: !student.attended } 
          : student
      )
    );
  };

  // ฟังก์ชันส่งข้อมูลการเช็คชื่อไปบันทึกลงฐานข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedActivity || !selectedClass) {
      return alert("กรุณาเลือกกิจกรรมและชั้นเรียนก่อนบันทึก");
    }

    // เตรียมโครงสร้าง Payload Object ให้ตรงตามที่ API ขาเข้าของเซิร์ฟเวอร์ต้องการ
    const payload = {
      activity_id: parseInt(selectedActivity, 10),
      attendance_list: students.map(s => ({ 
        student_id: s.id, 
        attended: s.attended 
      }))
    };

    try {
      await axios.post(`${API_URL}/attendance/save`, payload);
      alert("บันทึกการเข้าร่วมกิจกรรมเรียบร้อยแล้ว!");
      // หลังจากบันทึกเสร็จ ให้โหลดข้อมูลใหม่อีกครั้งเพื่ออัปเดตหน้าจอให้เป็นปัจจุบัน
      fetchStudents(selectedActivity, selectedClass);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <div style={page.container}>
      <div style={page.wrapper}>
        
        {/* แผงควบคุมพิเศษสำหรับทดสอบสลับโหมด UI (รูปที่ 1 และ รูปที่ 2) */}
        <div style={page.devControlPanel}>
          <span style={{ fontSize: "13px", color: "#1e3a8a", fontWeight: "500" }}></span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button 
              type="button"
              onClick={() => setIsViewMode(false)} 
              style={{ ...page.devBtn, backgroundColor: !isViewMode ? "#2563eb" : "#ffffff", color: !isViewMode ? "#ffffff" : "#2563eb" }}
            >
              หน้าบันทึกการเข้าร่วม
            </button>
            <button 
              type="button"
              onClick={() => setIsViewMode(true)} 
              style={{ ...page.devBtn, backgroundColor: isViewMode ? "#2563eb" : "#ffffff", color: isViewMode ? "#ffffff" : "#2563eb" }}
            >
              หน้าเข้าร่วมกิจกรรม
            </button>
          </div>
        </div>

        {/* ================= เริ่มต้นโครงสร้างตาม UX/UI ================= */}
        
        {/* ปุ่มหัวข้อด้านบน */}
        <div style={page.headerRow}>
          <button type="button" style={page.titleBtn}>เข้าร่วมกิจกรรม</button>
        </div>
        
        {/* หัวข้อย่อยหน้าเว็บ */}
        <h1 style={page.pageTitle}>บันทึกการเข้าร่วมกิจกรรม</h1>

        {/* การ์ดหลักคลุมตารางข้อมูล */}
        <div style={page.cardBox}>
          
          <div>
            {/* โซน Dropdown เลือกกิจกรรมและชั้นเรียน */}
            <div style={page.dropdownGrid} className="participating-dropdown-grid">
              
              <div style={page.fieldGroup}>
                <label style={page.label}>เลือกกิจกรรม</label>
                <div style={page.selectWrapper}>
                  <select 
                    value={selectedActivity} 
                    onChange={(e) => setSelectedActivity(e.target.value)} 
                    style={page.select}
                  >
                    <option value=""></option>
                    {activities.map(act => <option key={act.id} value={act.id}>{act.name}</option>)}
                  </select>
                  <div style={page.selectArrow}>▽</div>
                </div>
              </div>

              <div style={page.fieldGroup}>
                <label style={page.label}>เลือกชั้นเรียน</label>
                <div style={page.selectWrapper}>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)} 
                    style={page.select}
                  >
                    <option value=""></option>
                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                  </select>
                  <div style={page.selectArrow}>▽</div>
                </div>
              </div>

            </div>

            {/* ส่วนหัวตารางรายชื่อ */}
            <div style={page.tableHeader}>
              <div style={page.colStudent}>นักเรียน</div>
              <div style={page.colStatus}>เข้าร่วม</div>
            </div>

            {/* ส่วนแสดงรายการนักเรียน */}
            <div style={page.tableBody}>
              {students.length === 0 ? (
                <p style={page.noData}>กรุณาเลือกกิจกรรมและชั้นเรียนเพื่อแสดงรายชื่อ</p>
              ) : (
                students.map((student) => (
                  <div key={student.id} style={page.tableRow}>
                    
                    {/* คอลัมน์ ชื่อ-นามสกุล */}
                    <div style={page.studentName}>{student.name}</div>
                    
                    {/* คอลัมน์ เช็คชื่อเข้าร่วม */}
                    <div style={page.statusCenter}>
                      
                      {!isViewMode ? (
                        /* รูปแบบที่ 1: โหมดบันทึก (มีกล่องติ๊กถูก Custom ดำ/ขาว ตามภาพ) */
                        <div onClick={() => handleToggleAttendance(student.id)} style={{ cursor: "pointer" }}>
                          {student.attended ? (
                            <div style={page.checkboxChecked}>/</div>
                          ) : (
                            <div style={page.checkboxUnchecked}></div>
                          )}
                        </div>
                      ) : (
                        /* รูปแบบที่ 2: โหมดแสดงผลประวัติ (เป็น Text ตัวอักษร "เข้าร่วม" / "ไม่เข้าร่วม") */
                        <span style={page.statusText}>
                          {student.attended ? "เข้าร่วม" : "ไม่เข้าร่วม"}
                        </span>
                      )}

                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* ส่วนปุ่มบันทึกด้านล่าง (จะแสดงเฉพาะในโหมดบันทึกข้อมูล รูปที่ 1 เท่านั้น) */}
          {!isViewMode && students.length > 0 && (
            <div style={page.footerActionRow}>
              <button type="button" onClick={handleSubmit} style={page.submitBtn}>
                บันทึกการเข้าร่วม
              </button>
            </div>
          )}

        </div>

        {/* CSS Media Query สำหรับทำให้ Dropdown ยืดหดตามสไตล์แบบ Responsive */}
        <style>{`
          @media (max-width: 640px) {
            .participating-dropdown-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          }
        `}</style>

      </div>
    </div>
  );
}

// --- Styles Design System ---
const page = {
  container: { backgroundColor: "#ffffff", minHeight: "100vh", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", color: "#334155", fontFamily: "'Inter', 'Kanit', 'Sarabun', sans-serif" },
  wrapper: { width: "100%", maxWidth: "720px" },
  devControlPanel: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px 14px", borderRadius: "8px", marginBottom: "2rem", width: "100%", boxSizing: "border-box" },
  devBtn: { border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", transition: "all 0.2s" },
  headerRow: { marginBottom: "8px" },
  titleBtn: { backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#000000", fontWeight: "bold", padding: "6px 28px", borderRadius: "6px", fontSize: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.04)", cursor: "default" },
  pageTitle: { fontSize: "16px", fontWeight: "bold", color: "#000000", margin: "0 0 16px 0", paddingLeft: "4px" },
  cardBox: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "24px 24px", minHeight: "480px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 14px rgba(0,0,0,0.04)", boxSizing: "border-box" },
  dropdownGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" },
  fieldGroup: { display: "flex", flexDirection: "column" },
  label: { fontSize: "13px", color: "#555555", marginBottom: "6px", paddingLeft: "2px" },
  selectWrapper: { position: "relative", display: "flex", alignItems: "center" },
  select: { width: "100%", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 14px", fontSize: "14px", color: "#334155", outline: "none", appearance: "none", WebkitAppearance: "none", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)" },
  selectArrow: { position: "absolute", right: "12px", color: "#94a3b8", fontSize: "10px", pointerEvents: "none" },
  tableHeader: { display: "flex", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", color: "#888888", fontSize: "13px" },
  colStudent: { flex: 3, textAlign: "left", paddingLeft: "12px" },
  colStatus: { flex: 1, textAlign: "center" },
  tableBody: { display: "flex", flexDirection: "column" },
  tableRow: { display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" },
  studentName: { flex: 3, fontSize: "14px", color: "#444444", paddingLeft: "12px" },
  statusCenter: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center" },
  checkboxChecked: { width: "20px", height: "20px", backgroundColor: "#000000", border: "1px solid #000000", borderRadius: "4px", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", userSelect: "none" },
  checkboxUnchecked: { width: "20px", height: "20px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" },
  statusText: { fontSize: "14px", color: "#444444", fontWeight: "normal" },
  noData: { textAlign: "center", color: "#94a3b8", fontSize: "13px", padding: "2rem 0" },
  footerActionRow: { display: "flex", justifyContent: "center", marginTop: "24px" },
  submitBtn: { backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", fontWeight: "normal", padding: "5px 32px", borderRadius: "6px", fontSize: "13px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", cursor: "pointer", transition: "background-color 0.15s" }
};

export default ParticipatingActivities;