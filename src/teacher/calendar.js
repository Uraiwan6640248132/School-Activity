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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', padding: '20px', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}>
      {loading && <p style={{ fontSize: '13px', color: '#666' }}>กำลังอัปเดตปฏิทิน...</p>}

      {/* 🌟 กรอบปฏิทินหลักใช้ Class ของระบบ */}
      <div className="app-card" style={{ width: '100%', maxWidth: '780px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--brand-700)' }}>
            ปฏิทินกิจกรรม - {monthNamesThai[currentMonth - 1]} {currentYear + 543}
          </span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button style={{ padding: '5px 10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }} onClick={handlePrevMonth}>&lt;</button>
            <button style={{ padding: '5px 10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }} onClick={handleNextMonth}>&gt;</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', width: '100%' }}>
          {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: '14px', paddingBottom: '8px', color: 'var(--text)', fontWeight: '700' }}>{day}</div>
          ))}

          {emptySpacesArray.map((val) => (
            <div key={`empty-${val}`} style={{ minHeight: '95px', boxSizing: 'border-box' }} />
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
                  borderRadius: '8px',
                  minHeight: '95px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: eventItem ? '#f0f9ff' : '#fff',
                  border: isSelected ? '2px solid var(--brand-500)' : '1px solid #e2e8f0'
                }}
                onClick={() => {
                  if (eventItem) {
                    handleSelectEvent(eventItem);
                  } else {
                    openAddModalOnDate(day);
                  }
                }}
              >
                <span style={{ alignSelf: 'flex-start', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{day}</span>
                {eventItem && (
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left', gap: '2px', marginTop: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>• {eventItem.Name || eventItem.name}</div>
                    <div style={{ fontSize: '10px', color: '#475569', paddingLeft: '2px' }}>🕒 {formatTimeDisplay(eventItem.Time || eventItem.time)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--brand-600)', paddingLeft: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '600' }}>📍 {eventItem.Location || eventItem.location || 'ไม่ระบุ'}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 📥 POPUP 1: เพิ่มปฏิทิน */}
      {isAddOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '360px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <strong style={{ fontSize: '18px', color: 'var(--text)', fontWeight: '700' }}>เพิ่มปฏิทิน</strong>
              <span style={{ cursor: 'pointer', fontWeight: '700', color: '#94a3b8', fontSize: '16px' }} onClick={() => { setIsAddOpen(false); clearForm(); }}>X</span>
            </div>
            <form onSubmit={handleAddSubmit}>
              <label className="app-label">ชื่อกิจกรรม</label>
              <input type="text" className="app-input" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required />

              <label className="app-label">วัน/เดือน/ปี</label>
              <input type="date" className="app-input" value={formData.Date} onChange={(e) => setFormData({ ...formData, Date: e.target.value })} required />

              <label className="app-label">เวลาที่จัด</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', marginTop: '4px' }}>
                <input
                  type="number" placeholder="00" min="0" max="23" style={{ padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', width: '56px', textAlign: 'center', outline: 'none' }}
                  value={startHour} onChange={(e) => setStartHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" placeholder="00" min="0" max="59" style={{ padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', width: '56px', textAlign: 'center', outline: 'none' }}
                  value={startMinute} onChange={(e) => setStartMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartMinute, 59)} required
                />

                <span style={{ margin: '0 6px', color: '#666' }}>ถึง</span>

                <input
                  type="number" placeholder="00" min="0" max="23" style={{ padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', width: '56px', textAlign: 'center', outline: 'none' }}
                  value={endHour} onChange={(e) => setEndHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" placeholder="00" min="0" max="59" style={{ padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', width: '56px', textAlign: 'center', outline: 'none' }}
                  value={endMinute} onChange={(e) => setEndMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndMinute, 59)} required
                />
                <span style={{ fontSize: '12px', color: '#333', marginLeft: '2px' }}>น.</span>
              </div>

              <label className="app-label">สถานที่</label>
              <input type="text" className="app-input" placeholder="กรอกสถานที่จัดกิจกรรม" value={formData.Location} onChange={(e) => setFormData({ ...formData, Location: e.target.value })} required />

              <button type="submit" className="teacher-btn teacher-btn-save teacher-btn-full" style={{ marginTop: '20px' }}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 POPUP 2: รายละเอียดปฏิทิน */}
      {isDetailOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '360px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <strong style={{ fontSize: '18px', color: 'var(--text)', fontWeight: '700' }}>รายละเอียดปฏิทิน</strong>
              <span style={{ cursor: 'pointer', fontWeight: '700', color: '#94a3b8', fontSize: '16px' }} onClick={() => { setIsDetailOpen(false); clearForm(); }}>X</span>
            </div>
            <div>
              <label className="app-label">ชื่อกิจกรรม</label>
              <input type="text" className="app-input" value={formData.Name} readOnly />

              <label className="app-label">วัน/เดือน/ปี</label>
              <input type="text" className="app-input" value={formData.Date} readOnly />

              <label className="app-label">เวลาที่จัด</label>
              <input type="text" className="app-input" value={formatTimeDisplay(formData.Time)} readOnly />

              <label className="app-label">สถานที่</label>
              <input type="text" className="app-input" value={formData.Location || 'ไม่ระบุสถานที่'} readOnly />

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="teacher-btn teacher-btn-edit"
                  onClick={() => { setIsDetailOpen(false); setIsEditOpen(true); }}
                >
                   แก้ไข
                </button>
                <button
                  type="button"
                  className="teacher-btn teacher-btn-delete"
                  onClick={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}
                >
                   ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ POPUP 3: แก้ไขปฏิทิน */}
      {isEditOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '360px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <strong style={{ fontSize: '18px', color: 'var(--text)', fontWeight: '700' }}>แก้ไขปฏิทิน</strong>
              <span style={{ cursor: 'pointer', fontWeight: '700', color: '#94a3b8', fontSize: '16px' }} onClick={() => { setIsEditOpen(false); clearForm(); }}>X</span>
            </div>
            <form onSubmit={handleEditSubmit}>
              <label className="app-label">ชื่อกิจกรรม</label>
              <input type="text" className="app-input" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required />

              <label className="app-label">วัน/เดือน/ปี</label>
              <input type="date" className="app-input" value={formData.Date} onChange={(e) => setFormData({ ...formData, Date: e.target.value })} required />

              <label className="app-label">เวลาที่จัด</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', marginTop: '4px' }}>
                <input
                  type="number" min="0" max="23" style={{ padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', width: '56px', textAlign: 'center', outline: 'none' }}
                  value={startHour} onChange={(e) => setStartHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" min="0" max="59" style={{ padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', width: '56px', textAlign: 'center', outline: 'none' }}
                  value={startMinute} onChange={(e) => setStartMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setStartMinute, 59)} required
                />

                <span style={{ margin: '0 6px', color: '#666' }}>ถึง</span>

                <input
                  type="number" min="0" max="23" style={{ padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', width: '56px', textAlign: 'center', outline: 'none' }}
                  value={endHour} onChange={(e) => setEndHour(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndHour, 23)} required
                />
                <span>:</span>
                <input
                  type="number" min="0" max="59" style={{ padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', width: '56px', textAlign: 'center', outline: 'none' }}
                  value={endMinute} onChange={(e) => setEndMinute(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value, setEndMinute, 59)} required
                />
                <span style={{ fontSize: '12px', color: '#333', marginLeft: '2px' }}>น.</span>
              </div>

              <label className="app-label">สถานที่</label>
              <input type="text" className="app-input" value={formData.Location} onChange={(e) => setFormData({ ...formData, Location: e.target.value })} required />

              <button type="submit" className="teacher-btn teacher-btn-save teacher-btn-full" style={{ marginTop: '20px' }}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* ❌ POPUP 4: ยืนยันการลบข้อมูล */}
      {isDeleteOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '340px', padding: '30px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🗑️</div>
            <strong style={{ fontSize: '18px', display: 'block', marginBottom: '6px', color: '#000' }}>ยืนยันการลบ</strong>
            <p style={{ color: '#666', fontSize: '13px', margin: '0 0 25px 0' }}>คุณต้องการลบข้อมูลนี้หรือไม่</p>
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

export default CalendarActivity;