import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  Search,
  Save,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Activity,
  School,
  FileSpreadsheet,
  Sparkles
} from "lucide-react";

function ParticipatingActivities() {
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggedInClassId, setLoggedInClassId] = useState("");
  const [className, setClassName] = useState("กำลังโหลด...");

  const API_URL = "http://localhost:3001";

  // ✅ ฟังก์ชันโหลดข้อมูลห้องเรียนจาก API โดยตรง
  const fetchUserClass = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // ถ้ามี user.id ให้ดึงข้อมูลล่าสุดจาก API
      if (user.id || user.User_id) {
        const userId = user.id || user.User_id;
        const response = await axios.get(`${API_URL}/users/${userId}`);
        const latestUser = response.data;
        
        // อัปเดต localStorage ด้วยข้อมูลล่าสุด
        const updatedUser = { ...user, ...latestUser };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // กำหนด Class_level จาก API
        const classLevel = latestUser.Class_level || user.Class_level || "1";
        localStorage.setItem("teacher_class_id", classLevel);
        localStorage.setItem("class_id", classLevel);
        
        setLoggedInClassId(classLevel);
        setClassName(classLevel);
        
        // ดึงชื่อห้องเรียนที่ถูกต้อง
        await fetchClassName(classLevel);
        
        return classLevel;
      } else {
        // Fallback ถ้าไม่มี user ใน localStorage
        const fallbackClass = localStorage.getItem("teacher_class_id") || "1";
        setLoggedInClassId(fallbackClass);
        setClassName(fallbackClass);
        await fetchClassName(fallbackClass);
        return fallbackClass;
      }
    } catch (err) {
      console.error("Error fetching user class:", err);
      // ใช้ค่าจาก localStorage เป็น fallback
      const fallbackClass = localStorage.getItem("teacher_class_id") || 
                           localStorage.getItem("class_id") || "1";
      setLoggedInClassId(fallbackClass);
      setClassName(fallbackClass);
      return fallbackClass;
    }
  };

  const fetchClassName = async (classId) => {
    try {
      const res = await axios.get(`${API_URL}/attendance/class/${encodeURIComponent(classId)}`);
      if (res.data && (res.data.name || res.data.Class_level)) {
        const name = res.data.name || res.data.Class_level;
        setClassName(name);
        localStorage.setItem("teacher_class_name", name);
        return name;
      }
    } catch (err) {
      console.error("Error fetching class name:", err);
      if (!localStorage.getItem("teacher_class_name")) {
        setClassName(`ห้องเรียน ID: ${classId}`);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchUserClass();
      await fetchActivitiesData();
      setLoading(false);
    };
    init();
  }, []);

  const fetchActivitiesData = async () => {
    try {
      const resActivity = await axios.get(`${API_URL}/attendance/activities`);
      const actData = Array.isArray(resActivity.data) ? resActivity.data : (resActivity.data.data || []);
      setActivities(actData);
    } catch (err) {
      console.error("ดึงข้อมูลกิจกรรมไม่สำเร็จ:", err);
    }
  };

  useEffect(() => {
    if (selectedActivity && loggedInClassId) {
      fetchStudents(selectedActivity, loggedInClassId);
    } else {
      setStudents([]);
    }
  }, [selectedActivity, loggedInClassId]);

  const fetchStudents = async (activityId, targetClassId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/attendance/students?activity=${activityId}&class=${encodeURIComponent(targetClassId)}`
      );
      const rawStudents = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      const formattedData = rawStudents.map((s) => ({
        ...s,
        attended: s.attended !== undefined ? Boolean(s.attended) : true,
      }));
      setStudents(formattedData);
    } catch (err) {
      console.error("ดึงรายชื่อนักเรียนไม่สำเร็จ:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = students.length;
  const attendedCount = students.filter((s) => s.attended).length;
  const absentCount = totalStudents - attendedCount;
  const attendedPercentage = totalStudents > 0 ? ((attendedCount / totalStudents) * 100).toFixed(1) : "0.0";
  const absentPercentage = totalStudents > 0 ? ((absentCount / totalStudents) * 100).toFixed(1) : "0.0";

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ? true :
          filterStatus === "attended" ? student.attended :
            !student.attended;
      return matchesSearch && matchesFilter;
    });
  }, [students, searchTerm, filterStatus]);

  const handleStatusChange = (studentId, status) => {
    if (isViewMode) return;
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, attended: status } : student
      )
    );
  };

  const handleSelectAll = (status) => {
    if (isViewMode) return;
    setStudents((prev) => prev.map((s) => ({ ...s, attended: status })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedActivity) return alert("กรุณาเลือกกิจกรรมก่อนบันทึก");

    const payload = {
      activity_id: parseInt(selectedActivity, 10),
      class_id: loggedInClassId,
      attendance_list: students.map((s) => ({
        student_id: s.id,
        attended: s.attended,
      })),
    };

    setSaving(true);
    try {
      await axios.post(`${API_URL}/attendance/save`, payload);
      alert("บันทึกการเข้าร่วมกิจกรรมเรียบร้อยแล้ว!");
      await fetchStudents(selectedActivity, loggedInClassId);
      setIsViewMode(true);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    if (students.length === 0) return alert("ไม่มีข้อมูลสำหรับส่งออก");

    const currentActivityName = activities.find(a => String(a.id) === String(selectedActivity))?.name || "กิจกรรม";

    let csvContent = "\uFEFF";
    csvContent += `รายงานการเข้าร่วมกิจกรรม,${currentActivityName}\n`;
    csvContent += `ห้องเรียน,${className}\n\n`;
    csvContent += `สรุปสถิติ\n`;
    csvContent += `นักเรียนทั้งหมด,${totalStudents},คน\n`;
    csvContent += `เข้าร่วม,${attendedCount},คน (${attendedPercentage}%)\n`;
    csvContent += `ไม่เข้าร่วม,${absentCount},คน (${absentPercentage}%)\n\n`;
    csvContent += `ลำดับ,ชื่อ - นามสกุล,สถานะการเข้าร่วม\n`;

    students.forEach((s, idx) => {
      csvContent += `${idx + 1},"${s.name}",${s.attended ? "เข้าร่วม" : "ไม่เข้าร่วม"}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `รายงาน_${className}_${currentActivityName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ ปุ่มรีเซ็ตห้องเรียน
  const resetClass = () => {
    localStorage.removeItem('teacher_class_id');
    localStorage.removeItem('class_id');
    localStorage.removeItem('classId');
    localStorage.removeItem('teacher_class_name');
    window.location.reload();
  };

  if (loading && !students.length) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header Banner */}
        <div style={styles.topBanner}>
          <div style={styles.classInfo}>
            <div style={styles.classIconWrapper}>
              <School size={18} color="#FFFFFF" />
            </div>
            <div>
              <span style={styles.classLabel}>ห้องเรียน</span>
              <span style={styles.className}>{className}</span>
              <span style={styles.classId}>ID: {loggedInClassId}</span>
            </div>
          </div>
          <div style={styles.topActions}>
            <button
              onClick={resetClass}
              style={styles.resetBtn}
            >
              🔄 รีเซ็ต
            </button>
            <div style={styles.modeTabs}>
              <button
                type="button"
                onClick={() => setIsViewMode(false)}
                style={{
                  ...styles.tabBtn,
                  ...(!isViewMode ? styles.tabBtnActive : {})
                }}
              >
                <Edit3 size={14} />
                บันทึก
              </button>
              <button
                type="button"
                onClick={() => setIsViewMode(true)}
                style={{
                  ...styles.tabBtn,
                  ...(isViewMode ? styles.tabBtnActive : {})
                }}
              >
                <Eye size={14} />
                ประวัติ
              </button>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div style={styles.mainCard}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <div>
              <h1 style={styles.title}>
                {isViewMode ? "ประวัติการเข้าร่วมกิจกรรม" : "บันทึกการเข้าร่วมกิจกรรม"}
              </h1>
              <p style={styles.subtitle}>
                <Sparkles size={14} color="#4A90D9" />
                จัดการการเข้าร่วมกิจกรรมนักเรียนในห้องเรียน
              </p>
            </div>
            {selectedActivity && students.length > 0 && (
              <button type="button" onClick={exportToCSV} style={styles.exportBtn}>
                <FileSpreadsheet size={16} />
                ส่งออก CSV
              </button>
            )}
          </div>

          {/* Select Activity */}
          <div style={styles.selectSection}>
            <label style={styles.inputLabel}>
              <CalendarDays size={16} style={styles.labelIcon} />
              เลือกกิจกรรม
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              style={styles.selectInput}
            >
              <option value="">-- กรุณาเลือกกิจกรรม --</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics */}
          {selectedActivity !== "" && (
            <div style={styles.summaryGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIconWrapperBlue}>
                  <Users size={18} color="#4A90D9" />
                </div>
                <div style={styles.statContent}>
                  <span style={styles.statLabel}>นักเรียนทั้งหมด</span>
                  <span style={styles.statValue}>{totalStudents} <span style={styles.statUnit}>คน</span></span>
                </div>
              </div>

              <div style={{ ...styles.statCard, backgroundColor: '#F0FDF4' }}>
                <div style={{ ...styles.statIconWrapperBlue, backgroundColor: '#D1FAE5' }}>
                  <UserCheck size={18} color="#16A34A" />
                </div>
                <div style={styles.statContent}>
                  <span style={{ ...styles.statLabel, color: '#166534' }}>เข้าร่วม</span>
                  <span style={{ ...styles.statValue, color: '#15803D' }}>
                    {attendedCount} <span style={styles.statUnit}>คน ({attendedPercentage}%)</span>
                  </span>
                </div>
              </div>

              <div style={{ ...styles.statCard, backgroundColor: '#FEF2F2' }}>
                <div style={{ ...styles.statIconWrapperBlue, backgroundColor: '#FEE2E2' }}>
                  <UserX size={18} color="#DC2626" />
                </div>
                <div style={styles.statContent}>
                  <span style={{ ...styles.statLabel, color: '#991B1B' }}>ไม่เข้าร่วม</span>
                  <span style={{ ...styles.statValue, color: '#DC2626' }}>
                    {absentCount} <span style={styles.statUnit}>คน ({absentPercentage}%)</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar */}
          {selectedActivity && students.length > 0 && (
            <div style={styles.toolbar}>
              <div style={styles.searchWrapper}>
                <Search size={16} color="#94A3B8" style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อนักเรียน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={styles.clearSearchBtn}
                  >
                    <XCircle size={14} />
                  </button>
                )}
              </div>

              <div style={styles.filterGroup}>
                <button
                  type="button"
                  onClick={() => setFilterStatus("all")}
                  style={{
                    ...styles.filterChip,
                    ...(filterStatus === "all" ? styles.filterChipActive : {})
                  }}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("attended")}
                  style={{
                    ...styles.filterChip,
                    ...(filterStatus === "attended" ? styles.filterChipActive : {})
                  }}
                >
                  <CheckCircle size={12} />
                  เข้าร่วม
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("absent")}
                  style={{
                    ...styles.filterChip,
                    ...(filterStatus === "absent" ? styles.filterChipActive : {})
                  }}
                >
                  <XCircle size={12} />
                  ไม่เข้าร่วม
                </button>
              </div>

              {!isViewMode && (
                <div style={styles.bulkActions}>
                  <button type="button" onClick={() => handleSelectAll(true)} style={styles.bulkBtnSuccess}>
                    <CheckCircle size={14} />
                    เข้าร่วมหมด
                  </button>
                  <button type="button" onClick={() => handleSelectAll(false)} style={styles.bulkBtnDanger}>
                    <XCircle size={14} />
                    ไม่เข้าร่วมหมด
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}>
              <div style={styles.colIndex}>#</div>
              <div style={styles.colName}>รายชื่อนักเรียน</div>
              <div style={styles.colStatus}>สถานะการเข้าร่วม</div>
            </div>

            <div style={styles.tableBody}>
              {!selectedActivity ? (
                <div style={styles.emptyState}>
                  <Activity size={40} color="#CBD5E1" />
                  <p>📌 กรุณาเลือกกิจกรรมเพื่อแสดงรายชื่อ</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div style={styles.emptyState}>
                  <Search size={40} color="#CBD5E1" />
                  <p>ไม่พบรายชื่อนักเรียนของห้องนี้</p>
                </div>
              ) : (
                filteredStudents.map((student, index) => (
                  <div key={student.id} style={styles.tableRow}>
                    <div style={styles.colIndex}>
                      {index + 1}
                    </div>
                    <div style={styles.colName}>
                      <span>{student.name}</span>
                    </div>
                    <div style={styles.colStatus}>
                      {!isViewMode ? (
                        <div style={styles.toggleGroup}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, true)}
                            style={{
                              ...styles.toggleBtn,
                              ...(student.attended ? styles.toggleBtnActive : {}),
                              ...(student.attended ? styles.toggleBtnSuccess : {})
                            }}
                          >
                            <CheckCircle size={14} />
                            เข้าร่วม
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, false)}
                            style={{
                              ...styles.toggleBtn,
                              ...(!student.attended ? styles.toggleBtnActive : {}),
                              ...(!student.attended ? styles.toggleBtnDanger : {})
                            }}
                          >
                            <XCircle size={14} />
                            ไม่เข้าร่วม
                          </button>
                        </div>
                      ) : (
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: student.attended ? '#DCFCE7' : '#FEE2E2',
                            color: student.attended ? '#15803D' : '#DC2626',
                          }}
                        >
                          {student.attended ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {student.attended ? "เข้าร่วม" : "ไม่เข้าร่วม"}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Actions */}
          {students.length > 0 && (
            <div style={styles.footerRow}>
              {!isViewMode ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={styles.primarySubmitBtn}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} style={styles.spinnerSmall} />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      บันทึกการเข้าร่วมกิจกรรม
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsViewMode(false)}
                  style={styles.secondaryEditBtn}
                >
                  <Edit3 size={18} />
                  แก้ไขการเข้าร่วม
                </button>
              )}
            </div>
          )}
        </div>
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
    maxWidth: '960px',
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
  spinnerSmall: {
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: '16px',
  },

  topBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: '14px 20px',
    borderRadius: '16px',
    marginBottom: '20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  classInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  classIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#94A3B8',
    display: 'block',
  },
  className: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1A202C',
    marginRight: '8px',
  },
  classId: {
    fontSize: '12px',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  resetBtn: {
    padding: '6px 14px',
    backgroundColor: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    transition: 'all 0.2s ease',
  },
  modeTabs: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#F1F5F9',
    padding: '4px',
    borderRadius: '10px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    padding: '7px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    color: '#4A90D9',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
  },

  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
  },
  subtitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#718096',
    margin: '4px 0 0 0',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    backgroundColor: '#27AE60',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(39, 174, 96, 0.2)',
  },

  selectSection: {
    marginBottom: '24px',
  },
  inputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '8px',
  },
  labelIcon: {
    color: '#4A90D9',
  },
  selectInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    fontSize: '14px',
    color: '#1A202C',
    outline: 'none',
    backgroundColor: '#FAFBFC',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    appearance: 'auto',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '14px 18px',
    backgroundColor: '#FFFFFF',
  },
  statIconWrapperBlue: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#EBF3FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#94A3B8',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A202C',
  },
  statUnit: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#94A3B8',
  },

  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '12px 16px',
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '180px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 36px 8px 38px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterGroup: {
    display: 'flex',
    gap: '4px',
  },
  filterChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: 'none',
    padding: '5px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  filterChipActive: {
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bulkActions: {
    display: 'flex',
    gap: '6px',
  },
  bulkBtnSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 12px',
    backgroundColor: '#F0FDF4',
    color: '#166534',
    border: '1px solid #BBF7D0',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  bulkBtnDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 12px',
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  tableContainer: {
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: '12px 16px',
    borderBottom: '1px solid #E2E8F0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1px solid #F1F5F9',
    transition: 'background 0.15s ease',
  },
  colIndex: {
    width: '50px',
    textAlign: 'center',
    flexShrink: 0,
    color: '#94A3B8',
    fontSize: '13px',
  },
  colName: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
    color: '#1E293B',
    fontSize: '14px',
  },
  colStatus: {
    width: '220px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  toggleGroup: {
    display: 'inline-flex',
    backgroundColor: '#F1F5F9',
    borderRadius: '8px',
    padding: '3px',
    gap: '2px',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: 'none',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  toggleBtnActive: {
    fontWeight: '600',
  },
  toggleBtnSuccess: {
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
  },
  toggleBtnDanger: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    padding: '5px 14px',
    borderRadius: '12px',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#94A3B8',
    fontSize: '14px',
    gap: '12px',
  },

  footerRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
  },
  primarySubmitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 32px',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.25)',
  },
  secondaryEditBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 32px',
    backgroundColor: '#FFFFFF',
    color: '#334155',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
};

export default ParticipatingActivities;