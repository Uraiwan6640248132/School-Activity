import React, { useState, useEffect } from "react";
import axios from "axios"; // ✅ แก้ไขเรียบร้อยแล้วครับ

const PersonalData = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    role: "ครูผู้สอน",
    class_level: "", // ✨ 1. เพิ่ม class_level ใน State เริ่มต้น
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const storedUser = localStorage.getItem("user");
  const userObj = storedUser ? JSON.parse(storedUser) : null;
  const userId = userObj?.id || userObj?.ID || userObj?.id_user || 1;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/${userId}`);
        if (response.data) {
          setFormData({
            name: response.data.Name || "",
            phone: response.data.Phone || "",
            username: response.data.UserName || response.data.Username || "",
            role: response.data.Role || "ครูผู้สอน",
            class_level: response.data.Class_level || "ไม่มี", // ✨ 2. ดึงข้อมูล Class_level มาจากฐานข้อมูลหลังบ้าน
            password: "",
            confirmPassword: "",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("ดึงข้อมูลส่วนตัวไม่สำเร็จ:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("รหัสผ่านใหม่ และ ยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    try {
      const updateData = {
        Name: formData.name,
        Phone: formData.phone,
        Username: formData.username,
        Class_level: formData.class_level, // ✨ 3. ส่งข้อมูล Class_level แนบกลับไปตอนเซฟด้วย ข้อมูลจะได้ไม่ว่างเปล่า
      };

      if (formData.password) {
        updateData.Password = formData.password;
      }

      await axios.put(`http://localhost:3001/users/${userId}`, updateData);
      alert("บันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวสำเร็จเรียบร้อยครับ!");
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      console.error("บันทึกข้อมูลไม่สำเร็จ:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลส่วนตัว");
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px", fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <button type="button" style={styles.btnTitle}>จัดการข้อมูลส่วนตัว</button>
        <p style={styles.subtitle}>แก้ไขข้อมูลของคุณ</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.profileCard}>
        <div style={styles.avatarSection}>
          <div style={styles.avatarCircle}></div>
          <h3 style={styles.teacherName}>{formData.name || "ครูผู้สอน"}</h3>
          <span style={styles.teacherRole}>{formData.role}</span>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>ชื่อ-นามสกุล</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={styles.input} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>เบอร์โทร</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={styles.input} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>ชื่อผู้ใช้</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled
            style={{ ...styles.input, backgroundColor: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>สถานะ</label>
          <input type="text" name="role" value={formData.role} disabled style={{ ...styles.input, backgroundColor: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }} />
        </div>

        {/* ✨ 4. เพิ่มช่องแสดง "ระดับชั้น / ห้องเรียนประจำชั้น" ล็อก disabled ไว้ห้ามแก้ไขเอง */}
        <div style={styles.formGroup}>
          <label style={styles.label}>ครูผู้สอนระดับชั้น</label>
          <input
            type="text"
            name="class_level"
            value={formData.class_level}
            disabled
            style={{ ...styles.input, backgroundColor: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>รหัสผ่านใหม่ (ปล่อยว่างหากไม่เปลี่ยน)</label>
          <input type="password" name="password" placeholder="กรอกรหัสผ่านใหม่" value={formData.password} onChange={handleInputChange} style={styles.input} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>ยืนยันรหัสผ่านใหม่</label>
          <input type="password" name="confirmPassword" placeholder="กรอกยืนยันรหัสผ่านใหม่อีกครั้ง" value={formData.confirmPassword} onChange={handleInputChange} style={styles.input} />
        </div>

        <button type="submit" style={styles.btnSave}>บันทึกการเปลี่ยนแปลง</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px 20px",
    fontFamily: "'Kanit', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "100%",
    boxSizing: "border-box",
  },
  headerArea: {
    width: "100%",
    maxWidth: "520px",
    marginBottom: "1.2rem",
    textAlign: "left",
  },
  btnTitle: {
    padding: "6px 14px",
    fontSize: "14px",
    fontWeight: "700",
    backgroundColor: "#ffffff",
    border: "1px solid #000000",
    borderRadius: "6px",
  },
  subtitle: {
    margin: "5px 0 0 2px",
    fontSize: "13px",
    color: "#64748b",
  },
  profileCard: {
    width: "100%",
    maxWidth: "520px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "35px 40px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "10px",
  },
  avatarCircle: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    marginBottom: "10px",
  },
  teacherName: {
    margin: "0 0 2px 0",
    fontSize: "22px",
    fontWeight: "700",
    color: "#000000",
  },
  teacherRole: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    textAlign: "left"
  },
  label: {
    fontSize: "15px",
    color: "#000000",
    fontWeight: "600",
  },
  input: {
    padding: "11px 14px",
    fontSize: "15px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
    fontFamily: "'Kanit', sans-serif",
  },

  btnSave: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Kanit', sans-serif",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
    marginTop: "8px",
    transition: "all 0.2s",
  },
};

export default PersonalData;