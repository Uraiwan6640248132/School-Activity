import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  X,
  MapPin,
  Clock,
  User,
  CalendarDays,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';

function CalendarActivity() {
  const [calendarList, setCalendarList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('12');
  const [endMinute, setEndMinute] = useState('00');

  const [formData, setFormData] = useState({
    Name: '',
    Date: '',
    Time: '',
    Location: '',
    User_id: 1
  });

  const API_URL = 'http://localhost:3001/api/calendar';

  useEffect(() => {
    const formatPad = (val) => String(val || '00').padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      Time: `${formatPad(startHour)}:${formatPad(startMinute)} - ${formatPad(endHour)}:${formatPad(endMinute)}`
    }));
  }, [startHour, startMinute, endHour, endMinute]);

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

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && 
           currentMonth === today.getMonth() + 1 && 
           currentYear === today.getFullYear();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดปฏิทิน...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <CalendarDays size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>ปฏิทินกิจกรรม</h1>
              <p style={styles.subTitle}>
                <span style={styles.activityCount}>{calendarList.length}</span> กิจกรรมในปฏิทิน
              </p>
            </div>
          </div>
          <button
            onClick={() => { setIsAddOpen(true); clearForm(); }}
            style={styles.btnPrimary}
          >
            <Plus size={18} />
            เพิ่มกิจกรรม
          </button>
        </div>

        {/* Calendar */}
        <div style={styles.calendarCard}>
          {/* Month Navigation */}
          <div style={styles.calendarHeader}>
            <div style={styles.monthDisplay}>
              <Sparkles size={18} color="#4A90D9" />
              <span style={styles.monthText}>
                {monthNamesThai[currentMonth - 1]} {currentYear + 543}
              </span>
            </div>
            <div style={styles.navButtons}>
              <button onClick={handlePrevMonth} style={styles.navBtn}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleNextMonth} style={styles.navBtn}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div style={styles.dayHeaders}>
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
              <div key={day} style={styles.dayHeader}>{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={styles.calendarGrid}>
            {emptySpacesArray.map((val) => (
              <div key={`empty-${val}`} style={styles.emptyCell} />
            ))}

            {daysInMonthArray.map((day) => {
              const eventItem = getEventForDate(day);
              const isSelected = selectedEvent && eventItem &&
                ((selectedEvent.Calendar_id && selectedEvent.Calendar_id === eventItem.Calendar_id) ||
                  (selectedEvent.calendar_id && selectedEvent.calendar_id === eventItem.calendar_id));
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day}
                  style={{
                    ...styles.dayCell,
                    backgroundColor: eventItem ? '#F0F7FF' : '#FFFFFF',
                    borderColor: isSelected ? '#4A90D9' : isTodayDate ? '#4A90D9' : '#E2E8F0',
                    borderWidth: isSelected || isTodayDate ? '2px' : '1px',
                  }}
                  onClick={() => {
                    if (eventItem) {
                      handleSelectEvent(eventItem);
                    } else {
                      openAddModalOnDate(day);
                    }
                  }}
                >
                  <div style={styles.dayNumberWrapper}>
                    <span style={{
                      ...styles.dayNumber,
                      backgroundColor: isTodayDate ? '#4A90D9' : 'transparent',
                      color: isTodayDate ? '#FFFFFF' : '#1A202C',
                    }}>
                      {day}
                    </span>
                  </div>
                  {eventItem && (
                    <div style={styles.eventPreview}>
                      <div style={styles.eventTitle}>{eventItem.Name || eventItem.name}</div>
                      <div style={styles.eventMeta}>
                        <Clock size={10} color="#64748B" />
                        <span>{formatTimeDisplay(eventItem.Time || eventItem.time)}</span>
                      </div>
                      <div style={styles.eventLocation}>
                        <MapPin size={10} color="#64748B" />
                        <span>{eventItem.Location || eventItem.location || 'ไม่ระบุ'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: '#F0F7FF', border: '1px solid #4A90D9' }} />
            <span>มีกิจกรรม</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }} />
            <span>ไม่มีกิจกรรม</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: '#4A90D9' }} />
            <span>วันนี้</span>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) { setIsAddOpen(false); clearForm(); }
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Plus size={20} color="#4A90D9" />
                เพิ่มกิจกรรมในปฏิทิน
              </h2>
              <button onClick={() => { setIsAddOpen(false); clearForm(); }} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อกิจกรรม *</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  placeholder="กรอกชื่อกิจกรรม"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันที่ *</label>
                <input
                  type="date"
                  style={styles.formInput}
                  value={formData.Date}
                  onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>เวลา</label>
                <div style={styles.timeInputGroup}>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    style={styles.timeInput}
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    onBlur={(e) => handleTimeBlur(e.target.value, setStartHour, 23)}
                    required
                  />
                  <span style={styles.timeSeparator}>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    style={styles.timeInput}
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    onBlur={(e) => handleTimeBlur(e.target.value, setStartMinute, 59)}
                    required
                  />
                  <span style={styles.timeRange}>ถึง</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    style={styles.timeInput}
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    onBlur={(e) => handleTimeBlur(e.target.value, setEndHour, 23)}
                    required
                  />
                  <span style={styles.timeSeparator}>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    style={styles.timeInput}
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    onBlur={(e) => handleTimeBlur(e.target.value, setEndMinute, 59)}
                    required
                  />
                  <span style={styles.timeUnit}>น.</span>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <MapPin size={14} style={styles.labelIcon} />
                  สถานที่ *
                </label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={formData.Location}
                  onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                  placeholder="กรอกสถานที่จัดกิจกรรม"
                  required
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                <CheckCircle size={18} />
                บันทึกกิจกรรม
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) { setIsDetailOpen(false); clearForm(); }
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Eye size={20} color="#4A90D9" />
                รายละเอียดกิจกรรม
              </h2>
              <button onClick={() => { setIsDetailOpen(false); clearForm(); }} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.detailContent}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📌 ชื่อกิจกรรม</span>
                <span style={styles.detailValue}>{formData.Name}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📅 วันที่</span>
                <span style={styles.detailValue}>{formData.Date}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🕐 เวลา</span>
                <span style={styles.detailValue}>{formatTimeDisplay(formData.Time)}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📍 สถานที่</span>
                <span style={styles.detailValue}>{formData.Location || 'ไม่ระบุ'}</span>
              </div>
            </div>
            <div style={styles.detailActions}>
              <button
                onClick={() => { setIsDetailOpen(false); setIsEditOpen(true); }}
                style={styles.detailEditBtn}
              >
                <Edit2 size={16} />
                แก้ไข
              </button>
              <button
                onClick={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}
                style={styles.detailDeleteBtn}
              >
                <Trash2 size={16} />
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) { setIsEditOpen(false); clearForm(); }
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Edit2 size={20} color="#F39C12" />
                แก้ไขกิจกรรม
              </h2>
              <button onClick={() => { setIsEditOpen(false); clearForm(); }} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อกิจกรรม *</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันที่ *</label>
                <input
                  type="date"
                  style={styles.formInput}
                  value={formData.Date}
                  onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>เวลา</label>
                <div style={styles.timeInputGroup}>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    style={styles.timeInput}
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    onBlur={(e) => handleTimeBlur(e.target.value, setStartHour, 23)}
                    required
                  />
                  <span style={styles.timeSeparator}>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    style={styles.timeInput}
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    onBlur={(e) => handleTimeBlur(e.target.value, setStartMinute, 59)}
                    required
                  />
                  <span style={styles.timeRange}>ถึง</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    style={styles.timeInput}
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    onBlur={(e) => handleTimeBlur(e.target.value, setEndHour, 23)}
                    required
                  />
                  <span style={styles.timeSeparator}>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    style={styles.timeInput}
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    onBlur={(e) => handleTimeBlur(e.target.value, setEndMinute, 59)}
                    required
                  />
                  <span style={styles.timeUnit}>น.</span>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <MapPin size={14} style={styles.labelIcon} />
                  สถานที่ *
                </label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={formData.Location}
                  onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                  required
                />
              </div>

              <button type="submit" style={{ ...styles.submitBtn, backgroundColor: '#F39C12' }}>
                <CheckCircle size={18} />
                อัปเดตข้อมูล
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) { setIsDeleteOpen(false); clearForm(); }
        }}>
          <div style={styles.deleteModalContent}>
            <div style={styles.deleteIcon}>🗑️</div>
            <h3 style={styles.deleteTitle}>ยืนยันการลบ</h3>
            <p style={styles.deleteText}>คุณต้องการลบกิจกรรมนี้หรือไม่?</p>
            <p style={styles.deleteSubText}>การดำเนินการนี้ไม่สามารถกู้คืนได้</p>
            <div style={styles.deleteActions}>
              <button onClick={() => { setIsDeleteOpen(false); clearForm(); }} style={styles.cancelBtn}>
                ยกเลิก
              </button>
              <button onClick={handleDeleteSubmit} style={styles.confirmDeleteBtn}>
                <Trash2 size={16} />
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  wrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    color: '#4A90D9',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: '16px',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.25)',
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
  },
  subTitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  activityCount: {
    fontWeight: '700',
    color: '#4A90D9',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
  },

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  monthDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  monthText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A202C',
  },
  navButtons: {
    display: 'flex',
    gap: '6px',
  },
  navBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#64748B',
  },

  dayHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
    marginBottom: '8px',
  },
  dayHeader: {
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#94A3B8',
    padding: '8px 0',
  },

  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
  },
  emptyCell: {
    minHeight: '100px',
    borderRadius: '10px',
  },
  dayCell: {
    minHeight: '100px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  dayNumberWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '4px',
  },
  dayNumber: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1A202C',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  eventPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    marginTop: '2px',
  },
  eventTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1A202C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  eventMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '9px',
    color: '#64748B',
  },
  eventLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '9px',
    color: '#4A90D9',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '16px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748B',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '4px',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '480px',
    padding: '28px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1A202C',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },

  formGroup: {
    marginBottom: '18px',
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '6px',
  },
  labelIcon: {
    color: '#94A3B8',
  },
  formInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: '#FAFBFC',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxSizing: 'border-box',
  },

  timeInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  timeInput: {
    padding: '8px 4px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#FAFBFC',
    width: '48px',
    textAlign: 'center',
    outline: 'none',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  timeSeparator: {
    color: '#94A3B8',
    fontSize: '14px',
  },
  timeRange: {
    color: '#64748B',
    fontSize: '13px',
    margin: '0 4px',
  },
  timeUnit: {
    fontSize: '12px',
    color: '#64748B',
    marginLeft: '2px',
  },

  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '8px',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
  },

  // Detail
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '14px',
    color: '#1A202C',
    fontWeight: '600',
  },
  detailActions: {
    display: 'flex',
    gap: '12px',
  },
  detailEditBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  detailDeleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#FDEDEC',
    color: '#E74C3C',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  // Delete Modal
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    padding: '32px 28px',
    textAlign: 'center',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
  },
  deleteIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  deleteTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1A202C',
    margin: '0 0 8px 0',
  },
  deleteText: {
    fontSize: '15px',
    color: '#475569',
    margin: '0',
  },
  deleteSubText: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: '4px 0 24px 0',
  },
  deleteActions: {
    display: 'flex',
    gap: '12px',
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  confirmDeleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#E74C3C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.2)',
  },
};

// Global CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .day-cell {
      min-height: 80px !important;
    }
    .day-number {
      font-size: 11px !important;
      width: 24px !important;
      height: 24px !important;
    }
    .event-title {
      font-size: 9px !important;
    }
    .event-meta, .event-location {
      font-size: 8px !important;
    }
    .month-text {
      font-size: 16px !important;
    }
    .time-input {
      width: 40px !important;
      font-size: 12px !important;
    }
  }
  
  @media (max-width: 480px) {
    .day-cell {
      min-height: 70px !important;
      padding: 4px !important;
    }
    .day-number {
      font-size: 10px !important;
      width: 20px !important;
      height: 20px !important;
    }
    .header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .btn-primary {
      width: 100% !important;
      justify-content: center !important;
    }
    .modal-content {
      padding: 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default CalendarActivity;