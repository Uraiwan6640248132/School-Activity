import React, { useState } from 'react';
import axios from 'axios';

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
      <div style={styles.card}>
        {/* 🎨 ฝั่งซ้าย: พื้นหลังสีฟ้าและกราฟิก 3D จำลอง */}
        <div style={styles.leftPanel}>
          <div style={styles.logoArea}>
            <div>
              <div style={styles.logoText}>โรงเรียนสาธิตมหาวิทยาลัยราชภัฏเลย</div>
              <div style={styles.logoSubText}>ระบบบันทึกกิจกรรมนักเรียน</div>
            </div>
          </div>
          
          {/* 🌟 ส่วนกราฟิก 3D จำลอง (ใช้ CSS สร้างรูปทรงพื้นฐาน) */}
          <div style={styles.graphicContainer}>
            <div style={{...styles.graphicShape, ...styles.shape1}}></div>
            <div style={{...styles.graphicShape, ...styles.shape2}}></div>
            <div style={{...styles.graphicShape, ...styles.shape3}}></div>
            <div style={styles.main3DWindow}>
              {/* ส่วนหน้าต่างจำลอง */}
            </div>
          </div>
        </div>

        {/* 📝 ฝั่งขวา: ฟอร์มเข้าสู่ระบบ */}
        <div style={styles.rightPanel}>
          <div style={styles.headerRight}>
      
          </div>

          <form onSubmit={handleSubmit} style={styles.formContent}>
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
      </div>
    </div>
  );
}

// ✨ อัปเดตสไตล์ใหม่ทั้งหมดเพื่อให้เหมือนดีไซน์ 3D
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#e0f2fe", // สีพื้นหลังภายนอกแบบอ่อน
    fontFamily: "'Inter', 'Kanit', sans-serif",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9999
  },
  card: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", // แบ่งครึ่งซ้ายขวา
    backgroundColor: "#ffffff",
    borderRadius: "20px", // ขอบมนมากขึ้นตามดีไซน์
    width: "900px", // ขยายขนาดการ์ด
    height: "600px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)", // เงาแบบนุ่มนวล
    overflow: "hidden", // ให้ขอบมนตัดส่วนที่ล้น
  },
  
  // สไตล์ฝั่งซ้าย (Blue Panel)
  leftPanel: {
    backgroundColor: "#60a5fa", // สีฟ้าหลัก
    color: "#ffffff",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "30px",
    height: "30px",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "18px"
  },
  logoText: {
    fontWeight: "700",
    fontSize: "18px",
  },
  logoSubText: {
    fontSize: "12px",
    opacity: 0.8,
  },
  graphicContainer: {
    flex: 1,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  // จำลองรูปทรง 3D ด้วย CSS
  main3DWindow: {
    width: "200px",
    height: "150px",
    backgroundColor: "#93c5fd",
    borderRadius: "15px",
    position: "relative",
    boxShadow: "inset 0 0 15px rgba(255,255,255,0.5), 10px 10px 20px rgba(0,0,0,0.1)",
  },
  graphicShape: {
    position: "absolute",
    borderRadius: "50%",
  },
  shape1: { // ทรงกลมสีม่วง
    width: "40px", height: "40px",
    backgroundColor: "#c084fc",
    top: "20%", left: "10%",
    boxShadow: "inset -5px -5px 10px rgba(0,0,0,0.2)",
  },
  shape2: { // ทรงกระบอกสีชมพู
    width: "20px", height: "60px",
    backgroundColor: "#f472b6",
    borderRadius: "10px",
    bottom: "20%", right: "15%",
    transform: "rotate(30deg)",
    boxShadow: "inset -3px -3px 8px rgba(0,0,0,0.2)",
  },
  shape3: { // กรวยสีม่วงอ่อน
    width: "0", height: "0",
    borderLeft: "25px solid transparent",
    borderRight: "25px solid transparent",
    borderBottom: "50px solid #a78bfa",
    borderRadius: "0", // triangle doesn't need border radius
    top: "10%", right: "20%",
    transform: "rotate(-15deg)",
    filter: "drop-shadow(5px 5px 5px rgba(0,0,0,0.1))"
  },
  footerLinkLeft: {
    fontSize: "14px",
    textAlign: "left",
    opacity: 0.9,
  },
  linkLeft: {
    color: "#ffffff",
    textDecoration: "underline",
    fontWeight: "500",
  },

  // สไตล์ฝั่งขวา (Form Panel)
  rightPanel: {
    padding: "40px 60px",
    display: "flex",
    flexDirection: "column",
  },
  headerRight: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "40px",
  },
  langSelector: {
    fontSize: "12px",
    color: "#94a3b8",
    cursor: "pointer",
  },
  formContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "center", // จัดฟอร์มให้อยู่ตรงกลางแนวตั้ง
  },
  title: {
    fontSize: "28px", // ขนาดใหญ่ขึ้นตามดีไซน์
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
    backgroundColor: "#f8fafc", // สีพื้นหลังช่อง Input แบบอ่อน
    transition: "border-color 0.2s",
    ":focus": {
      borderColor: "#60a5fa",
    }
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "#60a5fa", // สีปุ่มฟ้าเดียวกับฝั่งซ้าย
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 6px -1px rgba(96, 165, 250, 0.3)",
    transition: "background 0.2s",
    ":hover": {
      background: "#3b82f6",
    }
  },
  
  // สไตล์ Social Login
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "30px 0",
  },
  dividerText: {
    padding: "0 10px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  socialButtons: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  socialButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  socialIcon: {
    width: "18px",
    height: "18px",
  },
  socialIconButton: { // สำหรับ Facebook, Twitter
    width: "45px",
    height: "45px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#334155",
    fontWeight: "bold",
    cursor: "pointer",
  }
};

export default Login;