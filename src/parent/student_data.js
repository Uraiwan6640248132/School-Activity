import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌐 ดึงรูปภาพจากโฟลเดอร์ uploads ของฝั่ง Server หลังบ้าน
  const BACKEND_IMAGE_URL = "http://localhost:3001/uploads/";

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/students");
        setStudents(res.data);
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน:", error);
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  return (
    <div style={studentStyles.container}>
      <div style={studentStyles.headerButton}>
        ข้อมูลนักเรียน
      </div>

      <div style={studentStyles.cardContainer}>
        {loading ? (
          <p style={studentStyles.messageText}>กำลังโหลดข้อมูลนักเรียน...</p>
        ) : students.length > 0 ? (
          students.map((student, index) => {
            const currentImage = student.Image || student.Image_url || student.image;
            
            // ตรวจสอบโครงสร้างชื่อไฟล์ภาพ หากพบข้อมูลประเภท Base64 ยาวๆ 
            // จะไม่นำไปเชื่อมต่อพอร์ตเพื่อป้องกัน HTTP Error 431 
            const finalImageUrl = currentImage && !currentImage.startsWith("data:")
              ? currentImage.startsWith("http") ? currentImage : `${BACKEND_IMAGE_URL}${currentImage}`
              : null;

            return (
              <div key={index} style={studentStyles.studentCard}>
                <div style={studentStyles.avatarBox}>
                  {finalImageUrl ? (
                    <img 
                      src={finalImageUrl} 
                      alt="Student" 
                      style={studentStyles.avatarImage} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-icon';
                          fallback.style.display = 'flex';
                          fallback.style.flexDirection = 'column';
                          fallback.style.alignItems = 'center';
                          fallback.style.color = '#94a3b8';
                          fallback.style.fontSize = '20px';
                          fallback.innerHTML = '🖼️<span style="font-size:9px; margin-top:2px; color:#94a3b8;">No File</span>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div style={studentStyles.placeholderIcon}>
                      🖼️
                      <span style={studentStyles.addText}>Add Image</span>
                    </div>
                  )}
                </div>

                <div style={studentStyles.detailsBox}>
                  <h4 style={studentStyles.studentName}>
                    {student.Firstname || student.name || "ชื่อ-นามสกุลนักเรียน"} {student.Lastname || ""}
                  </h4>
                  <p style={studentStyles.studentClass}>
                    ระดับชั้น: {student.Class_level || student.class || "ไม่ระบุชั้นเรียน"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p style={studentStyles.messageText}>ไม่พบข้อมูลนักเรียนผูกกับบัญชีนี้</p>
        )}
      </div>
    </div>
  );
};

// 🎨 เปลี่ยนชื่อตัวแปรสไตล์เป็น studentStyles ป้องกันระบบสับสนชนกับตัวแปรหน้าอื่น
const studentStyles = {
  container: {
    padding: "20px 10px",
    fontFamily: "sans-serif",
    width: "100%",
    boxSizing: "border-box"
  },
  headerButton: {
    display: "inline-block",
    backgroundColor: "#ffffff",
    border: "1px solid #94a3b8",
    padding: "10px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1e293b",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    marginBottom: "40px"
  },
  cardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxWidth: "550px"
  },
  studentCard: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    gap: "20px"
  },
  avatarBox: {
    width: "75px",
    height: "75px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    overflow: "hidden"
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  placeholderIcon: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#94a3b8",
    fontSize: "20px"
  },
  addText: {
    fontSize: "9px",
    marginTop: "2px",
    color: "#94a3b8"
  },
  detailsBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  studentName: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "bold",
    color: "#0f172a"
  },
  studentClass: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b"
  },
  messageText: {
    color: "#94a3b8",
    fontSize: "14px"
  }
};

export default StudentData; // 