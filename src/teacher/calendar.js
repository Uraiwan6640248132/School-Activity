import React, { useState, useEffect } from 'react';

export default function CalendarActivity() {
  const [calendarList, setCalendarList] = useState([]);
  const [loading, setLoading] = useState(false);

  // สถานะเปิด-ปิดหน้าต่างโมดอลตามโครงสร้าง UI Mockup ของคุณ
  const [isAddOpen, setIsAddOpen] = useState(false);       
  const [isDetailOpen, setIsDetailOpen] = useState(false); 
  const [isEditOpen, setIsEditOpen] = useState(false);     
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); 

  // State เก็บค่าแบบฟอร์มให้ตรงโครงสร้างคอลัมน์ใน DB (Calendar_id, Name, Time, Date, User_id)
  const [formData, setFormData] = useState({
    Name: '',
    Date: '',
    Time: '',
    User_id: 1
  });
  const [selectedId, setSelectedId] = useState(null); 

  const API_URL = 'http://localhost:3001/api/calendar';

  // ดึงข้อมูลปฏิทินกิจกรรมทั้งหมด
  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setCalendarList(data);
      }
    } catch (err) {
      console.error("Fetch calendar error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // ฟังก์ชันกดบันทึกเพิ่มกิจกรรมใหม่ (POST)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("เพิ่มข้อมูลปฏิทินสำเร็จ!");
        setIsAddOpen(false); 
        clearForm();
        fetchCalendarData();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  // ฟังก์ชันกดบันทึกแก้ไขข้อมูลกิจกรรม (PUT)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("แก้ไขข้อมูลปฏิทินสำเร็จ!");
        setIsEditOpen(false); 
        clearForm();
        fetchCalendarData();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  // ฟังก์ชันยืนยันคำสั่งลบข้อมูล (DELETE)
  const handleDeleteSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/${selectedId}`, { method: 'DELETE' });
      if (res.ok) {
        alert("ลบข้อมูลปฏิทินสำเร็จ!");
        setIsDeleteOpen(false); 
        clearForm();
        fetchCalendarData();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const clearForm = () => {
    setFormData({ Name: '', Date: '', Time: '', User_id: 1 });
    setSelectedId(null);
  };

  // ฟังก์ชันหาว่าวันที่นั้นๆ ในปฏิทินมีบันทึกกิจกรรมตรงกันหรือไม่
  const getEventForDate = (dayNumber) => {
    const searchDateStr = `2026-08-${String(dayNumber).padStart(2, '0')}`;
    return calendarList.find(item => item.Date && item.Date.substring(0, 10) === searchDateStr);
  };

  // เปิดดูหน้าต่างรายละเอียด (เมื่อคลิกเลือกกิจกรรมบนช่องตาราง)
  const openDetailModal = (item) => {
    setSelectedId(item.Calendar_id); 
    setFormData({
      Name: item.Name || '', 
      Date: item.Date ? item.Date.substring(0, 10) : '', 
      Time: item.Time || '',
      User_id: item.User_id || 1
    });
    setIsDetailOpen(true); 
  };

  const openAddModalOnDate = (dayNumber) => {
    clearForm();
    const formattedDate = `2026-08-${String(dayNumber).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, Date: formattedDate }));
    setIsAddOpen(true);
  };

  // สร้างอาร์เรย์วันที 1 ถึง 31 ของเดือนสิงหาคม 2569 ตามภาพ Mockup
  const daysInAugust = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <button style={styles.btnTitleActive}>ปฏิทินกิจกรรม</button>
      </div>

      {loading && <p style={{ fontSize: '14px', color: '#666' }}>กำลังโหลดตารางปฏิทิน...</p>}

      {/* บล็อกวาดกระดานปฏิทินหลัก */}
      <div style={styles.calendarCard}>
        <div style={styles.calendarHeader}>
          <span style={{ fontSize: '18px', fontWeight: '500' }}>ปฏิทินกิจกรรม - สิงหาคม 2569</span>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button style={styles.arrowBtn}>&lt;</button>
            <button style={styles.arrowBtn}>&gt;</button>
          </div>
        </div>

        <div style={styles.calendarGrid}>
          {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
            <div key={day} style={styles.dayOfWeekLabel}>{day}</div>
          ))}

          {/* Render กล่องวันที่ 1 - 31 */}
          {daysInAugust.map((day) => {
            const eventItem = getEventForDate(day);
            // ตรวจสอบข้อมูลเพื่อจัดการย้ายจุดเริ่มต้น Grid ให้ตรงวันพฤหัสบดีที่ 1 ส.ค. 2569
            const gridStyle = day === 1 ? { gridColumnStart: 5, ...styles.dayCell } : styles.dayCell;

            return (
              <div 
                key={day} 
                style={gridStyle} 
                onClick={() => !eventItem && openAddModalOnDate(day)}
              >
                <span style={{ color: '#555', fontWeight: '500' }}>{day}</span>
                {eventItem && (
                  <div 
                    style={styles.eventBadge} 
                    onClick={(e) => { e.stopPropagation(); openDetailModal(eventItem); }}
                  >
                    <div style={styles.eventDot} />
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {eventItem.Name}
                    </div>
                    <div style={{ fontSize: '9px', color: '#777', marginTop: '2px' }}>
                      {eventItem.Time}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================== */}
      {/* 📥 POPUP 1: เพิ่มปฏิทิน                     */}
      {/* ========================================== */}
      {isAddOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={{ fontSize: '18px', color: '#333' }}>เพิ่มปฏิทิน</strong>
              <span style={styles.closeX} onClick={() => { setIsAddOpen(false); clearForm(); }}>X</span>
            </div>
            <form onSubmit={handleAddSubmit}>
              <label style={styles.label}>ชื่อกิจกรรม</label>
              <input type="text" style={styles.input} value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required />

              <label style={styles.label}>วัน/เดือน/ปี</label>
              <input type="date" style={styles.input} value={formData.Date} onChange={(e) => setFormData({ ...formData, Date: e.target.value })} required />

              <label style={styles.label}>เวลาที่จัด</label>
              <input type="text" style={styles.input} placeholder="เช่น 09:00 - 12:00 น." value={formData.Time} onChange={(e) => setFormData({ ...formData, Time: e.target.value })} required />

              <button type="submit" style={styles.btnSubmit}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🔍 POPUP 2: รายละเอียดปฏิทิน (ปุ่มแก้ไข/ลบ) */}
      {/* ========================================== */}
      {isDetailOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={{ fontSize: '18px', color: '#333' }}>รายละเอียดปฏิทิน</strong>
              <span style={styles.closeX} onClick={() => { setIsDetailOpen(false); clearForm(); }}>X</span>
            </div>
            
            <label style={styles.label}>ชื่อกิจกรรม</label>
            <input type="text" style={styles.inputReadOnly} value={formData.Name} readOnly />

            <label style={styles.label}>วัน/เดือน/ปี</label>
            <input type="text" style={styles.inputReadOnly} value={formData.Date} readOnly />

            <label style={styles.label}>เวลาที่จัด</label>
            <input type="text" style={styles.inputReadOnly} value={formData.Time} readOnly />

            <div style={styles.bottomActionRow}>
              <button style={styles.actionRoundBtn} onClick={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}>🗑️</button>
              <button style={styles.actionRoundBtn} onClick={() => { setIsDetailOpen(false); setIsEditOpen(true); }}>📝</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ✏️ POPUP 3: แก้ไขปฏิทิน                    */}
      {/* ========================================== */}
      {isEditOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={{ fontSize: '18px', color: '#333' }}>แก้ไขปฏิทิน</strong>
              <span style={styles.closeX} onClick={() => { setIsEditOpen(false); clearForm(); }}>X</span>
            </div>
            <form onSubmit={handleEditSubmit}>
              <label style={styles.label}>ชื่อกิจกรรม</label>
              <input type="text" style={styles.input} value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required />

              <label style={styles.label}>วัน/เดือน/ปี</label>
              <input type="date" style={styles.input} value={formData.Date} onChange={(e) => setFormData({ ...formData, Date: e.target.value })} required />

              <label style={styles.label}>เวลาที่จัด</label>
              <input type="text" style={styles.input} value={formData.Time} onChange={(e) => setFormData({ ...formData, Time: e.target.value })} required />

              <button type="submit" style={styles.btnSubmit}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ❌ POPUP 4: ยืนยันการลบข้อมูล              */}
      {/* ========================================== */}
      {isDeleteOpen && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, width: '360px', textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ fontSize: '60px', margin: '10px 0', color: '#333' }}>🗑️</div>
            <strong style={{ fontSize: '20px', display: 'block', marginBottom: '8px', color: '#000' }}>ยืนยันการลบ</strong>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 25px 0' }}>คุณต้องการลบข้อมูลนี้หรือไม่</p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button style={styles.btnCancel} onClick={() => { setIsDeleteOpen(false); clearForm(); }}>ยกเลิก</button>
              <button style={styles.btnConfirmDelete} onClick={handleDeleteSubmit}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ชุดปรับปรุงการออกแบบ CSS ให้มีความคล้ายคลึงกับ Mockup ขาวดำแบบ Minimalist ของคุณ
const styles = {
  container: { padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' },
  headerRow: { display: 'flex', marginBottom: '25px' },
  btnTitleActive: { padding: '10px 24px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  
  calendarCard: { border: '1px solid #ddd', borderRadius: '10px', padding: '25px', backgroundColor: '#fff', maxWidth: '850px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  arrowBtn: { padding: '4px 10px', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#666' },
  
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
  dayOfWeekLabel: { textAlign: 'center', fontSize: '14px', fontWeight: '500', paddingBottom: '10px', color: '#444' },
  dayCell: { border: '1px solid #e0e0e0', borderRadius: '8px', minHeight: '85px', padding: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: '#fff', transition: 'background-color 0.2s' },
  
  eventBadge: { backgroundColor: '#f2f2f2', border: '1px solid #dcdcdc', borderRadius: '6px', padding: '6px 5px', fontSize: '10px', marginTop: '5px', color: '#333', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' },
  eventDot: { width: '5px', height: '5px', backgroundColor: '#333', borderRadius: '50%', marginBottom: '2px' },
  
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { backgroundColor: '#fff', width: '380px', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', position: 'relative' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  closeX: { cursor: 'pointer', fontWeight: 'bold', color: '#bbb', fontSize: '16px' },
  
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', marginTop: '12px', textAlign: 'left' },
  input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' },
  inputReadOnly: { width: '100%', padding: '10px', border: '1px solid #e0e0e0', backgroundColor: '#f9f9f9', borderRadius: '6px', boxSizing: 'border-box', color: '#333', fontSize: '14px', marginBottom: '4px' },
  
  bottomActionRow: { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '25px' },
  actionRoundBtn: { width: '48px', height: '48px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  
  btnSubmit: { width: '100%', padding: '11px', marginTop: '25px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  btnCancel: { padding: '10px 30px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  btnConfirmDelete: { padding: '10px 30px', backgroundColor: '#000', color: '#fff', border: '1px solid #000', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};