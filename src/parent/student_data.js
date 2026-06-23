import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // 🌐 ดึงข้อมูลรายชื่อนักเรียนจาก API หลังบ้าน
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
    <div style={styles.container}>
      {/* 🏷️ ส่วนหัวข้อปุ่ม (อิงตามกรอบ "ข้อมูลนักเรียน" ใน image_0a2e80.png) */}
      <div style={styles.headerButton}>
        ข้อมูลนักเรียน
      </div>

      {/* 🗂️ ส่วนพื้นที่แสดงการ์ดโปรไฟล์นักเรียน */}
      <div style={styles.cardContainer}>
        {loading ? (
          <p style={styles.messageText}>กำลังโหลดข้อมูลนักเรียน...</p>
        ) : students.length > 0 ? (
          students.map((student, index) => (
            <div key={index} style={styles.studentCard}>
              {/* ฝั่งซ้าย: กล่องรูปภาพโปรไฟล์ (จำลองไอคอนรูปตามพิมพ์เขียว) */}
              <div style={styles.avatarBox}>
                {student.Image_url || student.image ? (
                  <img 
                    src={student.Image_url || student.image} 
                    alt="Student" 
                    style={styles.avatarImage} 
                  />
                ) : (
                  <div style={styles.placeholderIcon}>
                    🖼️
                    <span style={styles.addText}>Add Image</span>
                  </div>
                )}
              </div>

              {/* ฝั่งขวา: รายละเอียด ชื่อ-นามสกุล และระดับชั้น */}
              <div style={styles.detailsBox}>
                <h4 style={styles.studentName}>
                  {student.Firstname || student.name || "ชื่อ-นามสกุลนักเรียน"} {student.Lastname || ""}
                </h4>
                <p style={styles.studentClass}>
                  ระดับชั้น: {student.Class_level || student.class || "ไม่ระบุชั้นเรียน"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.messageText}>ไม่พบข้อมูลนักเรียนผูกกับบัญชีนี้</p>
        )}
      </div>
    </div>
  );
};

// 🎨 ถอดแบบ CSS Styles จาก Mockup ของผู้ปกครอง (Clean & Minimalist Line-art)
const styles = {
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
    maxWidth: "550px" // คุมความกว้างการ์ดให้สมดุลตามหน้าจอตัวอย่างของคุณ
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

export default StudentData;