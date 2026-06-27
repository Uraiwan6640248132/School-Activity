import React, { useState } from 'react';
import axios from 'axios';
// 🛠️ ปรับ Path ให้วิ่งย้อนกลับไปดึงไฟล์รูปภาพจากโฟลเดอร์ src ให้ถูกต้องตามโครงสร้างของพี่ครับ
import schoolImg from '../school-building.jpg.JPG'; 

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      return alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
    }

    const loginData = {
      UserName: username,
      Password: password
    };

    try {
      const res = await axios.post('http://127.0.0.1:3001/login', loginData);

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onLoginSuccess();
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        alert(err.response.data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else {
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* 🎨 ฝั่งซ้าย: พื้นหลังรูปตึกโรงเรียน */}
        <div style={{...styles.leftPanel, backgroundImage: `url(${schoolImg})`}}>
          
          {/* ข้อความขยับขึ้นมาและเปลี่ยนเป็นสีน้ำเงินเรียบร้อยครับ */}
          <div style={styles.logoArea}>
            <h2 style={styles.logoText}>ระบบบันทึกกิจกรรมนักเรียนระดับปฐมวัย</h2>
          </div>
        </div>

        {/* 📝 ฝั่งขวา: ฟอร์มเข้าสู่ระบบ */}
        {/* 🌟 เพิ่ม autoComplete="off" ที่ฟอร์มเพื่อบล็อกการเดาข้อมูลทั้งหมด */}
        <div style={styles.rightPanel}>
          <form onSubmit={handleSubmit} style={styles.formContent} autoComplete="off">
            <h2 style={styles.title}>เข้าสู่ระบบ</h2>

            <div style={styles.field}>
              <label style={styles.label}>ชื่อผู้ใช้</label>
              <input
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
                /* 🌟 ป้องกัน Chrome แอบเอาชื่อเก่ามาใส่ */
                autoComplete="one-time-code" 
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>รหัสผ่าน</label>
              <input
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
                /* 🌟 ป้องกันเบราว์เซอร์แอบจำรหัสผ่าน และช่วยเคลียร์ให้ช่องว่างเปล่า */
                autoComplete="new-password" 
              />
            </div>

            <button type="submit" style={styles.button}>
              เข้าสู่ระบบ
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#e0f2fe", 
    fontFamily: "'Inter', 'Kanit', sans-serif",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9999
  },
  card: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", 
    backgroundColor: "#ffffff",
    borderRadius: "20px", 
    width: "900px", 
    height: "600px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)", 
    overflow: "hidden", 
  },
  leftPanel: {
    backgroundSize: "cover", 
    backgroundPosition: "center", 
    backgroundRepeat: "no-repeat",
    color: "#1d4ed8", 
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end", 
    alignItems: "center",    
    position: "relative",
    textAlign: "center"
  },
  logoArea: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: 2, 
    marginBottom: "60px" 
  },
  logoText: {
    margin: 0,
    fontWeight: "700",
    fontSize: "20px",
    lineHeight: "1.4",
    color: "#3c3e8d", 
    textShadow: "0 1px 4px rgba(255, 255, 255, 0.6)" 
  },
  logoSubText: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#2563eb", 
    textShadow: "0 1px 4px rgba(255, 255, 255, 0.6)"
  },
  rightPanel: {
    padding: "40px 60px",
    display: "flex",
    flexDirection: "column",
  },
  formContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "center", 
  },
  title: {
    fontSize: "28px", 
    fontWeight: "700",
    margin: "0 0 40px 0",
    color: "#1e293b",
    textAlign: "left"
  },
  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#64748b",
    textAlign: "left"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box",
    outline: "none",
    fontSize: "14px",
    color: "#334155",
    backgroundColor: "#f8fafc", 
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "#60a5fa", 
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 6px -1px rgba(96, 165, 250, 0.3)",
  }
};




export default Login;