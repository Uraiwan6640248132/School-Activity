import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PersonalDataParent() {
  const [formData, setFormData] = useState({
    User_id: '',
    Name: '',
    Phone: '',
    UserName: '',
    Role: '',
    Class_level: '', // ✨ 1. เพิ่ม Class_level ใน State เริ่มต้น
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔐 1. ดึงเซสชันผู้ปกครองที่ล็อกอินมาจาก localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const userId = userData.User_id || userData.user_id || userData.id;

        if (userId) {
          // 📡 2. ดึงข้อมูลที่อัปเดตล่าสุดตรงจากฐานข้อมูล (MySQL)
          axios.get(`http://127.0.0.1:3001/users`)
            .then(res => {
              // ค้นหาข้อมูลของผู้ปกครองคนนี้ในระบบ
              const currentUser = res.data.find(u => String(u.User_id) === String(userId));

              if (currentUser) {
                setFormData(prev => ({
                  ...prev,
                  User_id: currentUser.User_id,
                  Name: currentUser.Name || '',
                  Phone: currentUser.Phone || '',
                  UserName: currentUser.UserName || '',
                  Role: currentUser.Role || 'ผู้ปกครอง',
                  Class_level: currentUser.Class_level || 'ไม่มี' // ✨ 2. ดึงค่า Class_level มาจากฐานข้อมูล
                }));
              }
              setLoading(false);
            })
            .catch(err => {
              console.error("Error fetching parent data:", err);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error parsing user storage:", err);
        setLoading(false);
      }
    } else {
      alert("ไม่พบเซสชันการเข้าสู่ระบบ กรุณาล็อกอินใหม่อีกครั้ง");
      window.location.href = "/login";
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert("❌ รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกันครับ!");
        return;
      }
    }

    try {
      // 📝 อัปเดตข้อมูลผู้ปกครองลงตาราง users ผ่าน API หลังบ้าน
      await axios.put(`http://127.0.0.1:3001/users/${formData.User_id}`, {
        Name: formData.Name,
        Phone: formData.Phone,
        Username: formData.UserName,
        Role: formData.Role,
        Class_level: formData.Class_level, // ✨ 3. ส่งค่า Class_level แนบไปด้วยตอนอัปเดต
        Password: formData.newPassword ? formData.newPassword : undefined
      });

      alert("🎉 บันทึกการแก้ไขข้อมูลส่วนตัวสำเร็จแล้วค่ะ!");

      const updatedUser = {
        User_id: formData.User_id,
        Name: formData.Name,
        Phone: formData.Phone,
        UserName: formData.UserName,
        Role: formData.Role,
        Class_level: formData.Class_level // ✨ 4. สั่งเก็บค่า Class_level ลงในเซสชันใหม่
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูลผู้ปกครอง...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>จัดการข้อมูลส่วนตัว</h1>
      <p style={styles.subTitle}>แก้ไขข้อมูลของคุณ</p>

      {/* บล็อกดีไซน์กะทัดรัดกึ่งกลางหน้าจอพอดีตามสัดส่วน UX ของพี่ */}
      <div style={styles.formCard}>
        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.inputGroup}>
            <label style={styles.label}>ชื่อ-นามสกุล</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>เบอร์โทร</label>
            <input
              type="text"
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>ชื่อผู้ใช้</label>
            <input
              type="text"
              name="UserName"
              value={formData.UserName}
              disabled
              style={{ ...styles.input, backgroundColor: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>สถานะ</label>
            <input
              type="text"
              name="Role"
              value={formData.Role}
              style={{ ...styles.input, backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
              disabled
            />
          </div>

          {/* ✨ 5. เพิ่มช่องแสดง "ระดับชั้น / ห้องเรียน" (ล็อกไว้ไม่ให้แก้ไขเอง) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>ผู้ปกครองระดับชั้น</label>
            <input
              type="text"
              name="Class_level"
              value={formData.Class_level}
              style={{ ...styles.input, backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#475569" }}
              disabled
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>รหัสผ่านใหม่ (ปล่อยว่างไว้ได้หากไม่ต้องการเปลี่ยน)</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="กรอกรหัสผ่านใหม่"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="กรอกยืนยันรหัสผ่านใหม่อีกครั้ง"
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.submitButton}>
            บันทึกการเปลี่ยนแปลง
          </button>

        </form>
      </div>
    </div>
  );
}

// 🎨 Styles คงเดิมตามโครงสร้างของพี่ทั้งหมดครับ
const styles = {
  container: {
    padding: "40px 20px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Kanit', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  mainTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 4px 0",
    width: "100%",
    maxWidth: "480px",
    textAlign: "left"
  },
  subTitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 24px 0",
    width: "100%",
    maxWidth: "480px",
    textAlign: "left"
  },
  formCard: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    padding: "40px",
    width: "100%",
    maxWidth: "480px",
    boxSizing: "border-box"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    textAlign: "left"
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155"
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    fontFamily: "'Kanit', sans-serif",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  },
  submitButton: {
    marginTop: "12px",
    padding: "10px 20px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Kanit', sans-serif",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    width: "100%",
    textAlign: "center"
  }
};

export default PersonalDataParent;