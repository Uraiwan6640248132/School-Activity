import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);

  const BACKEND_IMAGE_URL = "http://localhost:3001/uploads/";

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(storedUser);
        const userId = userData.id || userData.User_id || userData.user_id;

        // 📝 ปริ้นท์ดูค่าใน Console (กด F12 ดูได้ว่า ID ผู้ปกครองที่ล็อกอินคือเลขอะไร)
        console.log("Logged in Parent ID:", userId);

        if (!userId) {
          setLoading(false);
          return;
        }

        // ดึงข้อมูลนักเรียนทั้งหมดมา[cite: 1]
        const res = await axios.get(`http://localhost:3001/api/students`);
        
        if (Array.isArray(res.data)) {
          const myChildren = res.data.filter(student => {
            const studentParentId = student.User_id || student.user_id;
            
            // 🚨 ดักแก่ที่ 1: ถ้าค่า ID ฝั่งใดฝั่งหนึ่งเป็นค่าว่าง ห้ามจับคู่กันเด็ดขาด
            if (!userId || !studentParentId || userId === "undefined" || studentParentId === "undefined") {
              return false;
            }

            // เงื่อนไขหลัก: เช็กว่า ID ผู้ปกครองตรงกันไหม[cite: 1]
            const isCorrectParent = String(studentParentId) === String(userId);

            // =================================================================
            // 💡 สวิตช์ซ่อมฉุกเฉิน (ถ้าดาต้าเบสมันพังเพราะเพื่อนผูก ID ซ้ำกันมั่ว)
            // ให้ลบเครื่องหมาย // ข้างหน้าบรรทัดข้างล่างนี้ออก เพื่อล็อกให้ขึ้นเฉพาะ "อุไรวรรณ อนุบาล1 ห้องปกติ" เท่านั้น!
            // =================================================================
            // return isCorrectParent && student.Name === "อุไรวรรณ" && student.Class_level === "อนุบาล1 ห้องปกติ";

            return isCorrectParent;
          });

          setStudents(myChildren);
        } else {
          setStudents([]);
        }

      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatThaiDate = (dateString) => {
    if (!dateString) return 'ไม่ได้ระบุ';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const handleOpenViewModal = (student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerWrapper}>
        <h2 style={{ margin: 0, color: '#0369a1' }}>ข้อมูลนักเรียน</h2>
      </div>

      <div style={styles.cardContainer}>
        {loading ? (
          <p style={styles.messageText}>กำลังโหลดข้อมูลนักเรียน...</p>
        ) : students.length > 0 ? (
          students.map((student, index) => {
            const currentImage = student.Image;
            const finalImageUrl = currentImage
              ? (currentImage.startsWith("data:") || currentImage.startsWith("http") ? currentImage : `${BACKEND_IMAGE_URL}${currentImage}`)
              : null;

            return (
              <div key={index} style={styles.studentCard} onClick={() => handleOpenViewModal(student)}>
                <div style={styles.avatarBox}>
                  {finalImageUrl ? (
                    <img
                      src={finalImageUrl}
                      alt="Student"
                      style={styles.avatarImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-icon';
                          fallback.innerHTML = '👤';
                          fallback.style.fontSize = '32px';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div style={styles.placeholderIcon}>👤</div>
                  )}
                </div>

                <div style={styles.detailsBox}>
                  <h4 style={styles.studentName}>{student.Name || "ไม่ระบุชื่อ-นามสกุล"}</h4>
                  <p style={styles.studentClass}>ระดับชั้น: {student.Class_level || "ไม่ระบุชั้นเรียน"}</p>
                  <small style={{ color: '#0066cc', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>ดูข้อมูลทั้งหมด ➡️</small>
                </div>
              </div>
            );
          })
        ) : (
          <p style={styles.messageText}>ไม่พบข้อมูลนักเรียนที่เชื่อมโยงกับบัญชีนี้ในระบบ</p>
        )}
      </div>

      {/* ================= 📦 MODAL ================= */}
      {isViewModalOpen && viewingStudent && (
        <div style={styles.modalOverlay} onClick={() => setIsViewModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeX} onClick={() => setIsViewModalOpen(false)}>X</button>
            <h3 style={styles.modalHeading}>รายละเอียดข้อมูลนักเรียนทั้งหมด</h3>

            <div style={styles.avatarUploadZone}>
              {viewingStudent.Image ? (
                <img
                  src={viewingStudent.Image.startsWith("data:") || viewingStudent.Image.startsWith("http") ? viewingStudent.Image : `${BACKEND_IMAGE_URL}${viewingStudent.Image}`}
                  alt="profile"
                  style={styles.avatarBig}
                />
              ) : (
                <div style={styles.avatarPlaceholderBig}><span>👤</span></div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>ชื่อ-นามสกุล</label>
              <div style={styles.infoDisplayBox}>{viewingStudent.Name || '-'}</div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>วันเกิด</label>
              <div style={styles.infoDisplayBox}>{formatThaiDate(viewingStudent.Birthday)}</div>
            </div>

            <div style={styles.formRow}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.formLabel}>ระดับชั้น</label>
                <div style={styles.infoDisplayBox}>{viewingStudent.Class_level || '-'}</div>
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.formLabel}>เพศ</label>
                <div style={styles.infoDisplayBox}>
                  {(viewingStudent.Gender === 2 || viewingStudent.Gender === "2" || viewingStudent.Gender === "หญิง") ? 'หญิง' : 'ชาย'}
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>กรุ๊ปเลือด</label>
              <div style={styles.infoDisplayBox}>{viewingStudent.Blood_group || 'ไม่ได้ระบุ'}</div>
            </div>

            <button style={styles.btnSubmitSave} onClick={() => setIsViewModalOpen(false)}>ปิดหน้าต่าง</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "30px 20px", fontFamily: "sans-serif", width: "100%", boxSizing: "border-box" },
  headerWrapper: { marginBottom: "25px" },
  headerButton: { display: "inline-block", backgroundColor: "#ffffff", border: "1px solid #94a3b8", padding: "10px 24px", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", color: "#1e293b", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "40px" },
  cardContainer: { display: "flex", flexDirection: "column", gap: "24px", maxWidth: "550px" },
  studentCard: { display: "flex", alignItems: "center", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", gap: "24px", cursor: 'pointer' },
  avatarBox: { width: "75px", height: "75px", border: "1px solid #cbd5e1", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%", objectFit: "cover" },
  placeholderIcon: { color: "#94a3b8", fontSize: "32px" },
  detailsBox: { display: "flex", flexDirection: "column", gap: "6px", lineHeight: "1.4" },
  studentName: { margin: 0, fontSize: "17px", fontWeight: "bold", color: "#0f172a" },
  studentClass: { margin: 0, fontSize: "14px", color: "#64748b" },
  messageText: { color: "#94a3b8", fontSize: "14px" },
  modalOverlay: { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '999' },
  modalContent: { background: '#ffffff', padding: '20px 25px', borderRadius: '16px', width: '320px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', boxSizing: 'border-box' },
  modalHeading: { margin: '0 0 15px 0', fontSize: '15px', fontWeight: '600', color: '#000' },
  closeX: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '15px', cursor: 'pointer', color: '#999999' },
  avatarUploadZone: { textAlign: 'center', marginBottom: '15px' },
  avatarBig: { width: '65px', height: '65px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cccccc', display: 'block', margin: '0 auto' },
  avatarPlaceholderBig: { border: '1px solid #cccccc', width: '65px', height: '65px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#555555', background: '#fcfcfc', margin: '0 auto', fontSize: '28px' },
  formGroup: { marginBottom: '10px', display: 'flex', flexDirection: 'column', width: '100%' },
  formLabel: { fontSize: '12px', color: '#555555', marginBottom: '4px', fontWeight: '500' },
  formRow: { display: 'flex', gap: '10px', width: '100%' },
  btnSubmitSave: { width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #333333', borderRadius: '8px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer', fontSize: '13px', boxSizing: 'border-box' },
  infoDisplayBox: { padding: '6px 10px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', background: '#f9f9f9', color: '#333333', height: '32px', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center' }
};

export default StudentData;