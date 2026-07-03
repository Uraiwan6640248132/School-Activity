import React, { useState, useEffect, useCallback } from 'react';

export default function Developmentp() {
  const [devList, setDevList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

  // State สำหรับเปิด-ปิดหน้าต่าง Pop-up รายละเอียดพัฒนาการ
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  // Dynamic Student ID State
  const [studentIdOfParent, setStudentIdOfParent] = useState(null);

  const API_URL = `http://localhost:3001/api/development`;
  const STUDENTS_API_URL = 'http://localhost:3001/api/students';

  // 🌟 ฟังก์ชันดึงรายชื่อนักเรียน
  const fetchStudentsData = async (userId) => {
    try {
      const res = await fetch(`${STUDENTS_API_URL}?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const cleanData = Array.isArray(data) ? data : [];
        setStudents(cleanData);

        if (cleanData.length > 0) {
          const childIds = cleanData.map(s => Number(s.Student_id || s.id || s.student_id || s.Student_Id));
          return childIds;
        }
      }
    } catch (err) {
      console.error("Error fetching students list:", err);
    }
    return null;
  };

  // 🌟 ฟังก์ชันดึงข้อมูลพัฒนาการและกรองเอาเฉพาะข้อมูลของลูก
  const fetchDevelopmentData = async (targetStudentIds) => {
    if (!targetStudentIds || (Array.isArray(targetStudentIds) && targetStudentIds.length === 0)) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        const rawData = Array.isArray(data) ? data : [];

        const filteredData = rawData.filter(item => {
          const itemStudentId = Number(item.Student_id || item.student_id || item.Student_Id);
          if (Array.isArray(targetStudentIds)) {
            return targetStudentIds.includes(itemStudentId);
          }
          return itemStudentId === Number(targetStudentIds);
        });

        setDevList(filteredData);
      }
    } catch (err) {
      console.error("Error fetching student development data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const userData = JSON.parse(storedUser);
      const userId = userData.User_id || userData.id;

      if (!userId || userId === "undefined") {
        console.warn("หน้าบ้านระงับการทำงานเนื่องจากไม่พบ userId ของผู้ปกครอง");
        return;
      }

      const loadParentDashboard = async () => {
        // 🔒 ดึงเฉพาะรายชื่อ "ลูกของผู้ปกครองคนนี้" จาก backend (กรองด้วย userId)
        const childIds = await fetchStudentsData(userId);

        if (childIds && childIds.length > 0) {
          // ใช้ลูกคนแรกแสดงในหัวข้อ (ถ้ามีมากกว่า 1 คน รายการด้านล่างจะแสดงครบทุกคนอยู่แล้ว)
          setStudentIdOfParent(childIds[0]);
          // 🔒 ส่งเฉพาะไอดีลูกของผู้ปกครองคนนี้ไปกรองข้อมูลพัฒนาการ ห้ามเห็นของเด็กคนอื่น
          await fetchDevelopmentData(childIds);
        } else {
          console.warn("ไม่พบข้อมูลนักเรียนที่ผูกกับบัญชีผู้ปกครองนี้");
          setStudentIdOfParent(null);
        }
      };

      loadParentDashboard();

    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอ่านข้อมูลผู้ใช้:", error);
    }
  }, []);

  const getStudentName = useCallback((studentId) => {
    if (!studentId) return "ไม่ระบุรหัส";

    if (!students || students.length === 0) return `กำลังค้นหารหัส: ${studentId}...`;

    const found = students.find(s => {
      const currentId = Number(s.Student_id || s.id || s.student_id || s.Student_Id);
      return currentId === Number(studentId);
    });

    if (found) {
      return found.Name || found.name || found.Student_name || found.student_name || `${found.First_name || ''} ${found.Last_name || ''}`.trim();
    }
    return `รหัสนักเรียน: ${studentId}`;
  }, [students]);

  // ฟังก์ชันคำนวณคะแนนเฉลี่ยแปลงเป็นเปอร์เซ็นต์เต็ม 100
  const calculateSectionScore = (scores) => {
    if (!scores || scores.length === 0) return 0;
    const validScores = scores.map(s => isNaN(Number(s)) ? 0 : Number(s));
    const sum = validScores.reduce((a, b) => a + b, 0);
    const avg = sum / validScores.length;
    return Math.round(avg * 20);
  };

  const openDetailModal = (item) => {
    setSelectedDetailItem(item);
    setIsDetailOpen(true);
  };

  const scoreLevels = [
    { label: 'ดีมาก', val: 5 },
    { label: 'ดี', val: 4 },
    { label: 'ปานกลาง', val: 3 },
    { label: 'พอใช้', val: 2 },
    { label: 'ปรับปรุง', val: 1 }
  ];

  const getScoreLabel = (val) => {
    const found = scoreLevels.find(l => String(l.val) === String(val));
    return found ? `${found.label} (${val})` : val || 'ไม่มีข้อมูล';
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardMain}>

        {/* ส่วนหัวแสดงข้อมูลของนักเรียน */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.mainTitle}>สรุปผลพัฒนาการนักเรียน</h2>
            <p style={styles.studentNameDisplay}>
              <strong>นักเรียน:</strong>{' '}
              {studentIdOfParent ? (
                <span style={{ color: '#1e3a8a', fontWeight: 'bold' }}>{getStudentName(studentIdOfParent)}</span>
              ) : (
                <span style={{ color: '#b91c1c' }}>ไม่พบข้อมูลนักเรียนที่ผูกกับบัญชีของคุณ</span>
              )}
            </p>
          </div>
          <div style={styles.badgeParent}>ฝั่งผู้ปกครอง</div>
        </div>

        {loading && <p style={styles.statusText}>กำลังโหลดรายงานพัฒนาการ...</p>}

        {/* ส่วนแสดงรายการการ์ดพัฒนาการแต่ละเทอม */}
        <div style={styles.listContainer}>
          {devList.length === 0 ? (
            <div style={styles.emptyState}>ยังไม่มีข้อมูลการประเมินพัฒนาการจากคุณครูในขณะนี้</div>
          ) : (
            devList.map((item, idx) => {
              const scoreBody = item.Weight && item.Height ? 100 : 75;
              const scoreIntellect = calculateSectionScore([item.Problem_solving, item.Communication, item.Remembering]);
              const scoreEmotion = calculateSectionScore([item.Emotion, item.Emotion_control, item.Confidence]);
              const scoreSocial = calculateSectionScore([item.Stress, item.Interaction, item.Assistance]);

              const displayDate = item.date_clean ||
                (item.Date ? String(item.Date).split('T')[0] : '') ||
                (item.date ? String(item.date).split('T')[0] : 'ไม่ได้ระบุ');

              let displayTerm = item.Term || item.term || "ภาคเรียนที่ 1";
              if (displayTerm.trim() === 'ภาคเรียนที่') {
                displayTerm = idx === 0 ? 'ภาคเรียนที่ 1' : 'ภาคเรียนที่ 2';
              }

              const currentItemStudentId = item.Student_id || item.student_id || item.Student_Id;

              return (
                <div key={idx} style={styles.devCardItem}>
                  <div style={styles.cardItemHeader}>
                    <span style={styles.yearText}>
                      <strong style={{ color: '#1e3a8a' }}>นักเรียน: {getStudentName(currentItemStudentId)}</strong><br />
                      ปีการศึกษา {item.Year || item.year || '2569'} - {displayTerm}
                    </span>
                    <span style={styles.dateText}>วันที่ประเมิน: {displayDate}</span>
                  </div>

                  {/* แถววงกลมคะแนน 4 ด้านหลัก */}
                  <div
                    style={{ ...styles.circlesRow, cursor: 'pointer' }}
                    onClick={() => openDetailModal(item)}
                    title="คลิกเพื่อดูรายละเอียดเพิ่มเติม"
                  >
                    <div style={styles.circleUnit}>
                      <div style={styles.circleScore}>{scoreBody}</div>
                      <span style={styles.circleLabel}>ด้านร่างกาย</span>
                    </div>
                    <div style={styles.circleUnit}>
                      <div style={styles.circleScore}>{scoreIntellect}</div>
                      <span style={styles.circleLabel}>ด้านสติปัญญา</span>
                    </div>
                    <div style={styles.circleUnit}>
                      <div style={styles.circleScore}>{scoreEmotion}</div>
                      <span style={styles.circleLabel}>ด้านอารมณ์</span>
                    </div>
                    <div style={styles.circleUnit}>
                      <div style={styles.circleScore}>{scoreSocial}</div>
                      <span style={styles.circleLabel}>ด้านสังคม</span>
                    </div>
                  </div>

                  {/* แสดงรายละเอียดค่าน้ำหนักส่วนสูงเพิ่มเติม */}
                  <div style={styles.bodyDetailsSummary}>
                    <span>⚖️ น้ำหนัก: <strong>{item.Weight || '-'}</strong> กก.</span>
                    <span>📏 ส่วนสูง: <strong>{item.Height || '-'}</strong> ซม.</span>
                    <span>🦷 สุขภาพฟัน: <strong style={{ color: '#2e7d32' }}>{item.Dental_health || 'ปกติ'}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 📥 หน้าต่าง POPUP: รายละเอียดอย่างละเอียด */}
      {isDetailOpen && selectedDetailItem && (
        <div style={styles.overlay} onClick={() => setIsDetailOpen(false)}>
          <div style={styles.modalDev} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#666' }}>
                ปีการศึกษา {selectedDetailItem.Year || '2569'} ({selectedDetailItem.Term || 'ภาคเรียนที่ 1'})
              </span>
              <strong style={{ fontSize: '16px', color: '#1e3a8a' }}>รายงานพัฒนาการเด็กอย่างละเอียด</strong>
              <span style={styles.closeX} onClick={() => setIsDetailOpen(false)}>X</span>
            </div>

            <div style={styles.formScrollable}>
              <div style={{ backgroundColor: '#f0f4f8', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000' }}>
                  นักเรียน: {getStudentName(selectedDetailItem.Student_id || selectedDetailItem.student_id || selectedDetailItem.Student_Id)}
                </div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>
                  วันที่ประเมินล่าสุด: {selectedDetailItem.date_clean || (selectedDetailItem.date ? String(selectedDetailItem.date).split('T')[0] : 'ไม่ระบุ')}
                </div>
              </div>

              <h4 style={{ ...styles.tableSectionTitle, marginTop: '0px', color: '#1e3a8a' }}>📊 1. ข้อมูลพัฒนาการด้านร่างกาย</h4>
              <div style={{ ...styles.bodyMetricsRow, flexWrap: 'wrap', backgroundColor: '#fafafa', padding: '10px', borderRadius: '6px', gap: '8px', border: '1px solid #eee' }}>
                <div style={{ width: '47%', fontSize: '13px' }}><strong>น้ำหนัก:</strong> {selectedDetailItem.Weight || '-'} กก.</div>
                <div style={{ width: '47%', fontSize: '13px' }}><strong>ส่วนสูง:</strong> {selectedDetailItem.Height || '-'} ซม.</div>
                <div style={{ width: '47%', fontSize: '13px' }}><strong>สุขภาพฟัน:</strong> {selectedDetailItem.Dental_health || 'ปกติ'}</div>
                <div style={{ width: '47%', fontSize: '13px' }}><strong>การได้รับวัคซีน:</strong> {selectedDetailItem.Vaccination || 'ครบตามเกณฑ์'}</div>
                <div style={{ width: '98%', fontSize: '13px' }}><strong>การเคลื่อนไหว:</strong> {selectedDetailItem.Motor_skills || 'สมวัย'}</div>
              </div>

              <h4 style={{ ...styles.tableSectionTitle, color: '#1e3a8a' }}>🎭 2. รายละเอียดการประเมินรายหัวข้อย่อย</h4>
              <table style={{ ...styles.evalTable, border: '1px solid #e5e7eb' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ ...styles.thLeft, padding: '8px' }}>หัวข้อประเมินพัฒนาการ</th>
                    <th style={{ ...styles.thCenter, padding: '8px', width: '120px' }}>ระดับพัฒนาการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ ...styles.tdLeft, fontWeight: 'bold', color: '#555' }} colSpan="2">ด้านอารมณ์</td></tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การแสดงออกทางอารมณ์</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Emotion)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การควบคุมอารมณ์</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Emotion_control)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• ความมั่นใจในตนเอง</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Confidence)}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ ...styles.tdLeft, fontWeight: 'bold', color: '#555' }} colSpan="2">ด้านสังคม</td></tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การจัดการความเครียด</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Stress)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การมีปฏิสัมพันธ์กับผู้อื่น</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Interaction)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การช่วยเหลือเอื้อเฟื้อ</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Assistance)}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ ...styles.tdLeft, fontWeight: 'bold', color: '#555' }} colSpan="2">ด้านสติปัญญา</td></tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การคิดแก้ปัญหา</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Problem_solving)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• ทักษะด้านการสื่อสาร</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Communication)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• ความสามารถด้านการจดจำ</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Remembering)}</td>
                  </tr>
                </tbody>
              </table>

              <button
                type="button"
                style={styles.btnCloseDetail}
                onClick={() => setIsDetailOpen(false)}
              >
                ปิดหน้ารายงานรายละเอียด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', width: '100%', display: 'flex', justifyContent: 'center', fontFamily: "sans-serif" },
  cardMain: { border: '1px solid #ccc', borderRadius: '8px', padding: '20px', width: '100%', maxWidth: '650px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' },
  mainTitle: { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' },
  studentNameDisplay: { margin: '4px 0 0 0', fontSize: '14px', color: '#666' },
  badgeParent: { padding: '4px 12px', backgroundColor: '#eef2f7', color: '#4a5568', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
  statusText: { fontSize: '14px', color: '#666', textAlign: 'center', margin: '20px 0' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  emptyState: { textAlign: 'center', color: '#888', padding: '30px', border: '1px dashed #ccc', borderRadius: '8px', fontSize: '14px' },
  devCardItem: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', backgroundColor: '#fafafa' },
  cardItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  yearText: { fontSize: '14px', fontWeight: 'bold', color: '#444', lineHeight: '1.5' },
  dateText: { fontSize: '12px', color: '#666' },
  circlesRow: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '10px', marginBottom: '14px' },
  circleUnit: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  circleScore: { width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#fff', color: '#333' },
  circleLabel: { fontSize: '11px', color: '#555' },
  bodyDetailsSummary: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#555', border: '1px solid #eee' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modalDev: { backgroundColor: '#fff', width: '90%', maxWidth: '520px', height: '82vh', borderRadius: '12px', border: '1px solid #ccc', padding: '20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #eee' },
  closeX: { cursor: 'pointer', fontWeight: 'bold', color: '#999', fontSize: '16px' },
  formScrollable: { overflowY: 'auto', flex: 1, paddingRight: '5px', marginTop: '15px' },
  bodyMetricsRow: { display: 'flex', gap: '10px', justifyContent: 'space-between' },
  tableSectionTitle: { fontSize: '13px', margin: '16px 0 6px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px', fontWeight: 'bold' },
  evalTable: { width: '100%', borderCollapse: 'collapse', marginBottom: '10px' },
  thLeft: { textAlign: 'left', fontSize: '11px', color: '#333', fontWeight: 'bold', backgroundColor: '#f5f5f5' },
  thCenter: { textAlign: 'center', fontSize: '11px', color: '#333', fontWeight: 'bold', minWidth: '80px', backgroundColor: '#f5f5f5' },
  tdLeft: { fontSize: '12px', padding: '7px 5px', borderBottom: '1px solid #eee', color: '#444' },
  tdCenter: { textAlign: 'center', padding: '7px 5px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#000' },
  btnCloseDetail: { width: '100%', padding: '10px', marginTop: '15px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
};