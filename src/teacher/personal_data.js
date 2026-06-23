import React, { useState, useEffect } from "react";
import axios from "axios"; 

const PersonalData = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    role: "ครูผู้สอน", 
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const userId = 1;

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
    return <div style={{ textAlign: "center", padding: "20px" }}>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div style={styles.container}>
      {/* ส่วนหัวข้อปรับสไตล์ให้ชิดและเล็กกระชับ */}
      <div style={styles.headerArea}>
        <button type="button" style={styles.btnTitle}>จัดการข้อมูลส่วนตัว</button>
        <p style={styles.subtitle}>แก้ไขข้อมูลของคุณ</p>
      </div>

      {/* 📦 ปรับการ์ดให้สั้น มินิมอล ฟิตหน้าจอพอดี ไม่ต้องเลื่อนเมาส์ลงล่าง */}
      <form onSubmit={handleSubmit} style={styles.profileCard}>
        
        {/* ส่วนรูปวงกลมและข้อมูลชื่อด้านบน (ลดขนาดเพื่อไม่ให้ดันพื้นที่ลงด้านล่างเยอะ) */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarCircle}></div>
          <h3 style={styles.teacherName}>{formData.name || "ครูผู้สอน"}</h3>
          <span style={styles.teacherRole}>{formData.role}</span>
        </div>

        {/* ส่วนฟิลด์ข้อมูล: ปรับลด Margin และลดระดับความสูงในแนวตั้งลงทั้งหมด */}
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
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} required style={styles.input} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>สถานะ</label>
          <input type="text" name="role" value={formData.role} disabled style={{ ...styles.input, backgroundColor: "#f5f5f5", color: "#888", cursor: "not-allowed" }} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>รหัสผ่านใหม่</label>
          <input type="password" name="password" placeholder="ปล่อยว่างหากไม่เปลี่ยน" value={formData.password} onChange={handleInputChange} style={styles.input} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>ยืนยันรหัสผ่านใหม่</label>
          <input type="password" name="confirmPassword" placeholder="ปล่อยว่างหากไม่เปลี่ยน" value={formData.confirmPassword} onChange={handleInputChange} style={styles.input} />
        </div>

        {/* ปุ่มบันทึกที่ปรับขนาดให้แบนเรียบ กระชับ เข้าชุดพอดี */}
        <button type="submit" style={styles.btnSave}>บันทึกการเปลี่ยนแปลง</button>
      </form>
    </div>
  );
};

// 🎨 สไตล์เซ็ตใหม่: บีบพื้นที่แนวตั้งให้สั้นลงเป็นพิเศษ เพื่อแก้ปัญหามุมมองล้นจอเลื่อนยาว
const styles = {
  container: {
    padding: "10px 20px", // ลด padding บนล่างเพื่อให้องค์ประกอบขยับขึ้นมา
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "100%",
    boxSizing: "border-box",
  },
  headerArea: {
    width: "100%",
    maxWidth: "350px", 
    marginBottom: "8px", // ลดระยะห่างด้านล่างหัวข้อ
    textAlign: "left",
  },
  btnTitle: {
    padding: "4px 10px", // ลดความหนาของปุ่มหัวข้อ
    fontSize: "12.5px",
    fontWeight: "bold",
    backgroundColor: "#ffffff",
    border: "1px solid #333333",
    borderRadius: "5px",
  },
  subtitle: {
    margin: "3px 0 0 2px",
    fontSize: "11.5px",
    color: "#555555",
  },
  profileCard: {
    width: "100%",
    maxWidth: "350px", // บีบความกว้างให้เรียวเล็กกะทัดรัด
    backgroundColor: "#ffffff",
    border: "1px solid #cccccc",
    borderRadius: "12px", // ปรับความมนให้เล็กลงสมส่วน
    padding: "15px 20px", // 🌟 ลดช่องว่าง Padding ด้านบน-ล่าง ลงเพื่อให้กล่องสั้นลงชัดเจน
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.04)",
    boxSizing: "border-box",
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "12px", // ลดช่องห่างใต้ส่วนรูปโปรไฟล์
  },
  avatarCircle: {
    width: "55px",  // 🌟 ย่อขนาดวงกลมลงจาก 75px เหลือ 55px ประหยัดพื้นที่แนวตั้ง
    height: "55px",
    borderRadius: "50%",
    border: "1px solid #333333",
    backgroundColor: "#ffffff",
    marginBottom: "4px",
  },
  teacherName: {
    margin: "0",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#000000",
  },
  teacherRole: {
    fontSize: "11.5px",
    color: "#666666",
    marginTop: "1px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "2px", // ลดช่องว่างระหว่าง label กับ input ให้กระชับชิดติดกันมากขึ้น
    marginBottom: "8px", // 🌟 ลดระยะห่างระหว่างบรรทัดลงอย่างมาก (จากเดิม 14px เหลือ 8px)
  },
  label: {
    fontSize: "12px", // ปรับขนาดตัวอักษรป้ายกำกับให้มินิมอลพอดีคำ
    color: "#000000",
    fontWeight: "500",
  },
  input: {
    padding: "5px 10px", // 🌟 บีบ Padding ในช่องกรอกให้ผอมบางและสั้นลง สวยมินิมอลมากครับ
    fontSize: "13px",
    border: "1px solid #cccccc",
    borderRadius: "5px",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  },
  btnSave: {
    width: "100%",
    padding: "7px", // บีบระดับปุ่มกดให้สั้นและแบนลงเข้าฟอร์ม
    fontSize: "13px",
    fontWeight: "500",
    backgroundColor: "#ffffff",
    border: "1px solid #333333",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "4px",
  },
};

export default PersonalData;