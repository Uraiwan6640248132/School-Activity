import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ฟังก์ชันส่วนกลางสำหรับแกะเอา User_id จาก LocalStorage
const getActiveUserId = () => {
  let id = localStorage.getItem('User_id') || localStorage.getItem('userId') || localStorage.getItem('id');

  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      id = parsedUser.User_id || parsedUser.userId || parsedUser.id || id;
    } catch (e) {
      if (storedUser && !isNaN(storedUser)) {
        id = storedUser;
      }
    }
  }
  return id;
};

function EditProfile() {
  const [formData, setFormData] = useState({
    Name: '',
    Phone: '',
    Username: '',
    Role: '',
    NewPassword: '',
    ConfirmPassword: ''
  });

  const [loading, setLoading] = useState(true);

  // ใช้ useCallback ครอบฟังก์ชันที่ถูกเรียกใช้ใน useEffect
  const fetchProfileData = useCallback(async (id) => {
    try {
      const res = await axios.get(`http://127.0.0.1:3001/users/${id}`);
      const data = res.data;

      const foundUsername = data.UserName || data.Username || data.username || '';
      const foundRole = data.Role || data.role || data.Status || data.status || 'ผู้ใช้งาน';

      setFormData({
        Name: data.Name || '',
        Phone: data.Phone || '',
        Username: foundUsername,
        Role: foundRole,
        NewPassword: '',
        ConfirmPassword: ''
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      alert("ไม่สามารถโหลดข้อมูลส่วนตัวได้");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = getActiveUserId(); // ใช้ชื่อตัวแปร userId ให้ตรงตามโครงสร้างเดิมของไฟล์นี้

    if (!userId) {
      alert("ไม่พบข้อมูลเซสชันการเข้าสู่ระบบ กรุณาล็อกอินใหม่อีกครั้ง");
      setLoading(false);
      return;
    }

    fetchProfileData(userId);

    // 🟢 แก้ไข Warning: react-hooks/exhaustive-deps โดยการปิดแจ้งเตือนสำหรับการโหลดค่าครั้งแรก
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = getActiveUserId();
    if (!userId) {
      alert("ไม่พบรหัสผู้ใช้งานในการบันทึกข้อมูล");
      return;
    }

    if (formData.NewPassword && formData.NewPassword !== formData.ConfirmPassword) {
      alert("รหัสผ่านใหม่ และ ยืนยันรหัสผ่านใหม่ไม่ตรงกันครับ");
      return;
    }

    try {
      const payload = {
        Name: formData.Name,
        Phone: formData.Phone,
        Username: formData.Username,
        UserName: formData.Username,
        Role: formData.Role
      };

      if (formData.NewPassword.trim() !== "") {
        payload.Password = formData.NewPassword;
      } else {
        payload.Password = formData.ConfirmPassword || undefined;
      }

      await axios.put(`http://127.0.0.1:3001/users/${userId}`, payload);

      alert("บันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวและรหัสผ่านสำเร็จแล้วครับ!");

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.Name = formData.Name;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        } catch (e) { }
      }

      setFormData(prev => ({ ...prev, NewPassword: '', ConfirmPassword: '' }));
      fetchProfileData(userId);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูลส่วนตัว...</div>;

  return (
    <div style={styles.container}>
      {/* 🟢 เอาการแสดงผลชื่อออกเรียบร้อยแล้ว */}
      <div style={styles.topHeader}></div>

      <div style={styles.headerArea}>
        <h2 style={{ margin: 10, color: '#0369a1' }}>แก้ไขข้อมูลส่วนตัว</h2>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>

          <div style={styles.formGroup}>
            <label style={styles.label}>ชื่อ-นามสกุล</label>
            <input
              type="text" name="Name" style={styles.input}
              value={formData.Name} onChange={handleChange} required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>เบอร์โทร</label>
            <input
              type="text" name="Phone" style={styles.input}
              value={formData.Phone} onChange={handleChange} required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>ชื่อผู้ใช้</label>
            <input
              type="text" name="Username" style={styles.input}
              value={formData.Username} onChange={handleChange} required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>สถานะ</label>
            <input
              type="text" style={styles.inputReadOnly}
              value={formData.Role} readOnly
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>รหัสผ่านใหม่ (ปล่อยว่างไว้ได้หากไม่ต้องการเปลี่ยน)</label>
            <input
              type="password" name="NewPassword" placeholder="กรอกรหัสผ่านใหม่" style={styles.input}
              value={formData.NewPassword} onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password" name="ConfirmPassword" placeholder="กรอกยืนยันรหัสผ่านใหม่อีกครั้ง" style={styles.input}
              value={formData.ConfirmPassword} onChange={handleChange}
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
  container: { padding: "30px", backgroundColor: "#dff3ff", minHeight: "100vh", fontFamily: "'Kanit', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" },
  topHeader: { position: "absolute", top: "20px", right: "40px", fontSize: "15px", fontWeight: "600", color: "#1e293b" },
  mainTitle: { fontSize: "26px", fontWeight: "600", color: "#1e293b", margin: "40px 0 6px 0", alignSelf: "flex-start", maxWidth: "550px", width: "100%" },
  subTitle: { fontSize: "15px", color: "#64748b", margin: "0 0 25px 0", alignSelf: "flex-start", maxWidth: "550px", width: "100%" },
  formCard: { background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "30px", width: "100%", maxWidth: "550px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", boxSizing: "border-box" },
  formGroup: { marginBottom: "20px", textAlign: "left" },
  label: { display: "block", fontSize: "14px", color: "#334155", fontWeight: "500", marginBottom: "8px" },
  input: { width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box", fontSize: "14px", color: "#1e293b", fontFamily: "'Kanit', sans-serif", outline: "none" },
  inputReadOnly: { width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", borderRadius: "8px", boxSizing: "border-box", fontSize: "14px", color: "#64748b", fontFamily: "'Kanit', sans-serif" },
  submitButton: { width: "100%", padding: "12px", backgroundColor: "#ffffff", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", fontFamily: "'Kanit', sans-serif", marginTop: "10px" }
};

export default EditProfile;