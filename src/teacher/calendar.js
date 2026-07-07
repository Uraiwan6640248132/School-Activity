import React, { useState, useEffect } from 'react';

function CalendarActivity() {
  const [calendarList, setCalendarList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🌟 ใช้ State ในการเก็บปีและเดือนปัจจุบัน (เริ่มต้นที่ สิงหาคม 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // เดือน 8 = สิงหาคม

  // ควบคุมหน้าต่าง Popups
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

  const API_URL = 'http://localhost:3001/api/calendar';

  // 🔄 ผูกค่าเวลาจาก 4 ช่องพิมพ์มารวมกันใน formData.Time เสมอเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    // ฟังก์ชันช่วยเติมเลข 0 ข้างหน้ากรณีผู้ใช้พิมพ์ตัวเลขตัวเดียว เช่น "9" -> "09"
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

    // แยกช่วงเวลาที่บันทึกไว้กลับมาใส่ใน Input พิมพ์ตัวเลข (รองรับ "HH:MM - HH:MM")
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

  const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysInMonthArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
  const emptySpacesArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  // ฟังก์ชันช่วยจัดฟอร์แมตตัวเลขเมื่อหลุดโฟกัสออกไป (Blur) ให้เป็นเลข 2 หลักเสมอ
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

              {/* ✍️ เปลี่ยนเป็นช่อง พิมพ์ตัวเลขเอง 4 ช่อง */}
              <label style={styles.label}>เวลาที่จัด</label>
              <div style={styles.timeRow}>
                <input
                  type="number" placeholder="00" min="0" max="23" style={styles.timeInput}
                  value={startHour} onChange={(e) => setStartHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" placeholder="00" min="0" max="59" style={styles.timeInput}
                  value={startMinute} onChange={(e) => setStartMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartMinute, 59)} required
                />

                <span style={{ margin: '0 6px', color: '#666' }}>ถึง</span>

                <input
                  type="number" placeholder="00" min="0" max="23" style={styles.timeInput}
                  value={endHour} onChange={(e) => setEndHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" placeholder="00" min="0" max="59" style={styles.timeInput}
                  value={endMinute} onChange={(e) => setEndMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndMinute, 59)} required
                />
                <span style={{ fontSize: '12px', color: '#333', marginLeft: '2px' }}>น.</span>
              </div>

              <label style={styles.label}>สถานที่</label>
              <input type="text" style={styles.input} placeholder="กรอกสถานที่จัดกิจกรรม" value={formData.Location} onChange={(e) => setFormData({ ...formData, Location: e.target.value })} required />

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

              <label style={styles.label}>สถานที่</label>
              <input type="text" style={styles.inputReadOnly} value={formData.Location || 'ไม่ระบุสถานที่'} readOnly />

              <div style={styles.modalActionRow}>
                <button type="button" style={{ ...styles.iconActionBtn, ...styles.iconDeleteBtn }} onClick={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}>🗑️</button>
                <button type="button" style={{ ...styles.iconActionBtn, ...styles.iconEditBtn }} onClick={() => { setIsDetailOpen(false); setIsEditOpen(true); }}>📝</button>
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

              {/* ✍️ ช่องพิมพ์ตัวเลขเอง 4 ช่องในหน้าแก้ไข */}

              <label style={styles.label}>เวลาที่จัด</label>
              <div style={styles.timeRow}>
                <input
                  type="number" min="0" max="23" style={styles.timeInput}
                  value={startHour} onChange={(e) => setStartHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" min="0" max="59" style={styles.timeInput}
                  value={startMinute} onChange={(e) => setStartMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartMinute, 59)} required
                />

                <span style={{ margin: '0 6px', color: '#666' }}>ถึง</span>

                <input
                  type="number" min="0" max="23" style={styles.timeInput}
                  value={endHour} onChange={(e) => setEndHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" min="0" max="59" style={styles.timeInput}
                  value={endMinute} onChange={(e) => setEndMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndMinute, 59)} required
                />
                <span style={{ fontSize: '12px', color: '#333', marginLeft: '2px' }}>น.</span>
              </div>

              <label style={styles.label}>สถานที่</label>
              <input type="text" style={styles.input} value={formData.Location} onChange={(e) => setFormData({ ...formData, Location: e.target.value })} required />

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
  dayCell: { border: '1px solid #cccccc', borderRadius: '6px', minHeight: '90px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', cursor: 'pointer' },
  dayCellEmpty: { minHeight: '90px', boxSizing: 'border-box' },
  dayNumberText: { alignSelf: 'flex-start', fontSize: '11px', color: '#444' },
  eventBadgeContent: { display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left', gap: '2px', marginTop: '4px' },
  eventTitleText: { fontSize: '10px', fontWeight: 'bold', color: '#000', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
  eventTimeText: { fontSize: '9px', color: '#555', paddingLeft: '4px' },
  eventLocationText: { fontSize: '9px', color: '#0284c7', paddingLeft: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '500' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#fff', width: '350px', padding: '25px', borderRadius: '12px', border: '1px solid #999', position: 'relative', boxSizing: 'border-box' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  modalTitle: { fontSize: '16px', color: '#000', fontWeight: 'bold' },
  closeX: { cursor: 'pointer', fontWeight: 'bold', color: '#aaa', fontSize: '14px' },
  label: { display: 'block', fontSize: '12px', color: '#333', marginBottom: '5px', marginTop: '10px', textAlign: 'left' },
  input: { width: '100%', padding: '8px', border: '1px solid #aaa', borderRadius: '5px', boxSizing: 'border-box', fontSize: '13px' },
  inputReadOnly: { width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', borderRadius: '5px', boxSizing: 'border-box', fontSize: '13px', color: '#333' },
  modalActionRow: { display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' },
  iconActionBtn: { width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
  iconEditBtn: { backgroundColor: '#eff8ff', color: '#0369a1', border: '1px solid #bae6fd' },
  iconDeleteBtn: { backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' },
  btnSubmit: { width: '100%', padding: '10px', marginTop: '20px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#ffffff', border: '1px solid #0284c7', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 10px 22px rgba(14,165,233,0.22)' },
  deleteIconContainer: { fontSize: '40px', marginBottom: '10px' },
  btnCancel: { padding: '8px 24px', backgroundColor: '#fff', border: '1px solid #cfe8f7', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#31556b', fontWeight: '700' },
  btnConfirmDelete: { padding: '8px 24px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#be123c', fontWeight: '700' },

  // ✍️ สไตล์เพิ่มเติมสำหรับแถวกรอกตัวเลขเวลาเอง 4 ช่อง
  timeRow: { display: 'flex', alignItems: 'center', gap: '4px', width: '100%' },
  timeInput: { padding: '6px 4px', border: '1px solid #aaa', borderRadius: '5px', fontSize: '13px', backgroundColor: '#fff', width: '52px', textAlign: 'center' }
};

export default CalendarActivity;
