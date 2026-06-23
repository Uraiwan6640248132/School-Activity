import React, { useState, useEffect } from 'react';

export default function CalendarActivity() {
  const [calendarList, setCalendarList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🌟 ใช้ State ในการเก็บปีและเดือนปัจจุบัน
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // เดือน 8 = สิงหาคม

  // 🔒 ควบคุมเฉพาะหน้าต่างรายละเอียด (ตัดหน้าต่างเพิ่ม แก้ไข และลบออกเพื่อความปลอดภัย)
  const [isDetailOpen, setIsDetailOpen] = useState(false); 

  // กิจกรรมที่ถูกเลือก
  const [selectedEvent, setSelectedEvent] = useState(null);

  // โครงสร้าง state ฟอร์มสำหรับแสดงผล
  const [formData, setFormData] = useState({
    Name: '',
    Date: '',
    Time: ''
  });

  const API_URL = 'http://localhost:3001/api/calendar';

  // ดึงข้อมูลกิจกรรมทั้งหมด (ยังคงดึงค่าแบบปกติ)
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

  const clearForm = () => {
    setFormData({ Name: '', Date: '', Time: '' });
    setSelectedEvent(null);
  };

  // ปรับฟังก์ชันจับคู่กิจกรรมให้คำนวณตามปีและเดือนที่กำลังเปิดดูอยู่จริง ๆ
  const getEventForDate = (dayNumber) => {
    if (!calendarList || calendarList.length === 0) return null;

    const currentDayStr = String(dayNumber).padStart(2, '0');
    const currentMonthStr = String(currentMonth).padStart(2, '0');
    const currentYearStr = String(currentYear);

    return calendarList.find(item => {
      const rawDate = item.Date || item.date;
      if (!rawDate) return false;

      const cleanDateOnly = String(rawDate).split('T')[0]; // ผลลัพธ์จะเป็น "YYYY-MM-DD"
      const parts = cleanDateOnly.split('-');
      
      if (parts.length >= 3) {
        const dbYear = parts[0];
        const dbMonth = String(parseInt(parts[1], 10)).padStart(2, '0'); 
        const dbDay = parts[2];   

        return dbYear === currentYearStr && dbMonth === currentMonthStr && dbDay === currentDayStr;
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

    let cleanDate = '';
    if (rawDate) {
      cleanDate = String(rawDate).split('T')[0];
    }

    setFormData({
      Name: rawName || '',
      Date: cleanDate,
      Time: rawTime || ''
    });
    setIsDetailOpen(true); 
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    return String(timeStr); 
  };

  // ฟังก์ชันสำหรับเลื่อนเดือนย้อนกลับ (<) และเลื่อนไปข้างหน้า (>)
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const monthNamesThai = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  // คำนวณหาจำนวนวันในเดือนนั้น ๆ และวันเริ่มต้นของสัปดาห์
  const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysInMonthArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
  const emptySpacesArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  return (
    <div style={styles.contentBody}>
      {loading && <p style={{ fontSize: '13px', color: '#666' }}>กำลังอัปเดตปฏิทิน...</p>}
      
      <div style={styles.calendarCard}>
        <div style={styles.calendarHeader}>
          <span style={styles.calendarMonthTitle}>
            ปฏิทินกิจกรรม - {monthNamesThai[currentMonth - 1]} {currentYear + 543}
          </span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button style={styles.arrowBtn} onClick={handlePrevMonth}>&lt;</button>
            <button style={styles.arrowBtn} onClick={handleNextMonth}>&gt;</button>
          </div>
        </div>

        <div style={styles.calendarGrid}>
          {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
            <div key={day} style={styles.dayOfWeekLabel}>{day}</div>
          ))}

          {/* ช่องว่างก่อนเริ่มวันที่ 1 ของเดือน */}
          {emptySpacesArray.map((val) => (
            <div key={`empty-${val}`} style={styles.dayCellEmpty} />
          ))}

          {/* รายการวันที่ในเดือน */}
          {daysInMonthArray.map((day) => {
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
                  border: isSelected ? '2px solid #000' : '1px solid #dcdcdc',
                  // 🔒 ถ้าไม่มีกิจกรรมในวันนั้น จะไม่แสดง Cursor รูปมือ เพื่อบ่งบอกว่าคลิกทำรายการไม่ได้
                  cursor: eventItem ? 'pointer' : 'default' 
                }} 
                onClick={() => {
                  // 🔒 ล็อกสิทธิ์: จะทำงานและเปิด Popup เฉพาะเมื่อวันนั้นมีกิจกรรมอยู่แล้วเท่านั้น
                  if (eventItem) {
                    handleSelectEvent(eventItem);
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

      {/* 🔍 POPUP: รายละเอียดปฏิทิน (แบบอ่านอย่างเดียวอย่างสมบูรณ์) */}
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
              
              {/* 🔒 ลบปุ่มไอคอนถังขยะ (ลบ) และ ดินสอ (แก้ไข) ในส่วนนี้ออกเพื่อป้องกันการเปลี่ยนสถานะข้อมูล */}
              <button 
                type="button" 
                style={styles.btnClose} 
                onClick={() => { setIsDetailOpen(false); clearForm(); }}
              >
                ปิดหน้าต่าง
              </button>
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
  dayCell: { border: '1px solid #cccccc', borderRadius: '6px', minHeight: '80px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' },
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
  inputReadOnly: { width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', borderRadius: '5px', boxSizing: 'border-box', fontSize: '13px', color: '#333' },
  // 🟢 สไตล์ปุ่มกดปิดหน้าต่างใหม่ ดีไซน์ให้เรียบง่ายเข้ากับโหมดอ่านข้อมูล
  btnClose: { width: '100%', padding: '9px', marginTop: '20px', backgroundColor: '#f5f5f5', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: '#333' }
};