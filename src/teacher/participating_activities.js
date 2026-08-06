import React, { useEffect, useState } from "react";
import axios from "axios";

function ParticipatingActivities() {
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);

  // ดึงค่า class_id และ class_name จาก localStorage
  const loggedInClassId = localStorage.getItem("teacher_class_id") || "1";
  const loggedInClassName = localStorage.getItem("teacher_class_name") || "ชั้นเรียนของคุณ";

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchActivitiesData();
  }, []);

  // 1. ดึงรายการกิจกรรม
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

  // 2. ดึงรายชื่อนักเรียนเฉพาะห้องของตนเอง
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

  // คำนวณยอดรวม และ เปอร์เซ็นต์ (ทั้ง เข้าร่วม และ ไม่เข้าร่วม)
  const totalStudents = students.length;
  const attendedCount = students.filter((s) => s.attended).length;
  const absentCount = totalStudents - attendedCount;
  
  const attendedPercentage = totalStudents > 0 ? ((attendedCount / totalStudents) * 100).toFixed(1) : 0;
  const absentPercentage = totalStudents > 0 ? ((absentCount / totalStudents) * 100).toFixed(1) : 0;

  // 3. เปลี่ยนสถานะ เข้าร่วม / ไม่เข้าร่วม
  const handleStatusChange = (studentId, status) => {
    if (isViewMode) return;
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId ? { ...student, attended: status } : student
      )
    );
  };

  // 4. บันทึกข้อมูล -> ดึงข้อมูลใหม่ + สลับไปหน้าสรุป/ประวัติ (View Mode) ทันที
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
      
      // ดึงข้อมูลล่าสุดอีกครั้ง
      await fetchStudents(selectedActivity, loggedInClassId);
      
      // 🎯 สลับโหมดเป็น View Mode ทันที เพื่อให้ครูดูสรุปและรายชื่อได้ทันที
      setIsViewMode(true);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <div style={page.container}>
      <div style={page.wrapper}>

        {/* แถบควบคุมสถานะหน้าจอ */}
        <div style={page.devControlPanel}>
          <span style={{ fontSize: "13px", color: "#1e3a8a", fontWeight: "500" }}>
            ประจำห้อง: <strong>{loggedInClassName}</strong> (ID: {loggedInClassId})
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={() => setIsViewMode(false)}
              style={{
                ...page.devBtn,
                backgroundColor: !isViewMode ? "#2563eb" : "#ffffff",
                color: !isViewMode ? "#ffffff" : "#2563eb",
              }}
            >
              หน้าบันทึกการเข้าร่วม
            </button>
            <button
              type="button"
              onClick={() => setIsViewMode(true)}
              style={{
                ...page.devBtn,
                backgroundColor: isViewMode ? "#2563eb" : "#ffffff",
                color: isViewMode ? "#ffffff" : "#2563eb",
              }}
            >
              หน้าประวัติเข้าร่วม
            </button>
          </div>
        </div>

        <div style={page.headerRow}>
          <button type="button" style={page.titleBtn}>เข้าร่วมกิจกรรม</button>
        </div>

        <h1 style={page.pageTitle}>
          {isViewMode ? "ประวัติการเข้าร่วมกิจกรรม" : "บันทึกการเข้าร่วมกิจกรรม"} ({loggedInClassName})
        </h1>

        <div style={page.cardBox}>
          <div>
            {/* เลือกกิจกรรม */}
            <div style={page.dropdownGrid}>
              <div style={page.fieldGroup}>
                <label style={page.label}>เลือกกิจกรรม</label>
                <div style={page.selectWrapper}>
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    style={page.select}
                  >
                    <option value="">-- กรุณาเลือกกิจกรรม --</option>
                    {activities.map((act) => (
                      <option key={act.id} value={act.id}>
                        {act.name}
                      </option>
                    ))}
                  </select>
                  <div style={page.selectArrow}>▽</div>
                </div>
              </div>
            </div>

            {/* การ์ดสรุปยอด (ใส่ % ให้กับทั้ง เข้าร่วม และ ไม่เข้าร่วม) */}
            {selectedActivity !== "" && (
              <div style={page.summaryContainer}>
                <div style={page.summaryCard}>
                  <span style={page.summaryLabel}>นักเรียนห้องนี้ทั้งหมด</span>
                  <span style={page.summaryValue}>{totalStudents} คน</span>
                </div>
                <div style={{ ...page.summaryCard, backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
                  <span style={{ ...page.summaryLabel, color: "#166534" }}>เข้าร่วม</span>
                  <span style={{ ...page.summaryValue, color: "#15803d" }}>
                    {attendedCount} คน (<small style={{ fontSize: "12px" }}>{attendedPercentage}%</small>)
                  </span>
                </div>
                <div style={{ ...page.summaryCard, backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
                  <span style={{ ...page.summaryLabel, color: "#991b1b" }}>ไม่เข้าร่วม</span>
                  <span style={{ ...page.summaryValue, color: "#dc2626" }}>
                    {absentCount} คน (<small style={{ fontSize: "12px" }}>{absentPercentage}%</small>)
                  </span>
                </div>
              </div>
            )}

            {/* ตารางรายชื่อนักเรียน */}
            <div style={page.tableHeader}>
              <div style={page.colStudent}>รายชื่อนักเรียน</div>
              <div style={page.colStatus}>สถานะการเข้าร่วม</div>
            </div>

            <div style={page.tableBody}>
              {students.length === 0 ? (
                <p style={page.noData}>
                  {selectedActivity
                    ? `ไม่พบรายชื่อนักเรียนในห้อง (class_id: ${loggedInClassId})`
                    : "กรุณาเลือกกิจกรรมเพื่อแสดงรายชื่อ"}
                </p>
              ) : (
                students.map((student) => (
                  <div key={student.id} style={page.tableRow}>
                    <div style={page.studentName}>{student.name}</div>
                    <div style={page.statusCenter}>
                      {!isViewMode ? (
                        <div style={page.toggleGroup}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, true)}
                            style={{
                              ...page.toggleBtn,
                              backgroundColor: student.attended ? "#16a34a" : "#f1f5f9",
                              color: student.attended ? "#ffffff" : "#64748b",
                              borderColor: student.attended ? "#16a34a" : "#cbd5e1",
                            }}
                          >
                            เข้าร่วม
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, false)}
                            style={{
                              ...page.toggleBtn,
                              backgroundColor: !student.attended ? "#dc2626" : "#f1f5f9",
                              color: !student.attended ? "#ffffff" : "#64748b",
                              borderColor: !student.attended ? "#dc2626" : "#cbd5e1",
                            }}
                          >
                            ไม่เข้าร่วม
                          </button>
                        </div>
                      ) : (
                        /* แสดงสถานะแบบอ่านอย่างเดียว หลังกดบันทึก */
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            backgroundColor: student.attended ? "#dcfce7" : "#fee2e2",
                            color: student.attended ? "#15803d" : "#dc2626",
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

          {/* ปุ่มบันทึก / ปุ่มแก้ไข */}
          {students.length > 0 && (
            <div style={page.footerActionRow}>
              {!isViewMode ? (
                <button type="button" onClick={handleSubmit} style={page.submitBtn}>
                  บันทึกการเข้าร่วม
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsViewMode(false)}
                  style={{ ...page.submitBtn, backgroundColor: "#f8fafc" }}
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

const page = {
  container: { backgroundColor: "#ffffff", minHeight: "100vh", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", color: "#334155", fontFamily: "'Inter', 'Kanit', 'Sarabun', sans-serif" },
  wrapper: { width: "100%", maxWidth: "720px" },
  devControlPanel: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px 14px", borderRadius: "8px", marginBottom: "2rem", width: "100%", boxSizing: "border-box" },
  devBtn: { border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", transition: "all 0.2s" },
  headerRow: { marginBottom: "8px" },
  titleBtn: { backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#000000", fontWeight: "bold", padding: "6px 28px", borderRadius: "6px", fontSize: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.04)", cursor: "default" },
  pageTitle: { fontSize: "16px", fontWeight: "bold", color: "#000000", margin: "0 0 16px 0", paddingLeft: "4px" },
  cardBox: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "24px 24px", minHeight: "480px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 14px rgba(0,0,0,0.04)", boxSizing: "border-box" },
  dropdownGrid: { display: "block", marginBottom: "20px" },
  fieldGroup: { display: "flex", flexDirection: "column" },
  label: { fontSize: "13px", color: "#555555", marginBottom: "6px", paddingLeft: "2px" },
  selectWrapper: { position: "relative", display: "flex", alignItems: "center" },
  select: { width: "100%", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 14px", fontSize: "14px", color: "#334155", outline: "none", appearance: "none", WebkitAppearance: "none", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)" },
  selectArrow: { position: "absolute", right: "12px", color: "#94a3b8", fontSize: "10px", pointerEvents: "none" },
  summaryContainer: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" },
  summaryCard: { border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center" },
  summaryLabel: { fontSize: "12px", color: "#64748b", marginBottom: "4px" },
  summaryValue: { fontSize: "16px", fontWeight: "bold", color: "#0f172a" },
  tableHeader: { display: "flex", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", color: "#888888", fontSize: "13px" },
  colStudent: { flex: 2, textAlign: "left", paddingLeft: "12px" },
  colStatus: { flex: 2, textAlign: "center" },
  tableBody: { display: "flex", flexDirection: "column" },
  tableRow: { display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" },
  studentName: { flex: 2, fontSize: "14px", color: "#444444", paddingLeft: "12px" },
  statusCenter: { flex: 2, display: "flex", justifyContent: "center", alignItems: "center" },
  toggleGroup: { display: "flex", gap: "6px" },
  toggleBtn: { border: "1px solid", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s" },
  noData: { textAlign: "center", color: "#94a3b8", fontSize: "13px", padding: "2rem 0" },
  footerActionRow: { display: "flex", justifyContent: "center", marginTop: "24px" },
  submitBtn: { backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", fontWeight: "normal", padding: "6px 36px", borderRadius: "6px", fontSize: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", cursor: "pointer", transition: "background-color 0.15s" }
};

export default ParticipatingActivities;