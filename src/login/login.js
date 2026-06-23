import React, { useState } from 'react';
import axios from 'axios';
// 🎯 ลบ import { useNavigate } ออกจากตรงนี้แล้ว คำเตือนจะหายไปทันทีครับพี่!

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
        // 💾 1. บันทึกข้อมูลสิทธิ์ลงในเบราว์เซอร์
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // 🌟 2. อัปเดตสิทธิ์ให้หน้า App.js รับทราบระบบหลักจะพา Redirect ไปยังหน้าสิทธิ์นั้นอัตโนมัติ
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
      <form onSubmit={handleSubmit} style={styles.box}>
        <h2 style={styles.title}>ระบบบันทึกกิจกรรมนักเรียน</h2>
        
        <div style={styles.field}>
          <label style={styles.label}>ชื่อผู้ใช้</label>
          <input
            type="text"
            placeholder="กรอกชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
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
          />
        </div>

        <button type="submit" style={styles.button}>
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "100vh", width: "100vw", backgroundColor: "#f8fafc",
    fontFamily: "'Inter', 'Kanit', sans-serif", position: "absolute",
    top: 0, left: 0, zIndex: 9999
  },
  box: {
    background: "#ffffff", padding: "40px 30px", borderRadius: "12px",
    width: "360px", display: "flex", flexDirection: "column",
    boxSizing: "border-box", border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
  },
  title: { fontSize: "18px", fontWeight: "600", margin: "0 0 25px 0", color: "#1e293b", textAlign: "center" },
  field: { display: "flex", flexDirection: "column", marginBottom: "18px" },
  label: { fontSize: "14px", marginBottom: "6px", color: "#475569", textAlign: "left" },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1",
    boxSizing: "border-box", outline: "none", fontSize: "14px", color: "#334155", backgroundColor: "#ffffff"
  },
  button: {
    width: "100%", padding: "11px", borderRadius: "6px", border: "1px solid #cbd5e1",
    background: "#ffffff", color: "#334155", fontWeight: "500", fontSize: "15px",
    cursor: "pointer", marginTop: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
  }
};

export default Login;