import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
  Users,
  FileText,
  UserCheck
} from "lucide-react";

const BASE_URL = "http://localhost:3001";

function NotificationParent() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🟢 1. ดึงรายชื่อเด็กทั้งหมดของผู้ปกครองจาก user ใน localStorage
  const getParentStudents = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.students || [];
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    return [];
  };

  const students = getParentStudents();

  // 🟢 2. สร้าง State สำหรับเด็กที่เลือกอยู่ปัจจุบัน (ดึงจาก selectedStudent หรือใช้เด็กคนแรก)
  const [selectedStudent, setSelectedStudent] = useState(() => {
    const saved = localStorage.getItem("selectedStudent");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return students.length > 0 ? students[0] : null;
  });

  // 🟢 3. ดึงชั้นเรียนของเด็กที่เลือกอยู่
  const currentClassLevel = selectedStudent?.Class_level || selectedStudent?.class_level || "";

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/notifications`);
      setList(res.data);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 4. สลับการเลือกเด็ก และบันทึกลง localStorage
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    localStorage.setItem("selectedStudent", JSON.stringify(student));
  };

  // 🟢 5. กรองการบ้านตามชั้นเรียนของเด็กที่เลือกอยู่ตอนนี้
  const filteredList = list.filter((item) => {
    const currentClass = item.Class_level || item.class_level;
    if (!currentClass || !currentClassLevel) return false;

    const dbClass = String(currentClass).replace(/\s+/g, "").trim();
    const targetClass = String(currentClassLevel).replace(/\s+/g, "").trim();

    return dbClass === targetClass;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดข้อมูลการแจ้งเตือน...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* Header พร้อม Dropdown เลือกเด็ก */}
<div style={styles.header}>
  <div style={styles.headerLeft}>
    <div style={styles.headerIcon}>
      <Bell size={24} color="#FFFFFF" />
    </div>
    <div>
      <h1 style={styles.mainTitle}>การแจ้งเตือนการบ้าน</h1>
      <p style={styles.subTitle}>
        <span style={styles.countBadge}>{filteredList.length}</span> รายการการบ้าน
        <span style={styles.classLabel}> 
          | ชั้น {currentClassLevel || "ไม่ระบุชั้นเรียน"}
        </span>
      </p>
    </div>
  </div>

  {/* 🟢 Dropdown สลับบุตรหลาน / ชั้นเรียน */}
  {students.length > 0 && (
    <div style={styles.dropdownContainer}>
      <label htmlFor="studentSelect" style={styles.dropdownLabel}>
        <Users size={16} color="#475569" />
        เลือกบุตรหลาน:
      </label>
      <select
        id="studentSelect"
        value={selectedStudent?.Student_id || selectedStudent?.id || ""}
        onChange={(e) => {
          const selectedId = e.target.value;
          const foundStudent = students.find(
            (s) => String(s.Student_id || s.id) === String(selectedId)
          );
          if (foundStudent) {
            handleSelectStudent(foundStudent);
          }
        }}
        style={styles.selectInput}
      >
        {students.map((std, idx) => (
          <option 
            key={std.Student_id || std.id || idx} 
            value={std.Student_id || std.id}
          >
            {std.FirstName || std.name || `คนที่ ${idx + 1}`} ({std.Class_level || std.class_level})
          </option>
        ))}
      </select>
    </div>
  )}
</div>

        {/* Notification Grid */}
        {filteredList.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell size={56} color="#CBD5E1" />
            <p style={styles.emptyText}>ไม่มีรายการแจ้งเตือนการบ้าน</p>
            <p style={styles.emptySubText}>
              ยังไม่มีการมอบหมายการบ้านใหม่สำหรับ {currentClassLevel || "ชั้นเรียนนี้"} ในขณะนี้
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredList.map((item, index) => {
              const deadlineStr = (item.Deadline || item.deadline)?.split("T")[0];
              const dateStr = (item.Date || item.date)?.split("T")[0];

              return (
                <div
                  key={item.Notification_id || item.notification_id || index}
                  style={styles.card}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.cardSubject}>
                      <BookOpen size={16} color="#4A90D9" />
                      <span style={styles.subjectText}>
                        {item.Subject || item.subject || "ไม่ระบุวิชา"}
                      </span>
                    </div>
                    <div style={styles.cardBadge}>
                      <Users size={12} color="#4A90D9" />
                      {item.Class_level || item.class_level}
                    </div>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.detailsContainer}>
                      <FileText size={14} color="#94A3B8" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <p style={styles.cardDetails}>
                        {item.Details || item.details || "ไม่มีรายละเอียดเพิ่มเติม"}
                      </p>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.cardDates}>
                      <div style={styles.dateItemHighlight}>
                        <Calendar size={14} color="#E74C3C" />
                        <span>
                          กำหนดส่ง: <strong style={{ color: '#E74C3C' }}>{deadlineStr || "-"}</strong>
                        </span>
                      </div>
                      <div style={styles.dateItem}>
                        <Clock size={14} color="#94A3B8" />
                        <span>วันที่สั่งงาน: {dateStr || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
    maxWidth: '1200px',
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
    backgroundColor: '#F8FAFC',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
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
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
    backgroundColor: '#FFFFFF',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
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
    fontSize: '22px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
  },
  subTitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  countBadge: {
    fontWeight: '700',
    color: '#4A90D9',
  },
  classLabel: {
    color: '#64748B',
    fontWeight: '500',
  },

  dropdownContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#F8FAFC',
    padding: '8px 14px',
    borderRadius: '12px',
    border: '1px solid #CBD5E1',
  },
  dropdownLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    whiteSpace: 'nowrap',
  },
  selectInput: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #94A3B8',
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: "'Kanit', sans-serif",
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 18px 12px',
    borderBottom: '1px solid #F1F5F9',
  },
  cardSubject: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  subjectText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1A202C',
  },
  cardBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '500',
    color: '#4A90D9',
    backgroundColor: '#EBF3FB',
    padding: '3px 10px',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
  },
  cardBody: {
    padding: '14px 18px',
    flex: 1,
  },
  detailsContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  cardDetails: {
    fontSize: '14px',
    color: '#475569',
    margin: 0,
    lineHeight: '1.6',
    whiteSpace: 'pre-line',
  },
  cardFooter: {
    padding: '12px 18px 16px',
    borderTop: '1px solid #F1F5F9',
    backgroundColor: '#FAFBFC',
  },
  cardDates: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dateItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94A3B8',
  },
  dateItemHighlight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#475569',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    marginTop: '20px',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#475569',
    margin: '16px 0 4px 0',
  },
  emptySubText: {
    fontSize: '14px',
    color: '#94A3B8',
    margin: 0,
  },
};

export default NotificationParent;