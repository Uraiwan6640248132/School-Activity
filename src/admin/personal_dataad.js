import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PersonalDataAd() {
  // สร้างสเตตสำหรับเก็บข้อมูลฟอร์มแก้ไขข้อมูลแอดมินตามแบบร่าง UX
  const [formData, setFormData] = useState({
    User_id: '',
    Name: '',
    Phone: '',
    UserName: '',
    Role: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);

  // 1. ดึงข้อมูลแอดมินคนที่ล็อกอินปัจจุบันมาจาก localStorage เพื่อนำมาโชว์ในช่องอินพุต
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // นำข้อมูลผู้ใช้ที่ล็อกอินไปเซ็ตลงฟอร์ม
        setFormData(prev => ({
          ...prev,
          User_id: userData.User_id || '',
          Name: userData.Name || '',
          Phone: userData.Phone || '',
          UserName: userData.UserName || '',
          Role: userData.Role || 'แอดมิน'
        }));
        setLoading(false);
      } catch (err) {
        console.error("Error parsing user storage:", err);
        setLoading(false);
      }
    } else {
      alert("ไม่พบเซสชันการเข้าสู่ระบบ กรุณาล็อกอินใหม่อีกครั้ง");
      window.location.href = "/login";
    }
  }, []);

  // ฟังก์ชันดักจับการพิมพ์ข้อมูลในแต่ละช่องอินพุต
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. ฟังก์ชันเมื่อกดปุ่ม "บันทึกการเปลี่ยนแปลง"
  const handleSubmit = async (e) => {
    e.preventDefault();

    // เช็คกรณีมีการกรอกรหัสผ่านใหม่เข้ามา
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert("❌ รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกันครับ!");
        return;
      }
    }

    try {
      // ส่งข้อมูลไปอัปเดตที่ API หลังบ้าน (จะใช้ตัวเดียวกับหน้าอัปเดตสิทธิ์ หรือแยกเฉพาะบุคคลได้)
      const res = await axios.put(`http://127.0.0.1:3001/users/${formData.User_id}`, {
        Name: formData.Name,
        Phone: formData.Phone,
        Username: formData.UserName,
        Role: formData.Role, // คงสิทธิ์เดิมไว้
        Password: formData.newPassword ? formData.newPassword : undefined // ส่งรหัสใหม่ไปถ้ามีการกรอก
      });

      alert("🎉 บันทึกการเปลี่ยนข้อมูลส่วนตัวสำเร็จเรียบร้อยแล้วครับ!");
      
      // อัปเดตข้อมูลใหม่ลงใน localStorage เพื่อให้เนฟบาร์ด้านบนเปลี่ยนชื่อตามทันที
      const updatedUser = {
        User_id: formData.User_id,
        Name: formData.Name,
        Phone: formData.Phone,
        UserName: formData.UserName,
        Role: formData.Role
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // รีเฟรชหน้าจอเบาๆ เพื่ออัปเดตค่าระบบ
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลส่วนตัวได้");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูลของคุณ...</div>;

  return (
    <div style={styles.container}>
      {/* ส่วนหัวข้อแกะตามแบบร่าง UX ของพี่ (image_09b69b.png) */}
      <h1 style={styles.mainTitle}>จัดการข้อมูลส่วนตัว</h1>
      <p style={styles.subTitle}>แก้ไขข้อมูลของคุณ</p>

      {/* บล็อกการ์ดฟอร์มตรงกลาง */}
      <div style={styles.formCard}>
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* ช่องกรอก ชื่อ-นามสกุล */}
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

          {/* ช่องกรอก เบอร์โทร */}
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

          {/* ช่องกรอก ชื่อผู้ใช้ */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>ชื่อผู้ใช้</label>
            <input 
              type="text" 
              name="UserName"
              value={formData.UserName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* ช่องแสดง สถานะ (Disabled ไว้ไม่ให้แอดมินปลดสิทธิ์ตัวเองเล่น) */}
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

          {/* ช่องกรอก รหัสผ่านใหม่ */}
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

          {/* ช่องกรอก ยืนยันรหัสผ่านใหม่ */}
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

          {/* ปุ่มบันทึกตามรูปภาพร่าง */}
          <button type="submit" style={styles.submitButton}>
            บันทึกการเปลี่ยนแปลง
          </button>

        </form>
      </div>
    </div>
  );
}

// สไตล์ตกแต่งลอกฟอร์มตามฟิกม่า มินิมอล โค้งมนสวยงาม
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    fontFamily: "'Kanit', sans-serif"
  },
  mainTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 4px 0",
    textAlign: "left"
  },
  subTitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 30px 0",
    textAlign: "left"
  },
  formCard: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    padding: "35px",
    maxWidth: "550px",
    margin: "0 auto" // จัดกึ่งกลางหน้าจอสวยๆ แบบฟิกม่าพี่
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
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
    transition: "border-color 0.2s",
    "&:focus": {
      borderColor: "#3b82f6"
    }
  },
  submitButton: {
    marginTop: "10px",
    padding: "12px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Kanit', sans-serif",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#f8fafc"
    }
  }
};

export default PersonalDataAd;