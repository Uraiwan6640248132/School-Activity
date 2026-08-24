import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

function ParticipatingActivities() {
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const loggedInClassId = localStorage.getItem("teacher_class_id") || "1";
  
  // 🟢 ตั้งค่าเริ่มต้นสำหรับแสดงชื่อชั้นเรียน
  const [className, setClassName] = useState(
    localStorage.getItem("teacher_class_name") || "อนุบาล1 ห้องปกติ"
  );

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchActivitiesData();
    fetchClassName();
  }, []);

  // 🟢 ดึงข้อมูลชื่อชั้นเรียนตาม ID
  const fetchClassName = async () => {
    try {
      const res = await axios.get(`${API_URL}/attendance/class/${loggedInClassId}`);
      if (res.data && (res.data.name || res.data.Class_level)) {
        const name = res.data.name || res.data.Class_level;
        setClassName(name);
        localStorage.setItem("teacher_class_name", name);
      }
    } catch (err) {
      // หากหา API ไม่พบจะใช้ค่า fallback เป็น "อนุบาล1 ห้องปกติ"
      if (!localStorage.getItem("teacher_class_name")) {
        setClassName("อนุบาล1 ห้องปกติ");
      }
    }
  };

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

  const fetchStudents = async (activityId, classId) => {
    try {
      const res = await axios.get(
        `${API_URL}/attendance/students?activity=${activityId}&class=${classId}`
      );
      const rawStudents = Array.isArray(res.data) ? res.data : (res.data.data || []);
      const ownClassStudents = rawStudents.filter(
        (student) => !student.class_id || String(student.class_id) === String(classId)
      );
      const formattedData = ownClassStudents.map((s) => ({
        ...s,
        attended: s.attended !== undefined ? Boolean(s.attended) : true,
      }));
      setStudents(formattedData);
    } catch (err) {
      console.error("ดึงรายชื่อนักเรียนไม่สำเร็จ:", err);
      setStudents([]);
    }
  };

  // คำนวณยอดรวม และ เปอร์เซ็นต์
  const totalStudents = students.length;
  const attendedCount = students.filter((s) => s.attended).length;
  const absentCount = totalStudents - attendedCount;
  const attendedPercentage = totalStudents > 0 ? ((attendedCount / totalStudents) * 100).toFixed(1) : "0.0";
  const absentPercentage = totalStudents > 0 ? ((absentCount / totalStudents) * 100).toFixed(1) : "0.0";

  // ค้นหาและกรองข้อมูล
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
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
      class_id: parseInt(loggedInClassId, 10),
      attendance_list: students.map((s) => ({
        student_id: s.id,
        attended: s.attended,
      })),
    };

    try {
      await axios.post(`${API_URL}/attendance/save`, payload);
      alert("บันทึกการเข้าร่วมกิจกรรมเรียบร้อยแล้ว!");
      await fetchStudents(selectedActivity, loggedInClassId);
      setIsViewMode(true);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // 📊 ส่งออกเป็น CSV (เปิดใน Excel ได้ทันที)
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

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        {/* Banner แสดงห้องเรียนและโหมด */}
        <div style={styles.topBanner}>
          <div style={styles.classInfo}>
            <span style={styles.classBadge}>ห้องเรียน</span>
            {/* 🟢 แสดงชื่อชั้นเรียนที่ได้รับการแก้ไขแล้ว */}
            <span style={styles.className}>{className} (ID: {loggedInClassId})</span>
          </div>
          <div style={styles.modeTabs}>
            <button
              type="button"
              onClick={() => setIsViewMode(false)}
              style={{ ...styles.tabBtn, ...(!isViewMode ? styles.tabBtnActive : {}) }}
            >
              หน้าบันทึก
            </button>
            <button
              type="button"
              onClick={() => setIsViewMode(true)}
              style={{ ...styles.tabBtn, ...(isViewMode ? styles.tabBtnActive : {}) }}
            >
              หน้าประวัติ
            </button>
          </div>
        </div>

        {/* Card หลัก */}
        <div style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <h1 style={styles.title}>
                {isViewMode ? "ประวัติการเข้าร่วมกิจกรรม" : "บันทึกการเข้าร่วมกิจกรรม"}
              </h1>
              <p style={styles.subtitle}>จัดการการเข้าร่วมกิจกรรมนักเรียนในห้องเรียน</p>
            </div>

            {selectedActivity && students.length > 0 && (
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
                <option key={act.id} value={act.id}>
                  {act.name}
                </option>
              ))}
            </select>
          </div>

          {/* สรุปสถิติ */}
          {selectedActivity !== "" && (
            <div style={styles.summaryGrid}>
              <div style={{ ...styles.statCard, borderColor: '#e2e8f0' }}>
                <span style={styles.statTitle}>นักเรียนทั้งหมด</span>
                <div style={styles.statValue}>{totalStudents} <span style={styles.statUnit}>คน</span></div>
              </div>

              <div style={{ ...styles.statCard, borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
                <span style={{ ...styles.statTitle, color: '#166534' }}>เข้าร่วม</span>
                <div style={{ ...styles.statValue, color: '#15803d' }}>
                  {attendedCount} <span style={styles.statUnit}>คน ({attendedPercentage}%)</span>
                </div>
              </div>

              <div style={{ ...styles.statCard, borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
                <span style={{ ...styles.statTitle, color: '#991b1b' }}>ไม่เข้าร่วม</span>
                <div style={{ ...styles.statValue, color: '#dc2626' }}>
                  {absentCount} <span style={styles.statUnit}>คน ({absentPercentage}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar: ค้นหา & เลือกทั้งหมด */}
          {selectedActivity && students.length > 0 && (
            <div style={styles.toolbar}>
              <input
                type="text"
                placeholder="🔍 ค้นหาชื่อนักเรียน..."
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

              {!isViewMode && (
                <div style={styles.bulkActions}>
                  <button type="button" onClick={() => handleSelectAll(true)} style={styles.bulkBtnSuccess}>
                    ✓ เข้าร่วมหมด
                  </button>
                  <button type="button" onClick={() => handleSelectAll(false)} style={styles.bulkBtnDanger}>
                    ✕ ไม่เข้าร่วมหมด
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ตารางนักเรียน */}
          <div style={styles.tableContainer}>
            <div style={styles.tableHeaderRow}>
              <div style={{ flex: 0.5, textAlign: 'center' }}>#</div>
              <div style={{ flex: 3 }}>รายชื่อนักเรียน</div>
              <div style={{ flex: 2, textAlign: 'center' }}>สถานะการเข้าร่วม</div>
            </div>

            <div style={styles.tableBody}>
              {!selectedActivity ? (
                <div style={styles.emptyState}>📌 กรุณาเลือกกิจกรรมเพื่อแสดงรายชื่อ</div>
              ) : filteredStudents.length === 0 ? (
                <div style={styles.emptyState}>ไม่พบรายชื่อที่ตรงกับคำค้นหา</div>
              ) : (
                filteredStudents.map((student, index) => (
                  <div key={student.id} style={styles.tableRow}>
                    <div style={{ flex: 0.5, textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 3, fontWeight: '500', color: '#1e293b' }}>
                      {student.name}
                    </div>
                    <div style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
                      {!isViewMode ? (
                        <div style={styles.toggleSegment}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, true)}
                            style={{
                              ...styles.segmentBtn,
                              ...(student.attended ? styles.segmentBtnAttended : {})
                            }}
                          >
                            เข้าร่วม
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, false)}
                            style={{
                              ...styles.segmentBtn,
                              ...(!student.attended ? styles.segmentBtnAbsent : {})
                            }}
                          >
                            ไม่เข้าร่วม
                          </button>
                        </div>
                      ) : (
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: student.attended ? "#dcfce7" : "#fee2e2",
                            color: student.attended ? "#15803d" : "#dc2626",
                            borderColor: student.attended ? "#bbf7d0" : "#fecaca",
                          }}
                        >
                          {student.attended ? "✓ เข้าร่วม" : "✕ ไม่เข้าร่วม"}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ปุ่มบันทึก/แก้ไข */}
          {students.length > 0 && (
            <div style={styles.footerRow}>
              {!isViewMode ? (
                <button type="button" onClick={handleSubmit} style={styles.primarySubmitBtn}>
                  💾 บันทึกการเข้าร่วมกิจกรรม
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsViewMode(false)}
                  style={styles.secondaryEditBtn}
                >
                  ✏️ แก้ไขการเข้าร่วม
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
  container: { backgroundColor: "#f8fafc", minHeight: "100vh", padding: "2rem 1rem", fontFamily: "'Kanit', 'Sarabun', sans-serif", color: "#334155" },
  wrapper: { maxWidth: "780px", margin: "0 auto" },
  topBanner: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", padding: "12px 20px", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #e2e8f0" },
  classInfo: { display: "flex", alignItems: "center", gap: "10px" },
  classBadge: { backgroundColor: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "6px" },
  className: { fontSize: "14px", fontWeight: "600", color: "#1e293b" },
  modeTabs: { display: "flex", gap: "6px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "8px" },
  tabBtn: { border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", color: "#64748b", backgroundColor: "transparent", cursor: "pointer" },
  tabBtnActive: { backgroundColor: "#ffffff", color: "#2563eb", fontWeight: "600", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
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
  bulkActions: { display: "flex", gap: "6px" },
  bulkBtnSuccess: { border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", color: "#166534", fontSize: "12px", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" },
  bulkBtnDanger: { border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#991b1b", fontSize: "12px", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" },
  tableContainer: { border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" },
  tableHeaderRow: { display: "flex", backgroundColor: "#f1f5f9", padding: "10px 16px", fontSize: "13px", fontWeight: "600", color: "#475569" },
  tableBody: { display: "flex", flexDirection: "column" },
  tableRow: { display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #f1f5f9" },
  emptyState: { textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "13px" },
  toggleSegment: { display: "inline-flex", backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "3px" },
  segmentBtn: { border: "none", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "500", color: "#64748b", backgroundColor: "transparent", cursor: "pointer" },
  segmentBtnAttended: { backgroundColor: "#16a34a", color: "#ffffff", fontWeight: "600" },
  segmentBtnAbsent: { backgroundColor: "#dc2626", color: "#ffffff", fontWeight: "600" },
  statusBadge: { display: "inline-block", fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "12px", border: "1px solid" },
  footerRow: { display: "flex", justifyContent: "center", marginTop: "20px" },
  primarySubmitBtn: { backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "10px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  secondaryEditBtn: { backgroundColor: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", padding: "10px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }
};

export default ParticipatingActivities;