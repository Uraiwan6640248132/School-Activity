import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

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
            <span style={styles.classBadge}>ผู้ปกครอง</span>
            <span style={styles.className}>
              {studentName ? `${studentName} (${classLevel || "นักเรียน"})` : "ติดตามประวัติการเข้าร่วมกิจกรรม"}
            </span>
          </div>
          <div style={styles.readOnlyTag}>
            👁️ โหมดดูข้อมูล (Read-Only)
          </div>
        </div>

        {/* Card หลัก */}
        <div style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <h1 style={styles.title}>ประวัติการเข้าร่วมกิจกรรม</h1>
              <p style={styles.subtitle}>ตรวจสอบรายละเอียดการเข้าร่วมกิจกรรมของนักเรียน</p>
            </div>

            {selectedActivity && activityData.length > 0 && (
              <button type="button" onClick={exportToCSV} style={styles.exportBtn}>
                📥 ส่งออก CSV (Excel)
              </button>
            )}
          </div>

          {/* เลือกกิจกรรม */}
          <div style={styles.selectSection}>
            <label style={styles.inputLabel}>เลือกกิจกรรม</label>
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

          {/* สรุปสถิติ */}
          {selectedActivity !== "" && (
            <div style={styles.summaryGrid}>
              <div style={{ ...styles.statCard, borderColor: '#e2e8f0' }}>
                <span style={styles.statTitle}>กิจกรรมทั้งหมด</span>
                <div style={styles.statValue}>{totalItems} <span style={styles.statUnit}>ครั้ง</span></div>
              </div>

              <div style={{ ...styles.statCard, borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
                <span style={{ ...styles.statTitle, color: '#166534' }}>เข้าร่วม</span>
                <div style={{ ...styles.statValue, color: '#15803d' }}>
                  {attendedCount} <span style={styles.statUnit}>ครั้ง ({attendedPercentage}%)</span>
                </div>
              </div>

              <div style={{ ...styles.statCard, borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
                <span style={{ ...styles.statTitle, color: '#991b1b' }}>ไม่เข้าร่วม</span>
                <div style={{ ...styles.statValue, color: '#dc2626' }}>
                  {absentCount} <span style={styles.statUnit}>ครั้ง ({absentPercentage}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar: ค้นหา & ตัวกรองสถานะ */}
          {selectedActivity && activityData.length > 0 && (
            <div style={styles.toolbar}>
              <input
                type="text"
                placeholder="🔍 ค้นหากิจกรรม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />

              <div style={styles.filterGroup}>
                <button
                  type="button"
                  onClick={() => setFilterStatus("all")}
                  style={{ ...styles.filterChip, ...(filterStatus === "all" ? styles.filterChipActive : {}) }}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("attended")}
                  style={{ ...styles.filterChip, ...(filterStatus === "attended" ? styles.filterChipActive : {}) }}
                >
                  เข้าร่วม
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("absent")}
                  style={{ ...styles.filterChip, ...(filterStatus === "absent" ? styles.filterChipActive : {}) }}
                >
                  ไม่เข้าร่วม
                </button>
              </div>
            </div>
          )}

          {/* ตารางแสดงข้อมูล */}
          <div style={styles.tableContainer}>
            <div style={styles.tableHeaderRow}>
              <div style={{ flex: 0.5, textAlign: 'center' }}>#</div>
              <div style={{ flex: 3 }}>ชื่อกิจกรรม / รายละเอียด</div>
              <div style={{ flex: 2, textAlign: 'center' }}>สถานะการเข้าร่วม</div>
            </div>

            <div style={styles.tableBody}>
              {loading ? (
                <div style={styles.emptyState}>⏳ กำลังดึงข้อมูลการเข้าร่วมกิจกรรม...</div>
              ) : !selectedActivity ? (
                <div style={styles.emptyState}>📌 กรุณาเลือกกิจกรรมเพื่อแสดงข้อมูล</div>
              ) : filteredData.length === 0 ? (
                <div style={styles.emptyState}>ไม่พบประวัติกิจกรรมที่ตรงกับคำค้นหา</div>
              ) : (
                filteredData.map((item, index) => {
                  const isAttended = item.attended === 1 || item.attended === true || item.status === "attended" || item.status === "present";
                  return (
                    <div key={item.Activity_id || item.id || index} style={styles.tableRow}>
                      <div style={{ flex: 0.5, textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 3 }}>
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>
                          {item.Name_activity || item.activity_name || item.name || "กิจกรรมโรงเรียน"}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          📅 {item.Activity_date || item.date || "ไม่ระบุวันที่"} {(item.Location || item.location) ? `| 📍 ${item.Location || item.location}` : ""}
                        </div>
                      </div>
                      <div style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: isAttended ? "#dcfce7" : "#fee2e2",
                            color: isAttended ? "#15803d" : "#dc2626",
                            borderColor: isAttended ? "#bbf7d0" : "#fecaca",
                          }}
                        >
                          {isAttended ? "✓ เข้าร่วม" : "✕ ไม่เข้าร่วม"}
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
  container: { backgroundColor: "#f8fafc", minHeight: "100vh", padding: "2rem 1rem", fontFamily: "'Kanit', 'Sarabun', sans-serif", color: "#334155" },
  wrapper: { maxWidth: "780px", margin: "0 auto" },
  topBanner: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", padding: "12px 20px", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #e2e8f0" },
  classInfo: { display: "flex", alignItems: "center", gap: "10px" },
  classBadge: { backgroundColor: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "6px" },
  className: { fontSize: "14px", fontWeight: "600", color: "#1e293b" },
  readOnlyTag: { fontSize: "12px", fontWeight: "600", color: "#64748b", backgroundColor: "#f1f5f9", padding: "6px 12px", borderRadius: "8px" },
  mainCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  title: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "2px", margin: 0 },
  exportBtn: { backgroundColor: "#10b981", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  selectSection: { marginBottom: "20px" },
  inputLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" },
  selectInput: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", color: "#1e293b", outline: "none", backgroundColor: "#f8fafc" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" },
  statCard: { border: "1px solid", borderRadius: "10px", padding: "14px", backgroundColor: "#ffffff" },
  statTitle: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
  statValue: { fontSize: "20px", fontWeight: "700", color: "#0f172a", marginTop: "4px" },
  statUnit: { fontSize: "13px", fontWeight: "normal", color: "#64748b" },
  toolbar: { display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "10px" },
  searchInput: { border: "1px solid #cbd5e1", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", outline: "none", width: "180px" },
  filterGroup: { display: "flex", gap: "4px" },
  filterChip: { border: "none", backgroundColor: "transparent", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", color: "#64748b", cursor: "pointer" },
  filterChipActive: { backgroundColor: "#2563eb", color: "#ffffff", fontWeight: "600" },
  tableContainer: { border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" },
  tableHeaderRow: { display: "flex", backgroundColor: "#f1f5f9", padding: "10px 16px", fontSize: "13px", fontWeight: "600", color: "#475569" },
  tableBody: { display: "flex", flexDirection: "column" },
  tableRow: { display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #f1f5f9" },
  emptyState: { textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "13px" },
  statusBadge: { display: "inline-block", fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "12px", border: "1px solid" }
};

export default ActivityView;