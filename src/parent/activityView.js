import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  Search,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Activity,
  Eye,
  User,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";

function ActivityView() {
  const [activities, setActivities] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // State สำหรับรายชื่อลูกและตัวที่เลือก
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const API_URL = "http://localhost:3001";

  // ดึง Parent ID จาก localStorage
  const getLoggedInParentId = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed.Parent_id || parsed.user_id || parsed.id || "1";
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
    return localStorage.getItem("user_id") || "1";
  };

  const loggedInParentId = getLoggedInParentId();

  // 1. ดึงรายชื่อกิจกรรมสำหรับ Dropdown
  const fetchActivitiesList = async () => {
    try {
      const res = await axios.get(`${API_URL}/attendance/activities`);
      const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setActivities(list);
    } catch (err) {
      console.error("ดึงข้อมูลกิจกรรมล้มเหลว:", err);
    }
  };

  // 2. ดึงข้อมูลประวัติกิจกรรม (ปรับแก้การ Filter ให้ยืดหยุ่นขึ้น)
  const fetchParentActivityData = async (activityId, parentId, currentStudentId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/parent/activities/${parentId}`);
      const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      const filtered = rawData.filter((item) => {
        // ดึง Activity ID จาก field ที่เป็นไปได้ทั้งหมด
        const itemActId = item.Activity_id ?? item.activity_id ?? item.id;
        
        // เปรียบเทียบ Activity ID แบบแปลงเป็น String ป้องกัน Type mismatch (String vs Number)
        const matchesAct = activityId 
          ? String(itemActId).trim() === String(activityId).trim() 
          : true;

        // ดึง Student ID จาก field ที่เป็นไปได้ทั้งหมด
        const itemStId = item.Student_id ?? item.student_id ?? item.Student_Id ?? item.id_student;

        // ถ้าเลือกเด็ก ให้เช็ก Student ID (ถ้า field มีค่า)
        const matchesStudent = (currentStudentId && itemStId != null)
          ? String(itemStId).trim() === String(currentStudentId).trim()
          : true;

        return matchesAct && matchesStudent;
      });

      // ถ้า Filter ด้วย Student ID แล้วไม่เจอข้อมูล ลองคืนค่าเฉพาะที่กรองด้วย Activity ID เพื่อไม่ให้ข้อมูลหาย
      if (filtered.length === 0 && rawData.length > 0 && activityId) {
        const fallbackFilter = rawData.filter((item) => {
          const itemActId = item.Activity_id ?? item.activity_id ?? item.id;
          return String(itemActId).trim() === String(activityId).trim();
        });
        setActivityData(fallbackFilter);
      } else {
        setActivityData(filtered);
      }

    } catch (err) {
      console.error("ดึงข้อมูลการเข้าร่วมล้มเหลว:", err);
      setActivityData([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. ดึงรายชื่อนักเรียนและกิจกรรม
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/students?userId=${loggedInParentId}`);
        const cleanData = Array.isArray(res.data) ? res.data : [];
        setStudents(cleanData);
        
        if (cleanData.length > 0) {
          const firstId = cleanData[0].Student_id || cleanData[0].id || cleanData[0].student_id;
          setSelectedStudentId(firstId);
        }
      } catch (err) {
        console.error("Error fetching students list:", err);
      }
    };

    fetchStudents();
    fetchActivitiesList();
  }, [loggedInParentId]);

  // 4. โหลดข้อมูลกิจกรรมเมื่อมีการเลือก Dropdown
  useEffect(() => {
    if (selectedActivity && loggedInParentId) {
      fetchParentActivityData(selectedActivity, loggedInParentId, selectedStudentId);
    } else {
      setActivityData([]);
    }
  }, [selectedActivity, loggedInParentId, selectedStudentId]);

  // คำนวณยอดรวมและสถิติ
  const totalItems = activityData.length;
  const attendedCount = activityData.filter((a) => {
    const val = a.attended ?? a.status ?? a.Attended;
    return val === 1 || val === true || val === "1" || val === "attended" || val === "present" || val === "เข้าร่วม";
  }).length;
  const absentCount = totalItems - attendedCount;
  const attendedPercentage = totalItems > 0 ? ((attendedCount / totalItems) * 100).toFixed(1) : "0.0";
  const absentPercentage = totalItems > 0 ? ((absentCount / totalItems) * 100).toFixed(1) : "0.0";

  // ข้อมูลนักเรียนที่เลือก
  const currentStudentObj = students.find(s => String(s.Student_id || s.id || s.student_id) === String(selectedStudentId));
  const studentName = currentStudentObj 
    ? (currentStudentObj.Name || currentStudentObj.name || `${currentStudentObj.First_name || ''} ${currentStudentObj.Last_name || ''}`.trim())
    : (activityData.length > 0 ? (activityData[0].Student_name || activityData[0].student_name) : "");
  
  const classLevel = currentStudentObj
    ? (currentStudentObj.Class_level || currentStudentObj.class_level || "")
    : (activityData.length > 0 ? (activityData[0].Class_level || activityData[0].class_level) : "");

  // ค้นหาและกรอง
  const filteredData = useMemo(() => {
    return activityData.filter((item) => {
      const val = item.attended ?? item.status ?? item.Attended;
      const isAttended = val === 1 || val === true || val === "1" || val === "attended" || val === "present" || val === "เข้าร่วม";
      const actName = item.Name_activity || item.activity_name || item.name || item.Activity_name || "";
      
      const matchesSearch = actName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ? true :
          filterStatus === "attended" ? isAttended :
            !isAttended;
      return matchesSearch && matchesFilter;
    });
  }, [activityData, searchTerm, filterStatus]);

  // ส่งออก CSV
  const exportToCSV = () => {
    if (activityData.length === 0) return alert("ไม่มีข้อมูลสำหรับส่งออก");

    const currentActivityName = activities.find(a => String(a.id || a.Activity_id) === String(selectedActivity))?.name || "กิจกรรม";

    let csvContent = "\uFEFF";
    csvContent += `รายงานการเข้าร่วมกิจกรรม (มุมมองผู้ปกครอง),${currentActivityName}\n`;
    csvContent += `ชื่อนักเรียน,${studentName || "ไม่ระบุ"},ชั้นเรียน,${classLevel || "ไม่ระบุ"}\n\n`;
    csvContent += `สรุปสถิติ\n`;
    csvContent += `กิจกรรมทั้งหมด,${totalItems},ครั้ง\n`;
    csvContent += `เข้าร่วม,${attendedCount},ครั้ง (${attendedPercentage}%)\n`;
    csvContent += `ไม่เข้าร่วม,${absentCount},ครั้ง (${absentPercentage}%)\n\n`;
    csvContent += `ลำดับ,ชื่อกิจกรรม,วันที่จัดกิจกรรม,สถานที่,สถานะการเข้าร่วม\n`;

    filteredData.forEach((item, idx) => {
      const val = item.attended ?? item.status ?? item.Attended;
      const isAttended = val === 1 || val === true || val === "1" || val === "attended" || val === "present" || val === "เข้าร่วม";
      csvContent += `${idx + 1},"${item.Name_activity || item.activity_name || "-"}","${item.Activity_date || item.date || "-"}","${item.Location || item.location || "-"}","${isAttended ? "เข้าร่วม" : "ไม่เข้าร่วม"}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ประวัติกิจกรรม_${studentName || "นักเรียน"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Banner */}
        <div style={styles.topBanner}>
          <div style={styles.classInfo}>
            <div style={styles.classIconWrapper}>
              <User size={18} color="#FFFFFF" />
            </div>
            <div>
              <span style={styles.classLabel}>เลือกบุตรหลาน</span>
              {students.length > 0 ? (
                <select
                  value={selectedStudentId || ''}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={styles.studentSelect}
                >
                  {students.map((st) => {
                    const stId = st.Student_id || st.id || st.student_id;
                    const stName = st.Name || st.name || `${st.First_name || ''} ${st.Last_name || ''}`.trim();
                    const stClass = st.Class_level || st.class_level || '';
                    return (
                      <option key={stId} value={stId}>
                        {stName} {stClass ? `(${stClass})` : ''}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <span style={styles.className}>
                  {studentName ? `${studentName}` : "ติดตามประวัติการเข้าร่วม"}
                </span>
              )}
              {classLevel && <span style={styles.classId}>ชั้น: {classLevel}</span>}
            </div>
          </div>
          <div style={styles.modeTabs}>
            <div style={{ ...styles.tabBtn, ...styles.tabBtnActive, cursor: 'default' }}>
              <Eye size={14} />
              โหมดดูข้อมูล (Read-Only)
            </div>
          </div>
        </div>

        {/* Card Main */}
        <div style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <h1 style={styles.title}>ประวัติการเข้าร่วมกิจกรรม</h1>
              <p style={styles.subtitle}>
                <Sparkles size={14} color="#4A90D9" />
                ตรวจสอบรายละเอียดการเข้าร่วมกิจกรรมของ: <strong>{studentName || "นักเรียน"}</strong>
              </p>
            </div>
            {selectedActivity && activityData.length > 0 && (
              <button type="button" onClick={exportToCSV} style={styles.exportBtn}>
                <FileSpreadsheet size={16} />
                ส่งออก CSV
              </button>
            )}
          </div>

          {/* Activity Dropdown */}
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
              {activities.map((act) => {
                const actId = act.id || act.Activity_id || act.activity_id;
                const actName = act.name || act.Name_activity || act.activity_name;
                return (
                  <option key={actId} value={actId}>
                    {actName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Stat Summary */}
          {selectedActivity !== "" && (
            <div style={styles.summaryGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIconWrapperBlue}>
                  <Activity size={18} color="#4A90D9" />
                </div>
                <div style={styles.statContent}>
                  <span style={styles.statLabel}>กิจกรรมทั้งหมด</span>
                  <span style={styles.statValue}>{totalItems} <span style={styles.statUnit}>ครั้ง</span></span>
                </div>
              </div>

              <div style={{ ...styles.statCard, backgroundColor: '#F0FDF4' }}>
                <div style={{ ...styles.statIconWrapperBlue, backgroundColor: '#D1FAE5' }}>
                  <UserCheck size={18} color="#16A34A" />
                </div>
                <div style={styles.statContent}>
                  <span style={{ ...styles.statLabel, color: '#166534' }}>เข้าร่วม</span>
                  <span style={{ ...styles.statValue, color: '#15803D' }}>
                    {attendedCount} <span style={styles.statUnit}>ครั้ง ({attendedPercentage}%)</span>
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
                    {absentCount} <span style={styles.statUnit}>ครั้ง ({absentPercentage}%)</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Controls */}
          {selectedActivity && activityData.length > 0 && (
            <div style={styles.toolbar}>
              <div style={styles.searchWrapper}>
                <Search size={16} color="#94A3B8" style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อกิจกรรม..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
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
            </div>
          )}

          {/* Table Data */}
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}>
              <div style={{ ...styles.tableHeaderCell, width: '40px', textAlign: 'center' }}>#</div>
              <div style={{ ...styles.tableHeaderCell, flex: 1 }}>รายละเอียดกิจกรรม</div>
              <div style={{ ...styles.tableHeaderCell, width: '150px', textAlign: 'center' }}>สถานะ</div>
            </div>

            <div style={styles.tableBody}>
              {loading ? (
                <div style={styles.emptyState}>
                  <Loader2 size={40} style={styles.spinner} />
                  <p>กำลังดึงข้อมูลการเข้าร่วมกิจกรรม...</p>
                </div>
              ) : !selectedActivity ? (
                <div style={styles.emptyState}>
                  <Activity size={40} color="#CBD5E1" />
                  <p>📌 กรุณาเลือกกิจกรรมเพื่อแสดงข้อมูล</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div style={styles.emptyState}>
                  <Search size={40} color="#CBD5E1" />
                  <p>ไม่พบประวัติกิจกรรมที่ตรงกับค่าค้นหา</p>
                </div>
              ) : (
                filteredData.map((item, index) => {
                  const val = item.attended ?? item.status ?? item.Attended;
                  const isAttended = val === 1 || val === true || val === "1" || val === "attended" || val === "present" || val === "เข้าร่วม";
                  const actName = item.Name_activity || item.activity_name || item.name || item.Activity_name || "กิจกรรมโรงเรียน";
                  
                  return (
                    <div key={item.Activity_id || item.id || index} style={styles.tableRow}>
                      <div style={{ ...styles.tableCell, width: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                        {index + 1}
                      </div>
                      
                      <div style={{ ...styles.tableCell, flex: 1 }}>
                        <div style={styles.studentAvatar}>
                          {actName.charAt(0) || 'A'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: '600', color: '#1E293B' }}>{actName}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CalendarDays size={12} /> {item.Activity_date || item.date || item.created_at || "ไม่ระบุวันที่"}
                            </span>
                            {(item.Location || item.location) && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                | <MapPin size={12} /> {item.Location || item.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ ...styles.tableCell, width: '150px', display: 'flex', justifyContent: 'center' }}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: isAttended ? '#DCFCE7' : '#FEE2E2',
                            color: isAttended ? '#15803D' : '#DC2626',
                          }}
                        >
                          {isAttended ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {isAttended ? "เข้าร่วม" : "ไม่เข้าร่วม"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
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
  spinner: {
    animation: 'spin 1s linear infinite',
    color: '#4A90D9',
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
  studentSelect: {
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '14px',
    fontFamily: "'Kanit', sans-serif",
    fontWeight: '600',
    color: '#1E293B',
    outline: 'none',
    cursor: 'pointer',
    marginTop: '2px',
  },
  classId: {
    fontSize: '12px',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: '8px',
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
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
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
  },
  filterChipActive: {
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tableContainer: {
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: '#F8FAFC',
    padding: '10px 16px',
    borderBottom: '1px solid #E2E8F0',
  },
  tableHeaderCell: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
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
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#334155',
  },
  studentAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: 0,
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
};

export default ActivityView;