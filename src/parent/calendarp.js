import React, { useState, useEffect } from 'react';

export default function CalendarActivity() {
  const [calendarList, setCalendarList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🌟 ใช้ State ในการเก็บปีและเดือนปัจจุบัน (เริ่มต้นที่ สิงหาคม 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // เดือน 8 = สิงหาคม

  // ควบคุมหน้าต่าง Popups ทั้ง 4 ตัว
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // กิจกรรมที่ถูกเลือก
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ✍️ State สำหรับพิมพ์เวลาเอง 4 ช่อง (เก็บเป็น String เพื่อให้พิมพ์และลบง่าย)
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('12');
  const [endMinute, setEndMinute] = useState('00');

  // โครงสร้าง state ฟอร์มส่งข้อมูลไปยังฐานข้อมูล
  const [formData, setFormData] = useState({
    Name: '',
    Date: '',
    Time: '',
    Location: '',
    User_id: 1
  });

  // 🔒 ระบบตรวจสอบสิทธิ์ผู้ใช้งาน (Role Check)
  const getLoggedInUser = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  };

  const loggedInUser = getLoggedInUser();
  const loggedInRole = String(loggedInUser?.Role || loggedInUser?.role || '').trim();
  const isParent = loggedInRole === 'ผู้ปกครอง'; // เช็คว่าเป็นผู้ปกครองหรือไม่

  const API_URL = 'http://localhost:3001/api/calendar';

  // 🔄 ผูกค่าเวลาจาก 4 ช่องพิมพ์มารรวมกันใน formData.Time เสมอเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    const formatPad = (val) => String(val || '00').padStart(2, '0');

    setFormData(prev => ({
      ...prev,
      Time: `${formatPad(startHour)}:${formatPad(startMinute)} - ${formatPad(endHour)}:${formatPad(endMinute)}`
    }));
  }, [startHour, startMinute, endHour, endMinute]);

  // ดึงข้อมูลกิจกรรมทั้งหมด
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

  // บันทึกเพิ่มกิจกรรมใหม่ (POST)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (isParent) return alert("คุณไม่มีสิทธิ์ในการทำรายการนี้");
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
    if (isParent) return alert("คุณไม่มีสิทธิ์ในการทำรายการนี้");
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
    if (isParent) return alert("คุณไม่มีสิทธิ์ในการทำรายการนี้");
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
    setFormData({ Name: '', Date: '', Time: '09:00 - 12:00', Location: '', User_id: 1 });
    setStartHour('09');
    setStartMinute('00');
    setEndHour('12');
    setEndMinute('00');
    setSelectedEvent(null);
  };

  // จับคู่กิจกรรมให้คำนวณตามปีและเดือนที่กำลังเปิดดูอยู่จริง ๆ
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

  // เมื่อคลิกเลือกดูงานบนช่องปฏิทิน
  const handleSelectEvent = (eventItem) => {
    setSelectedEvent(eventItem);

    const rawDate = eventItem.Date || eventItem.date;
    const rawName = eventItem.Name || eventItem.name;
    const rawTime = eventItem.Time || eventItem.time;
    const rawLocation = eventItem.Location || eventItem.location;
    const rawUserId = eventItem.User_id || eventItem.user_id;

    let cleanDate = '';
    if (rawDate) {
      cleanDate = String(rawDate).split('T')[0];
    }

    if (rawTime && rawTime.includes('-')) {
      const parts = rawTime.split('-');
      const startTime = parts[0].trim().split(':');
      const endTime = parts[1].trim().split(':');

      if (startTime.length === 2) {
        setStartHour(startTime[0].padStart(2, '0'));
        setStartMinute(startTime[1].padStart(2, '0'));
      }
      if (endTime.length === 2) {
        setEndHour(endTime[0].padStart(2, '0'));
        setEndMinute(endTime[1].padStart(2, '0'));
      }
    } else {
      setStartHour('09'); setStartMinute('00'); setEndHour('12'); setEndMinute('00');
    }

    setFormData({
      Name: rawName || '',
      Date: cleanDate,
      Time: rawTime || '09:00 - 12:00',
      Location: rawLocation || '',
      User_id: rawUserId || 1
    });
    setIsDetailOpen(true);
  };

  // คลิกพื้นที่ช่องว่างปฏิทินเพื่อเริ่มกรอกเพิ่มงานใหม่
  const openAddModalOnDate = (dayNumber) => {
    clearForm();
    const formattedDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, Date: formattedDate }));
    setIsAddOpen(true);
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

  const handleTimeBlur = (val, setter, maxVal) => {
    if (!val || isNaN(val)) {
      setter('00');
      return;
    }
    let num = parseInt(val, 10);
    if (num < 0) num = 0;
    if (num > maxVal) num = maxVal;
    setter(String(num).padStart(2, '0'));
  };

  return (
    <div style={styles.contentBody}>
      {loading && <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>กำลังอัปเดตปฏิทิน...</p>}

      {/* 🌟 กรอบปฏิทินหลักใช้ Class ระบบร่วมกับสีพาสเทล */}
      <div className="app-card" style={styles.calendarCard}>
        <div style={styles.calendarHeader}>
          <span style={styles.calendarMonthTitle}>
            ปฏิทินกิจกรรมโรงเรียน - {monthNamesThai[currentMonth - 1]} {currentYear + 543}
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
                  backgroundColor: eventItem ? '#f0f9ff' : '#fff',
                  border: isSelected ? '2px solid var(--brand-500)' : '1px solid var(--line, #e2e8f0)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (eventItem) {
                    handleSelectEvent(eventItem);
                  } else {
                    // 🔒 ตรวจสอบสิทธิ์: ถ้าเป็นผู้ปกครอง ห้ามเปิด Modal เพิ่มปฏิทิน
                    if (isParent) {
                      alert("เฉพาะเจ้าหน้าที่หรือครูผู้สอนเท่านั้นที่สามารถเพิ่มกิจกรรมปฏิทินได้");
                      return;
                    }
                    openAddModalOnDate(day);
                  }
                }}
              >
                <span style={styles.dayNumberText}>{day}</span>
                {eventItem && (
                  <div style={styles.eventBadgeContent}>
                    <div style={styles.eventTitleText}>• {eventItem.Name || eventItem.name}</div>
                    <div style={styles.eventTimeText}>🕒 {formatTimeDisplay(eventItem.Time || eventItem.time)}</div>
                    <div style={styles.eventLocationText}>📍 {eventItem.Location || eventItem.location || 'ไม่ระบุ'}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 📥 POPUP 1: เพิ่มปฏิทิน */}
      {isAddOpen && !isParent && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={styles.modalTitle}>📥 เพิ่มปฏิทิน</strong>
              <span style={styles.closeX} onClick={() => { setIsAddOpen(false); clearForm(); }}>X</span>
            </div>
            <form onSubmit={handleAddSubmit}>
              <label className="app-label">ชื่อกิจกรรม</label>
              <input type="text" className="app-input" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required />

              <label className="app-label">วัน/เดือน/ปี</label>
              <input type="date" className="app-input" value={formData.Date} onChange={(e) => setFormData({ ...formData, Date: e.target.value })} required />

              <label className="app-label">เวลาที่จัด</label>
              <div style={styles.timeInputContainer}>
                <input
                  type="number" placeholder="00" min="0" max="23" style={styles.inputTime}
                  value={startHour} onChange={(e) => setStartHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" placeholder="00" min="0" max="59" style={styles.inputTime}
                  value={startMinute} onChange={(e) => setStartMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartMinute, 59)} required
                />

                <span style={{ margin: '0 6px', color: '#64748b', fontSize: '13px' }}>ถึง</span>

                <input
                  type="number" placeholder="00" min="0" max="23" style={styles.inputTime}
                  value={endHour} onChange={(e) => setEndHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" placeholder="00" min="0" max="59" style={styles.inputTime}
                  value={endMinute} onChange={(e) => setEndMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndMinute, 59)} required
                />
                <span style={{ fontSize: '12px', color: '#475569', marginLeft: '4px', fontWeight: '700' }}>น.</span>
              </div>

              <label className="app-label">สถานที่</label>
              <input type="text" className="app-input" placeholder="กรอกสถานที่จัดกิจกรรม" value={formData.Location} onChange={(e) => setFormData({ ...formData, Location: e.target.value })} required />

              <button type="submit" className="teacher-btn teacher-btn-save teacher-btn-full" style={{ marginTop: '24px' }}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 POPUP 2: รายละเอียดปฏิทิน */}
      {isDetailOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={styles.modalTitle}>🔍 รายละเอียดกิจกรรม</strong>
              <span style={styles.closeX} onClick={() => { setIsDetailOpen(false); clearForm(); }}>X</span>
            </div>
            <div>
              <label className="app-label">ชื่อกิจกรรม</label>
              <input type="text" className="app-input" style={{ backgroundColor: '#f1f5f9' }} value={formData.Name} readOnly />

              <label className="app-label">วัน/เดือน/ปี</label>
              <input type="text" className="app-input" style={{ backgroundColor: '#f1f5f9' }} value={formData.Date} readOnly />

              <label className="app-label">เวลาที่จัด</label>
              <input type="text" className="app-input" style={{ backgroundColor: '#f1f5f9' }} value={formatTimeDisplay(formData.Time)} readOnly />

              <label className="app-label">สถานที่จัดกิจกรรม</label>
              <input type="text" className="app-input" style={{ backgroundColor: '#f1f5f9' }} value={formData.Location || 'ไม่ระบุสถานที่'} readOnly />

              {/* 🔒 แยกการแสดงผลปุ่มควบคุมตามระดับสิทธิ์ */}
              {!isParent ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="teacher-btn teacher-btn-edit teacher-btn-flex" onClick={() => { setIsDetailOpen(false); setIsEditOpen(true); }}>แก้ไข</button>
                  <button type="button" className="teacher-btn teacher-btn-delete teacher-btn-flex" onClick={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}>ลบ</button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                  <button type="button" className="teacher-btn teacher-btn-cancel" style={{ width: '100%' }} onClick={() => { setIsDetailOpen(false); clearForm(); }}>ปิดหน้าต่าง</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✏️ POPUP 3: แก้ไขปฏิทิน */}
      {isEditOpen && !isParent && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={styles.modalTitle}>✏️ แก้ไขปฏิทิน</strong>
              <span style={styles.closeX} onClick={() => { setIsEditOpen(false); clearForm(); }}>X</span>
            </div>
            <form onSubmit={handleEditSubmit}>
              <label className="app-label">ชื่อกิจกรรม</label>
              <input type="text" className="app-input" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required />

              <label className="app-label">วัน/เดือน/ปี</label>
              <input type="date" className="app-input" value={formData.Date} onChange={(e) => setFormData({ ...formData, Date: e.target.value })} required />

              <label className="app-label">เวลาที่จัด</label>
              <div style={styles.timeInputContainer}>
                <input
                  type="number" min="0" max="23" style={styles.inputTime}
                  value={startHour} onChange={(e) => setStartHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" min="0" max="59" style={styles.inputTime}
                  value={startMinute} onChange={(e) => setStartMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartMinute, 59)} required
                />

                <span style={{ margin: '0 6px', color: '#64748b', fontSize: '13px' }}>ถึง</span>

                <input
                  type="number" min="0" max="23" style={styles.inputTime}
                  value={endHour} onChange={(e) => setEndHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" min="0" max="59" style={styles.inputTime}
                  value={endMinute} onChange={(e) => setEndMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndMinute, 59)} required
                />
                <span style={{ fontSize: '12px', color: '#475569', marginLeft: '4px', fontWeight: '700' }}>น.</span>
              </div>

              <label className="app-label">สถานที่</label>
              <input type="text" className="app-input" value={formData.Location} onChange={(e) => setFormData({ ...formData, Location: e.target.value })} required />

              <button type="submit" className="teacher-btn teacher-btn-save teacher-btn-full" style={{ marginTop: '24px' }}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* ❌ POPUP 4: ยืนยันการลบข้อมูล */}
      {isDeleteOpen && !isParent && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, padding: '30px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🗑️</div>
            <strong style={{ fontSize: '18px', display: 'block', marginBottom: '6px', color: '#1e293b' }}>ยืนยันการลบ</strong>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 25px 0' }}>คุณต้องการลบข้อมูลนี้หรือไม่</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button type="button" className="teacher-btn teacher-btn-cancel" onClick={() => { setIsDeleteOpen(false); clearForm(); }}>ยกเลิก</button>
              <button type="button" className="teacher-btn teacher-btn-delete" onClick={handleDeleteSubmit}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// โครงสร้าง CSS แบบ CSS-in-JS สำหรับจัดการ Layout และความยืดหยุ่นของ Grid ปฏิทิน
const styles = {
  contentBody: { padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', boxSizing: 'border-box', backgroundColor: '#dff3ff 48%' },
  calendarCard: { width: '100%', maxWidth: '840px', boxSizing: 'border-box' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  calendarMonthTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--brand-700, #0369a1)' },
  arrowBtn: { padding: '6px 12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#64748b', transition: 'all 0.2s' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', width: '100%' },
  dayOfWeekLabel: { textAlign: 'center', fontSize: '13px', paddingBottom: '8px', color: 'var(--text)', fontWeight: '700' },
  dayCell: { borderRadius: '8px', minHeight: '95px', padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', transition: 'all 0.15s ease' },
  dayCellEmpty: { minHeight: '95px', boxSizing: 'border-box' },
  dayNumberText: { alignSelf: 'flex-start', fontSize: '12px', color: '#64748b', fontWeight: '600' },
  eventBadgeContent: { display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left', gap: '2px', marginTop: '4px' },
  eventTitleText: { fontSize: '11px', fontWeight: '700', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
  eventTimeText: { fontSize: '10px', color: '#475569', paddingLeft: '2px' },
  eventLocationText: { fontSize: '10px', color: 'var(--brand-600, #0284c7)', paddingLeft: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '600' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#fff', width: '360px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  modalTitle: { fontSize: '18px', color: 'var(--text)', fontWeight: '700' },
  closeX: { cursor: 'pointer', fontWeight: '700', color: '#94a3b8', fontSize: '16px' },
  timeInputContainer: { display: 'flex', alignItems: 'center', gap: '4px', width: '100%', marginTop: '4px', marginBottom: '12px' },
  inputTime: { padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', width: '56px', textAlign: 'center', outline: 'none' }
};