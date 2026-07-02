import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 🆕 นำเข้า useNavigate เพื่อใช้สั่งเปลี่ยนหน้าของ React Router
// 🛠️ ปรับ Path ให้วิ่งย้อนกลับไปดึงไฟล์รูปภาพจากโฟลเดอร์ src ให้ถูกต้องตามโครงสร้างของพี่ครับ
import schoolImg from '../school-building.jpg.JPG'; 

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate(); // 🆕 ประกาศตัวแปรเพื่อเรียกใช้งานการนำทาง (Navigation)

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
    const res = await axios.post('http://127.0.0.1:3001/login', loginData );
    // =================================
    // 1. กรณี Login ไม่สำเร็จจากหลังบ้าน
    // =================================
    if (!res.data.success) {
      alert(res.data.error || "ไม่สามารถเข้าสู่ระบบได้");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    // =================================
    // 2. ดักตรวจสอบสิทธิ์การใช้งาน (แก้ไขจุดนี้)
    // =================================
   // =================================
    // 2. ดักตรวจสอบสิทธิ์การใช้งาน (ปรับตรงนี้ให้รัดกุมขึ้น)
    // =================================
    const userData = res.data.user;
    
    // ดึงค่า Role มาล้างช่องว่าง
    const checkRole = String(userData?.role || userData?.Role || "")
      .replace(/\s+/g, "")
      .trim();

    // ดึงค่า Status มาล้างช่องว่างด้วย
    const checkStatus = String(userData?.status || userData?.Status || "")
      .replace(/\s+/g, "")
      .trim();

    // 🚨 ตรวจสอบ: ถ้าเจอคำว่าระงับสิทธิ์ไม่ว่าจะจากช่อง Role หรือ Status ให้บล็อกทันที
    if (
      checkRole === "ถูกระงับสิทธิ์" || 
      checkStatus === "ถูกระงับสิทธิ์" || 
      checkStatus === "ถูกระงับ" || 
      checkStatus === "ระงับ"
    ) {
      // แสดงป๊อบอัพเตือนด้านบนทันที
      alert("บัญชีของคุณถูกระงับสิทธิ์การใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
      
      // ล้างข้อมูลเซสชันทิ้ง และบังคับให้อยู่ที่หน้าล็อกอินเดิม
      localStorage.removeItem("user");
      navigate("/login");
      return; // 🛑 ตัดจบ ไม่ให้ไหลลงไปทำงานด้านล่าง
    }

    // =================================
    // 3. กรณีสิทธิ์ผ่านปกติ (แอดมิน, ครู, ผู้ปกครอง)
    // =================================
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );
    onLoginSuccess();

  } catch(err) {
    console.log(err);
    if (err.response && err.response.data) {
      alert(err.response.data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } else {
      alert("เชื่อมต่อ Server ไม่ได้");
    }
  }
};

  // 🛠️ ปรับปรุงจุดนี้: เมื่อกดปุ่มจะวิ่งไปตาม Path "/register" ที่พี่ตั้งไว้ใน Routes ทันที
  const handleGoToRegister = () => {
    navigate('/register'); 
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
                autoComplete="new-password" 
              />
            </div>

            <button type="submit" style={styles.button}>
              เข้าสู่ระบบ
            </button>

            {/* ปุ่มเชื่อมต่อไปหน้าลงทะเบียน */}
            <div style={styles.registerContainer}>
              <span style={styles.registerText}>ยังไม่มีบัญชีผู้ใช้?</span>
              <button 
                type="button" 
                onClick={handleGoToRegister} 
                style={styles.registerButton}
              >
                ลงทะเบียนเข้าใช้งาน
              </button>
            </div>

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
    background: "#4f46e5", 
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)",
  },
  registerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "24px",
    gap: "8px",
    fontSize: "14px"
  },
  registerText: {
    color: "#64748b"
  },
  registerButton: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: "600",
    cursor: "pointer",
    padding: "0",
    fontSize: "14px",
    textDecoration: "underline",
  }
};

export default Login; 