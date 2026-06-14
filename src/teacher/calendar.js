import React, { useState, useEffect } from 'react';

export default function CalendarActivity() {
  const [calendarList, setCalendarList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ควบคุมหน้าต่าง Popups
  const [isAddOpen, setIsAddOpen] = useState(false);      
  const [isDetailOpen, setIsDetailOpen] = useState(false); 
  const [isEditOpen, setIsEditOpen] = useState(false);     
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); 

  // กิจกรรมที่ถูกเลือก
  const [selectedEvent, setSelectedEvent] = useState(null);

  // โครงสร้าง state ฟอร์มส่งข้อมูลไปยังฐานข้อมูล
  const [formData, setFormData] = useState({
    Name: '',
    Date: '',
    Time: '',
    User_id: 1
  });

  const API_URL = 'http://localhost:3001/api/calendar';

  // ดึงข้อมูลกิจกรรมทั้งหมด
  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        console.log("ข้อมูลดิบจากฐานข้อมูล (Array ล่าสุด):", data); 
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

  // บันทึกเพิ่มกิจกรรมใหม่ (POST)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("บันทึกข้อมูลกิจกรรมเรียบร้อยแล้ว!");
        setIsAddOpen(false); 
        clearForm();
        fetchCalendarData(); 
      } else {
        alert("ไม่สามารถเพิ่มข้อมูลได้ กรุณาตรวจสอบอีกครั้ง");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  // แก้ไขกิจกรรม (PUT)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const currentId = selectedEvent?.Calendar_id || selectedEvent?.calendar_id;
    if (!currentId) return;

    try {
      const res = await fetch(`${API_URL}/${currentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("แก้ไขข้อมูลปฏิทินสำเร็จ!");
        setIsEditOpen(false); 
        clearForm();
        fetchCalendarData();
      } else {
        alert("ไม่สามารถแก้ไขข้อมูลได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  // ลบกิจกรรม (DELETE)
  const handleDeleteSubmit = async () => {
    const currentId = selectedEvent?.Calendar_id || selectedEvent?.calendar_id;
    if (!currentId) return;

    try {
      const res = await fetch(`${API_URL}/${currentId}`, { method: 'DELETE' });
      if (res.ok) {
        alert("ลบข้อมูลปฏิทินสำเร็จ!");
        setIsDeleteOpen(false); 
        clearForm();
        fetchCalendarData();
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const clearForm = () => {
    setFormData({ Name: '', Date: '', Time: '', User_id: 1 });
    setSelectedEvent(null);
  };

  // 🛠️ ฟังก์ชันจับคู่กิจกรรมลงช่องวัน (เช็คเฉพาะเดือน 08 และวันที่ให้ตรงกัน)
  const getEventForDate = (dayNumber) => {
    if (!calendarList || calendarList.length === 0) return null;

    // ทำตัวเลขวันปัจจุบันให้เป็น String 2 หลัก (เช่น 3 -> "03")
    const currentDayStr = String(dayNumber).padStart(2, '0');

    return calendarList.find(item => {
      const rawDate = item.Date || item.date;
      if (!rawDate) return false;

      // ตัดเอาเฉพาะส่วน ปี-เดือน-วัน ออกมา
      const cleanDateOnly = String(rawDate).split('T')[0];
      const parts = cleanDateOnly.split('-');
      
      if (parts.length >= 3) {
        const dbMonth = parts[1]; 
        const dbDay = parts[2];   

        if ((dbMonth === '08' || dbMonth === '8') && dbDay === currentDayStr) {
          return true;
        }
      } else if (cleanDateOnly.includes(`-08-${currentDayStr}`) || cleanDateOnly.includes(`-8-${currentDayStr}`)) {
        return true;
      }

      return false;
    });
  };

  // เมื่อคลิกเลือกดูงานบนช่องปฏิทิน
  const handleSelectEvent = (eventItem) => {
    setSelectedEvent(eventItem);
    
    const rawDate = eventItem.Date || eventItem.date;
    const rawName = eventItem.Name || eventItem.name;
    const rawTime = eventItem.Time || eventItem.time;
    const rawUserId = eventItem.User_id || eventItem.user_id;

    let cleanDate = '';
    if (rawDate) {
      cleanDate = String(rawDate).split('T')[0];
    }

    setFormData({
      Name: rawName || '',
      Date: cleanDate,
      Time: rawTime || '',
      User_id: rawUserId || 1
    });
    setIsDetailOpen(true); 
  };

  // คลิกพื้นที่ช่องว่างปฏิทินเพื่อเริ่มกรอกเพิ่มงานใหม่
  const openAddModalOnDate = (dayNumber) => {
    clearForm();
    const formattedDate = `2026-08-${String(dayNumber).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, Date: formattedDate }));
    setIsAddOpen(true);
  };

  // 🛠️ แก้ไขเรียบร้อย: ส่งค่าข้อความเวลาออกไปแสดงตรงๆ ไม่ทำการตัดสปลิตคำให้เกิดบั๊กอีกต่อไป
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    return String(timeStr); 
  };
  
  const daysInAugust = Array.from({ length: 31 }, (_, i) => i + 1);
  const emptyInitialSpaces = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div style={styles.contentBody}>
      {loading && <p style={{ fontSize: '13px', color: '#666' }}>กำลังอัปเดตปฏิทิน...</p>}
      
      <div style={styles.calendarCard}>
        <div style={styles.calendarHeader}>
          <span style={styles.calendarMonthTitle}>ปฏิทินกิจกรรม - สิงหาคม 2569</span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button style={styles.arrowBtn}>&lt;</button>
            <button style={styles.arrowBtn}>&gt;</button>
          </div>
        </div>

        <div style={styles.calendarGrid}>
          {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
            <div key={day} style={styles.dayOfWeekLabel}>{day}</div>
          ))}

          {emptyInitialSpaces.map((val) => (
            <div key={`empty-${val}`} style={styles.dayCellEmpty} />
          ))}

          {daysInAugust.map((day) => {
            const eventItem = getEventForDate(day);
            const isSelected = selectedEvent && eventItem && 
              ((selectedEvent.Calendar_id && selectedEvent.Calendar_id === eventItem.Calendar_id) || 
               (selectedEvent.calendar_id && selectedEvent.calendar_id === eventItem.calendar_id));

            return (
              <div 
                key={day} 
                style={{
                  ...styles.dayCell,
                  backgroundColor: eventItem ? '#e5e5e5' : '#fff', 
                  border: isSelected ? '2px solid #000' : '1px solid #dcdcdc'
                }} 
                onClick={() => {
                  if (eventItem) {
                    handleSelectEvent(eventItem);
                  } else {
                    openAddModalOnDate(day);
                  }
                }}
              >
                <span style={styles.dayNumberText}>{day}</span>
                {eventItem && (
                  <div style={styles.eventBadgeContent}>
                    <div style={styles.eventTitleText}>• {eventItem.Name || eventItem.name}</div>
                    <div style={styles.eventTimeText}>
                      {formatTimeDisplay(eventItem.Time || eventItem.time)}
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
              <strong style={styles.modalTitle}>เพิ่มปฏิทิน</strong>
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

      {/* 🔍 POPUP 2: รายละเอียดปฏิทิน */}
      {isDetailOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={styles.modalTitle}>รายละเอียดปฏิทิน</strong>
              <span style={styles.closeX} onClick={() => { setIsDetailOpen(false); clearForm(); }}>X</span>
            </div>
            <div>
              <label style={styles.label}>ชื่อกิจกรรม</label>
              <input type="text" style={styles.inputReadOnly} value={formData.Name} readOnly />
              <label style={styles.label}>วัน/เดือน/ปี</label>
              <input type="text" style={styles.inputReadOnly} value={formData.Date} readOnly />
              <label style={styles.label}>เวลาที่จัด</label>
              <input type="text" style={styles.inputReadOnly} value={formatTimeDisplay(formData.Time)} readOnly />
              <div style={styles.modalActionRow}>
                <button type="button" style={styles.iconActionBtn} onClick={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}>🗑️</button>
                <button type="button" style={styles.iconActionBtn} onClick={() => { setIsDetailOpen(false); setIsEditOpen(true); }}>📝</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ POPUP 3: แก้ไขปฏิทิน */}
      {isEditOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={styles.modalTitle}>แก้ไขปฏิทิน</strong>
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

      {/* ❌ POPUP 4: ยืนยันการลบข้อมูล */}
      {isDeleteOpen && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, width: '340px', textAlign: 'center', padding: '30px 20px' }}>
            <div style={styles.deleteIconContainer}>🗑️</div>
            <strong style={{ fontSize: '18px', display: 'block', marginBottom: '6px', color: '#000' }}>ยืนยันการลบ</strong>
            <p style={{ color: '#666', fontSize: '13px', margin: '0 0 25px 0' }}>คุณต้องการลบข้อมูลนี้หรือไม่</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button type="button" style={styles.btnCancel} onClick={() => { setIsDeleteOpen(false); clearForm(); }}>ยกเลิก</button>
              <button type="button" style={styles.btnConfirmDelete} onClick={handleDeleteSubmit}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  contentBody: { padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' },
  calendarCard: { border: '1px solid #999', borderRadius: '6px', padding: '20px', backgroundColor: '#fff', width: '100%', maxWidth: '780px', boxSizing: 'border-box' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  calendarMonthTitle: { fontSize: '16px', fontWeight: '500', color: '#000' },
  arrowBtn: { padding: '3px 8px', backgroundColor: '#f5f5f5', border: '1px solid #dcdcdc', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', width: '100%' },
  dayOfWeekLabel: { textAlign: 'center', fontSize: '13px', paddingBottom: '8px', color: '#222', fontWeight: 'bold' },
  dayCell: { border: '1px solid #cccccc', borderRadius: '6px', minHeight: '80px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', cursor: 'pointer' },
  dayCellEmpty: { minHeight: '80px', boxSizing: 'border-box' },
  dayNumberText: { alignSelf: 'flex-start', fontSize: '11px', color: '#444' },
  eventBadgeContent: { display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left', gap: '2px', marginTop: '4px' },
  eventTitleText: { fontSize: '10px', fontWeight: 'bold', color: '#000', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
  eventTimeText: { fontSize: '9px', color: '#555', paddingLeft: '6px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#fff', width: '350px', padding: '25px', borderRadius: '12px', border: '1px solid #999', position: 'relative', boxSizing: 'border-box' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  modalTitle: { fontSize: '16px', color: '#000', fontWeight: 'bold' },
  closeX: { cursor: 'pointer', fontWeight: 'bold', color: '#aaa', fontSize: '14px' },
  label: { display: 'block', fontSize: '12px', color: '#333', marginBottom: '5px', marginTop: '10px', textAlign: 'left' },
  input: { width: '100%', padding: '8px', border: '1px solid #aaa', borderRadius: '5px', boxSizing: 'border-box', fontSize: '13px' },
  inputReadOnly: { width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', borderRadius: '5px', boxSizing: 'border-box', fontSize: '13px', color: '#333' },
  modalActionRow: { display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' },
  iconActionBtn: { width: '40px', height: '40px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  btnSubmit: { width: '100%', padding: '9px', marginTop: '20px', backgroundColor: '#fff', border: '1px solid #333', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  deleteIconContainer: { fontSize: '40px', marginBottom: '10px' },
  btnCancel: { padding: '8px 24px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', color: '#333' },
  btnConfirmDelete: { padding: '8px 24px', backgroundColor: '#d9534f', border: '1px solid #d43f3a', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', color: '#fff', fontWeight: 'bold' }
};