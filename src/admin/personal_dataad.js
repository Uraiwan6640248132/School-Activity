import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [loggedInName, setLoggedInName] = useState(''); // เก็บชื่อคนล็อกอินแสดงมุมขวาบน

  // ฟังก์ชันส่วนกลางสำหรับแกะเอา User_id จาก LocalStorage
  const getActiveUserId = () => {
    // 1. ลองดึงแบบตรงๆ เผื่อระบบเก็บแยกไว้
    let id = localStorage.getItem('User_id') || localStorage.getItem('userId') || localStorage.getItem('id');

    // 2. ดึงจากก้อนวัตถุ 'user' (อิงตาม Log หน้าจอที่ระบุว่าระบบของคุณใช้คีย์ตัวนี้)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // ดึงตัวแปร ID ตามโครงสร้างหลังบ้านของคุณ
        id = parsedUser.User_id || parsedUser.userId || parsedUser.id || id;
      } catch (e) {
        // หากไม่ใช่ JSON string แต่เป็น ID ตรงๆ
        if (storedUser && !isNaN(storedUser)) {
          id = storedUser;
        }
      }
    }
    return id;
  };

  useEffect(() => {
    const savedUserId = getActiveUserId();

    // ดักชื่อผู้ใช้งานแสดงผลมุมบนขวา
    let savedName = 'อัญชนา อาจหาญ';
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.Name || parsedUser.name) savedName = parsedUser.Name || parsedUser.name;
      } catch (e) { }
    }
    setLoggedInName(savedName);

    if (!savedUserId) {
      alert("ไม่พบข้อมูลเซสชันการเข้าสู่ระบบ กรุณาล็อกอินใหม่อีกครั้ง");
      setLoading(false);
      return;
    }

    // ส่ง ID จริงไปดึงข้อมูลมาแสดงในฟอร์ม
    fetchProfileData(savedUserId);
  }, []);

  const fetchProfileData = async (id) => {
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

      if (data.Name) setLoggedInName(data.Name);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      alert("ไม่สามารถโหลดข้อมูลส่วนตัวได้");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // เรียกดึง ID ล่าสุดเพื่อส่งอัปเดตไปหลังบ้าน
    const savedUserId = getActiveUserId();
    if (!savedUserId) {
      alert("ไม่พบรหัสผู้ใช้งานในการบันทึกข้อมูล");
      return;
    }

    // เช็คความถูกต้องของการยืนยันรหัสผ่าน
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

      // ถ้าระบุรหัสผ่านใหม่ ให้ส่งตัวแปร Password พ่วงไปกับ Payload ด้วย
      if (formData.NewPassword.trim() !== "") {
        payload.Password = formData.NewPassword;
      } else {
        // 🟢 เพิ่มเติม: หากปล่อยว่างรหัสผ่านไว้ ให้ดึงรหัสผ่านเดิมจากฟอร์มส่งกลับไปด้วยเพื่อไม่ให้ข้อมูลเดิมหลุดหาย
        // (ขึ้นอยู่กับโครงสร้าง API หากหลังบ้านยอมรับค่าว่างเพื่อข้าม สามารถลบบรรทัดล่างออกได้ครับ)
        payload.Password = formData.ConfirmPassword || undefined;
      }

      await axios.put(`http://127.0.0.1:3001/users/${savedUserId}`, payload);

      alert("บันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวและรหัสผ่านสำเร็จแล้วครับ!");

      // อัปเดตข้อมูล Session ใน LocalStorage ให้เป็นชื่อใหม่ด้วย
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.Name = formData.Name;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        } catch (e) { }
      }

      setFormData(prev => ({ ...prev, NewPassword: '', ConfirmPassword: '' }));
      fetchProfileData(savedUserId);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูลส่วนตัว...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.topHeader}>
        <span>{loggedInName}</span>
      </div>

      <h1 style={styles.mainTitle}>จัดการข้อมูลส่วนตัว</h1>
      <p style={styles.subTitle}>แก้ไขข้อมูลของคุณ</p>

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
  container: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Kanit', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" },
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