import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PersonalDataAd() {
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

  useEffect(() => {
    // 🔐 1. ดึงข้อมูลผู้ใช้เบื้องต้นจาก localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // หาค่า id ของแอดมินให้เจอก่อน (ดักจับทั้งตัวพิมพ์เล็กและพิมพ์ใหญ่)
        const userId = userData.User_id || userData.user_id || userData.id;

        if (userId) {
          // 📡 2. ดึงข้อมูลที่อัปเดตล่าสุดจากหลังบ้าน (Database) โดยตรงเพื่อให้ค่าแสดงในช่องอินพุตทันที
          axios.get(`http://127.0.0.1:3001/users`)
            .then(res => {
              // ค้นหาข้อมูลของแอดมินคนนี้จากรายชื่อผู้ใช้ทั้งหมด
              const currentUser = res.data.find(u => String(u.User_id) === String(userId));
              
              if (currentUser) {
                // 🎯 นำค่าจริงจากฐานข้อมูลไปเซ็ตลงช่องอินพุต
                setFormData(prev => ({
                  ...prev,
                  User_id: currentUser.User_id,
                  Name: currentUser.Name || '',
                  Phone: currentUser.Phone || '',
                  UserName: currentUser.UserName || '',
                  Role: currentUser.Role || 'แอดมิน'
                }));
              } else {
                // เผื่อกรณีหาไม่เจอในตาราง ให้หยิบค่าจาก localStorage มาประคองไว้ก่อน
                setFormData(prev => ({
                  ...prev,
                  User_id: userId,
                  Name: userData.Name || userData.name || '',
                  Phone: userData.Phone || userData.phone || '',
                  UserName: userData.UserName || userData.username || '',
                  Role: userData.Role || 'แอดมิน'
                }));
              }
              setLoading(false);
            })
            .catch(err => {
              console.error("Error fetching fresh user data:", err);
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

  // ฟังก์ชันดักจับเวลาพิมพ์ข้อความในแต่ละช่อง
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันกดบันทึกการเปลี่ยนแปลง
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert("❌ รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกันครับ!");
        return;
      }
    }

    try {
      await axios.put(`http://127.0.0.1:3001/users/${formData.User_id}`, {
        Name: formData.Name,
        Phone: formData.Phone,
        Username: formData.UserName,
        Role: formData.Role,
        Password: formData.newPassword ? formData.newPassword : undefined
      });

      alert("🎉 บันทึกการเปลี่ยนข้อมูลส่วนตัวสำเร็จเรียบร้อยแล้วครับ!");
      
      // อัปเดตข้อมูลใหม่ลงหน่วยความจำด้วย
      const updatedUser = {
        User_id: formData.User_id,
        Name: formData.Name,
        Phone: formData.Phone,
        UserName: formData.UserName,
        Role: formData.Role
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลส่วนตัวได้");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Kanit', sans-serif" }}>กำลังดึงข้อมูลจากฐานข้อมูล...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>จัดการข้อมูลส่วนตัว</h1>
      <p style={styles.subTitle}>แก้ไขข้อมูลของคุณ</p>

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
              onChange={handleChange}
              style={styles.input}
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
    boxSizing: "border-box",
    transition: "all 0.2s"
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

export default PersonalDataAd;