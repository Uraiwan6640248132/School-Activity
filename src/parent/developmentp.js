import React, { useState, useEffect } from 'react';

export default function Developmentp() {
  const [devList, setDevList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ id: 1, name: "เด็กชายสมชาย ดีใจ" }); // ข้อมูลจำลองของนักเรียน

  // ดึงรหัสนักเรียน (Student_id) จาก localStorage ที่ผู้ปกครองล็อกอินเข้ามา หรือใช้ค่าเริ่มต้นเป็น 1
  const STUDENT_ID = Number(localStorage.getItem('student_id_of_parent')) || 1; 
  const API_URL = `http://localhost:3001/api/development`;

  const fetchDevelopmentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        
        // กรองข้อมูลเฉพาะของลูก (Student_id) ฝั่ง Frontend เพื่อป้องกัน Error หาก API ส่งมาทั้งหมด
        const filteredData = Array.isArray(data) 
          ? data.filter(item => Number(item.Student_id || item.student_id) === STUDENT_ID)
          : [];

        setDevList(filteredData);
      }
    } catch (err) {
      console.error("Error fetching student development data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopmentData();
  }, []);

  // ฟังก์ชันคำนวณคะแนนเฉลี่ยแปลงเป็นเปอร์เซ็นต์เต็ม 100
  const calculateSectionScore = (scores) => {
    if (!scores || scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => Number(a) + Number(b), 0);
    const avg = sum / scores.length;
    return Math.round(avg * 20); 
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardMain}>
        
        {/* ส่วนหัวแสดงข้อมูลของนักเรียน */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.mainTitle}>สรุปผลพัฒนาการนักเรียน</h2>
            <p style={styles.studentNameDisplay}>
              รหัสนักเรียนประเมิน: {STUDENT_ID}
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
              // คำนวณคะแนนแต่ละด้านตามข้อมูลใน Database
              const scoreBody = item.Weight && item.Height ? 100 : 75; 
              const scoreIntellect = calculateSectionScore([item.Problem_solving, item.Communication, item.Remembering]);
              const scoreEmotion = calculateSectionScore([item.Emotion, item.Emotion_control, item.Confidence]);
              const scoreSocial = calculateSectionScore([item.Stress, item.Interaction, item.Assistance]);
              
              // จัดการรูปแบบวันที่
              const displayDate = item.date_clean || 
                                  (item.Date ? String(item.Date).split('T')[0] : '') || 
                                  (item.date ? String(item.date).split('T')[0] : 'ไม่ได้ระบุ');

              // ดักจับข้อมูลภาคเรียนกรณีข้อความโดนตัดคำจาก Database
              let displayTerm = item.Term || item.term || "ภาคเรียนที่ 1";
              if (displayTerm.trim() === 'ภาคเรียนที่') {
                // ถ้าในเบสโดนตัดคำ ให้แสดงตัวเลขภาคเรียนตามลำดับข้อมูลจริงที่แสดงบนหน้าเว็บ
                displayTerm = idx === 0 ? 'ภาคเรียนที่ 1' : 'ภาคเรียนที่ 2'; 
              }

              return (
                <div key={idx} style={styles.devCardItem}>
                  <div style={styles.cardItemHeader}>
                    <span style={styles.yearText}>
                      ปีการศึกษา {item.Year || item.year || '2569'} - {displayTerm}
                    </span>
                    <span style={styles.dateText}>วันที่ประเมิน: {displayDate}</span>
                  </div>

                  {/* แสดงผลวงกลมคะแนน 4 ด้านหลัก (ไม่มีปุ่มแก้ไขและลบ) */}
                  <div style={styles.circlesRow}>
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
                    <span>🦷 สุขภาพฟัน: <strong style={{color: '#2e7d32'}}>{item.Dental_health || 'ปกติ'}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Styles การจัดวางหน้าตาแบบระบบบันทึกพัฒนาการ
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
  cardItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  yearText: { fontSize: '14px', fontWeight: 'bold', color: '#444' },
  dateText: { fontSize: '12px', color: '#666' },
  circlesRow: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '10px', marginBottom: '14px' },
  circleUnit: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  circleScore: { width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#fff', color: '#333' },
  circleLabel: { fontSize: '11px', color: '#555' },
  bodyDetailsSummary: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#555', border: '1px solid #eee' }
};