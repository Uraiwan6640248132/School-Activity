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

  const API_URL = "http://localhost:3001";

  // 🟢 1. ดึง Parent ID จาก localStorage ให้ถูกต้องตามโครงสร้างระบบ
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

  useEffect(() => {
    fetchActivitiesList();
  }, []);

  useEffect(() => {
    if (selectedActivity && loggedInParentId) {
      fetchParentActivityData(selectedActivity, loggedInParentId);
    } else {
      setActivityData([]);
    }
  }, [selectedActivity, loggedInParentId]);

  // 🟢 ดึงรายชื่อกิจกรรมทั้งหมดสำหรับ Dropdown
  const fetchActivitiesList = async () => {
    try {
      const res = await axios.get(`${API_URL}/attendance/activities`);
      const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setActivities(list);
    } catch (err) {
      console.error("ดึงข้อมูลกิจกรรมล้มเหลว:", err);
    }
  };

  // 🟢 2. ดึงและกรองข้อมูลแบบรองรับ Key หลากหลายรูปแบบจาก API
  const fetchParentActivityData = async (activityId, parentId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/parent/activities/${parentId}`);
      const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      // กรองเฉพาะกิจกรรมที่เลือก (รองรับทั้ง Activity_id, activity_id, หรือ id)
      const filteredByAct = rawData.filter((item) => {
        const actId = item.Activity_id || item.activity_id || item.id;
        return String(actId) === String(activityId);
      });
      
      // หากกรองแล้วไม่เจอ ให้ใช้ rawData ทั้งหมดในกรณีที่ API ส่งแยกตาม endpoint มาแล้ว
      setActivityData(filteredByAct.length > 0 ? filteredByAct : rawData);
    } catch (err) {
      console.error("ดึงข้อมูลการเข้าร่วมล้มเหลว:", err);
      setActivityData([]);
    } finally {
      setLoading(false);
    }
  };

  // 📊 คำนวณยอดรวมและสถิติ (รองรับทั้ง attended = 1, true หรือ "attended")
  const totalItems = activityData.length;
  const attendedCount = activityData.filter((a) => 
    a.attended === 1 || a.attended === true || a.status === "attended" || a.status === "present"
  ).length;
  const absentCount = totalItems - attendedCount;
  const attendedPercentage = totalItems > 0 ? ((attendedCount / totalItems) * 100).toFixed(1) : "0.0";
  const absentPercentage = totalItems > 0 ? ((absentCount / totalItems) * 100).toFixed(1) : "0.0";

  // ดึงข้อมูลนักเรียนเพื่อแสดงใน Banner Header
  const studentName = activityData.length > 0 ? (activityData[0].Student_name || activityData[0].student_name) : "";
  const classLevel = activityData.length > 0 ? (activityData[0].Class_level || activityData[0].class_level) : "";

  // 🔍 การค้นหาและกรองข้อมูล
  const filteredData = useMemo(() => {
    return activityData.filter((item) => {
      const isAttended = item.attended === 1 || item.attended === true || item.status === "attended" || item.status === "present";
      const actName = item.Name_activity || item.activity_name || item.name || "";
      const matchesSearch = actName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ? true :
          filterStatus === "attended" ? isAttended :
            !isAttended;
      return matchesSearch && matchesFilter;
    });
  }, [activityData, searchTerm, filterStatus]);

  // 📊 ส่งออกข้อมูลประวัติเป็น CSV (Excel)
  const exportToCSV = () => {
    if (activityData.length === 0) return alert("ไม่มีข้อมูลสำหรับส่งออก");

    const currentActivityName = activities.find(a => String(a.id) === String(selectedActivity))?.name || "กิจกรรม";

    let csvContent = "\uFEFF";
    csvContent += `รายงานการเข้าร่วมกิจกรรม (มุมมองผู้ปกครอง),${currentActivityName}\n`;
    csvContent += `ชื่อนักเรียน,${studentName || "ไม่ระบุ"},ชั้นเรียน,${classLevel || "ไม่ระบุ"}\n\n`;
    csvContent += `สรุปสถิติ\n`;
    csvContent += `กิจกรรมทั้งหมด,${totalItems},ครั้ง\n`;
    csvContent += `เข้าร่วม,${attendedCount},ครั้ง (${attendedPercentage}%)\n`;
    csvContent += `ไม่เข้าร่วม,${absentCount},ครั้ง (${absentPercentage}%)\n\n`;
    csvContent += `ลำดับ,ชื่อกิจกรรม,วันที่จัดกิจกรรม,สถานที่,สถานะการเข้าร่วม\n`;

    filteredData.forEach((item, idx) => {
      const isAttended = item.attended === 1 || item.attended === true || item.status === "attended" || item.status === "present";
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
        {/* Top Banner */}
        <div style={styles.topBanner}>
          <div style={styles.classInfo}>
            <div style={styles.classIconWrapper}>
              <User size={18} color="#FFFFFF" />
            </div>
            <div>
              <span style={styles.classLabel}>ผู้ปกครอง</span>
              <span style={styles.className}>
                {studentName ? `${studentName}` : "ติดตามประวัติการเข้าร่วม"}
              </span>
              <span style={styles.classId}>ชั้น: {classLevel || "ไม่ระบุ"}</span>
            </div>
          </div>
          <div style={styles.modeTabs}>
            <div
              style={{
                ...styles.tabBtn,
                ...styles.tabBtnActive,
                cursor: 'default'
              }}
            >
              <Eye size={14} />
              โหมดดูข้อมูล (Read-Only)
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div style={styles.mainCard}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <div>
              <h1 style={styles.title}>ประวัติการเข้าร่วมกิจกรรม</h1>
              <p style={styles.subtitle}>
                <Sparkles size={14} color="#4A90D9" />
                ตรวจสอบรายละเอียดการเข้าร่วมกิจกรรมของนักเรียน
              </p>
            </div>
            {selectedActivity && activityData.length > 0 && (
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
                <option key={act.id || act.Activity_id} value={act.id || act.Activity_id}>
                  {act.name || act.Name_activity}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics */}
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

          {/* Toolbar */}
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
            </div>
          )}

          {/* Table */}
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
                  <p>ไม่พบประวัติกิจกรรมที่ตรงกับคำค้นหา</p>
                </div>
              ) : (
                filteredData.map((item, index) => {
                  const isAttended = item.attended === 1 || item.attended === true || item.status === "attended" || item.status === "present";
                  const actName = item.Name_activity || item.activity_name || item.name || "กิจกรรมโรงเรียน";
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
                              <CalendarDays size={12} /> {item.Activity_date || item.date || "ไม่ระบุวันที่"}
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

// ชุด Style และ Animation เดียวกับหน้าคุณครู
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
  classId: {
    fontSize: '12px',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    padding: '2px 8px',
    borderRadius: '4px',
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

// Global CSS animations (เหมือนหน้าคุณครู)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .stat-card {
    animation: fadeInUp 0.3s ease forwards;
  }
  .stat-card:nth-child(1) { animation-delay: 0.05s; }
  .stat-card:nth-child(2) { animation-delay: 0.1s; }
  .stat-card:nth-child(3) { animation-delay: 0.15s; }
  
  .table-row:hover {
    background-color: #F8FAFC;
  }
  
  .filter-chip:hover:not(.filter-chip-active) {
    background-color: #E2E8F0;
  }
  
  @media (max-width: 768px) {
    .top-banner {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .mode-tabs {
      justify-content: center !important;
    }
    .summary-grid {
      grid-template-columns: 1fr !important;
    }
    .toolbar {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .filter-group {
      justify-content: center !important;
    }
    .card-header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .export-btn {
      width: 100% !important;
      justify-content: center !important;
    }
    .table-row {
      flex-wrap: wrap !important;
      gap: 8px !important;
    }
    .table-row > div:last-child {
      width: 100% !important;
      justify-content: flex-start !important;
      padding-left: 44px !important;
    }
  }
  
  @media (max-width: 480px) {
    .main-card {
      padding: 16px !important;
    }
    .class-info {
      flex-wrap: wrap !important;
    }
    .search-wrapper {
      min-width: 100% !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ActivityView;