import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import schoolImg from '../school-building.jpg.JPG';
import bgImg from '../bg-pattern.jpg'; 

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

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

      // =================================
      // 1. กรณี Login ไม่สำเร็จจากหลังบ้าน
      // =================================
      if (!res.data.success) {
        alert(res.data.error || "ไม่สามารถเข้าสู่ระบบได้");
        localStorage.removeItem("user");
        localStorage.removeItem("selectedStudent");
        localStorage.removeItem("teacher_class_id");
        localStorage.removeItem("teacher_class_name");
        navigate("/login");
        return;
      }

      // =================================
      // 2. ดักตรวจสอบสิทธิ์การใช้งาน
      // =================================
      const userData = res.data.user;

      const checkRole = String(userData?.role || userData?.Role || "")
        .replace(/\s+/g, "")
        .trim();

      const checkStatus = String(userData?.status || userData?.Status || "")
        .replace(/\s+/g, "")
        .trim();

      if (
        checkRole === "ถูกระงับสิทธิ์" ||
        checkStatus === "ถูกระงับสิทธิ์" ||
        checkStatus === "ถูกระงับ" ||
        checkStatus === "ระงับ"
      ) {
        alert("บัญชีของคุณถูกระงับสิทธิ์การใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
        localStorage.removeItem("user");
        localStorage.removeItem("selectedStudent");
        localStorage.removeItem("teacher_class_id");
        localStorage.removeItem("teacher_class_name");
        navigate("/login");
        return;
      }

      console.log("LOGIN USER =", userData);

      // =================================
      // 3. กรณีสิทธิ์ผ่านปกติ (แอดมิน, ครู, ผู้ปกครอง)
      // =================================
      localStorage.setItem("user", JSON.stringify(userData));

      // 🟢 บันทึกข้อมูลห้องเรียนของคุณครูลง localStorage (หากมี)
      const teacherClassId = userData.class_id || userData.Class_id || userData.classId || "";
      const teacherClassName = userData.class_name || userData.Class_name || userData.Class_level || "";
      
      if (teacherClassId) localStorage.setItem("teacher_class_id", String(teacherClassId));
      if (teacherClassName) localStorage.setItem("teacher_class_name", String(teacherClassName));

      // กรณีเป็นผู้ปกครองและมีรายชื่อเด็ก
      if (userData.students && userData.students.length > 0) {
        localStorage.setItem("selectedStudent", JSON.stringify(userData.students[0]));
      } else {
        localStorage.removeItem("selectedStudent");
      }

      onLoginSuccess();

    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) {
        alert(err.response.data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else {
        alert("เชื่อมต่อ Server ไม่ได้");
      }
    }
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* 🎨 ฝั่งซ้าย: พื้นหลังรูปตึกโรงเรียน */}
        <div style={{ ...styles.leftPanel, backgroundImage: `url(${schoolImg})` }}>
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
    backgroundImage: `url(${bgImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    fontFamily: "'Inter', 'Kanit', sans-serif",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9999
  },
  card: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    backgroundColor: "transparent",
    borderRadius: "20px",
    width: "900px",
    height: "600px",
    boxShadow: "0 28px 60px rgba(2, 132, 199, 0.18)",
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
    color: "#0f4f7a",
    textShadow: "0 1px 4px rgba(255, 255, 255, 0.6)"
  },
  rightPanel: {
    padding: "40px 60px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(255, 255, 255, 0)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
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
    color: "#12324a",
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
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxSizing: "border-box",
    outline: "none",
    fontSize: "14px",
    color: "#334155",
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 12px 24px rgba(14, 165, 233, 0.28)",
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
    color: "#0284c7",
    fontWeight: "600",
    cursor: "pointer",
    padding: "0",
    fontSize: "14px",
    textDecoration: "underline",
  }
};

export default Login;