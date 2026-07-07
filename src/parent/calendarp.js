import React, { useState, useEffect } from 'react';

export default function CalendarActivity() {
  const [calendarList, setCalendarList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🌟 ใช้ State ในการเก็บปีและเดือนปัจจุบัน
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // เดือน 8 = สิงหาคม

  // 🔒 ควบคุมเฉพาะหน้าต่างรายละเอียด
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [formData, setFormData] = useState({
    Name: '',
    Date: '',
    Time: '',
    Location: ''
  });

  const API_URL = 'http://localhost:3001/api/calendar';

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

  const clearForm = () => {
    setFormData({ Name: '', Date: '', Time: '', Location: '' });
    setSelectedEvent(null);
  };

  const getEventForDate = (dayNumber) => {
    if (!calendarList || calendarList.length === 0) return null;

    const currentDayStr = String(dayNumber).padStart(2, '0');
    const currentMonthStr = String(currentMonth).padStart(2, '0');
    const currentYearStr = String(currentYear);

    return calendarList.find(item => {
      const rawDate = item.Date || item.date;
      if (!rawDate) return false;

      const cleanDateOnly = String(rawDate).split('T')[0];
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

  const handleSelectEvent = (eventItem) => {
    setSelectedEvent(eventItem);

    const rawDate = eventItem.Date || eventItem.date;
    const rawName = eventItem.Name || eventItem.name;
    const rawTime = eventItem.Time || eventItem.time;
    const rawLocation = eventItem.Location || eventItem.location;

    let cleanDate = '';
    if (rawDate) {
      cleanDate = String(rawDate).split('T')[0];
    }

    setFormData({
      Name: rawName || '',
      Date: cleanDate,
      Time: rawTime || '',
      Location: rawLocation || 'ไม่ระบุสถานที่'
    });
    setIsDetailOpen(true);
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    return String(timeStr);
  };

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

  const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysInMonthArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
  const emptySpacesArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  return (
    <div style={styles.contentBody}>
      {loading && <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>กำลังอัปเดตปฏิทิน...</p>}

      <div style={styles.calendarCard}>
        <div style={styles.calendarHeader}>
          <span style={styles.calendarMonthTitle}>
            📅 ปฏิทินกิจกรรมโรงเรียน - {monthNamesThai[currentMonth - 1]} {currentYear + 543}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button style={styles.arrowBtn} onClick={handlePrevMonth}>&lt;</button>
            <button style={styles.arrowBtn} onClick={handleNextMonth}>&gt;</button>
          </div>
        </div>

        <div style={styles.calendarGrid}>
          {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
            <div key={day} style={styles.dayOfWeekLabel}>{day}</div>
          ))}

          {emptySpacesArray.map((val) => (
            <div key={`empty-${val}`} style={styles.dayCellEmpty} />
          ))}

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
                  // 🎨 ปรับสีพื้นหลังวันที่มีกิจกรรมให้เป็นสีฟ้าอ่อนพาสเทล ดูสบายตาขึ้น
                  backgroundColor: eventItem ? '#f0f9ff' : '#fff',
                  border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  cursor: eventItem ? 'pointer' : 'default'
                }}
                onClick={() => {
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
                      🕒 {formatTimeDisplay(eventItem.Time || eventItem.time)}
                    </div>
                    <div style={styles.eventLocationText}>
                      📍 {eventItem.Location || eventItem.location || 'ไม่ระบุ'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔍 POPUP: รายละเอียดปฏิทิน */}
      {isDetailOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={styles.modalTitle}>🔍 รายละเอียดกิจกรรม</strong>
              <span style={styles.closeX} onClick={() => { setIsDetailOpen(false); clearForm(); }}>X</span>
            </div>
            <div>
              <label style={styles.label}>ชื่อกิจกรรม</label>
              <input type="text" style={styles.inputReadOnly} value={formData.Name} readOnly />

              <label style={styles.label}>วัน/เดือน/ปี</label>
              <input type="text" style={styles.inputReadOnly} value={formData.Date} readOnly />

              <label style={styles.label}>เวลาที่จัด</label>
              <input type="text" style={styles.inputReadOnly} value={formatTimeDisplay(formData.Time)} readOnly />

              <label style={styles.label}>สถานที่จัดกิจกรรม</label>
              <input type="text" style={styles.inputReadOnly} value={formData.Location} readOnly />

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

// 🎨 อัปเดตสไตล์ให้ซอฟต์ ละมุน และดูเป็นสากลขึ้นครับ
const styles = {
  contentBody: { padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', boxSizing: 'border-box', backgroundColor: '#f8fafc' },
  calendarCard: { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', backgroundColor: '#fff', width: '100%', maxWidth: '840px', boxSizing: 'border-box', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  calendarMonthTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  arrowBtn: { padding: '6px 12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#64748b', transition: 'all 0.2s' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', width: '100%' },
  dayOfWeekLabel: { textAlign: 'center', fontSize: '13px', paddingBottom: '8px', color: '#64748b', fontWeight: '700' },
  dayCell: { border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '95px', padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', transition: 'all 0.15s ease' },
  dayCellEmpty: { minHeight: '95px', boxSizing: 'border-box' },
  dayNumberText: { alignSelf: 'flex-start', fontSize: '12px', color: '#64748b', fontWeight: '600' },
  eventBadgeContent: { display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left', gap: '2px', marginTop: '4px' },
  eventTitleText: { fontSize: '11px', fontWeight: '700', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
  eventTimeText: { fontSize: '10px', color: '#475569', paddingLeft: '2px' },
  eventLocationText: { fontSize: '10px', color: '#0284c7', paddingLeft: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '500' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#fff', width: '360px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  modalTitle: { fontSize: '18px', color: '#1e293b', fontWeight: '700' },
  closeX: { cursor: 'pointer', fontWeight: '700', color: '#94a3b8', fontSize: '16px' },
  label: { display: 'block', fontSize: '12px', color: '#475569', marginBottom: '5px', marginTop: '12px', textAlign: 'left', fontWeight: '600' },
  inputReadOnly: { width: '100%', padding: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px', color: '#1e293b', outline: 'none' },
  btnClose: { width: '100%', padding: '10px', marginTop: '24px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#475569', transition: 'all 0.2s' }
};