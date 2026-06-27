import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 🛠️ ดึงไฟล์รูปภาพจากโฟลเดอร์ตามโครงสร้างเดิมของพี่ครับ
import schoolImg from '../school-building.jpg.JPG';

function Register() {
    const [formData, setFormData] = useState({
        Name: '',
        Phone: '',
        UserName: '',
        Role: '',
        Class_level: '',
        Password: '',
        ConfirmPassword: ''
    });

    const [message, setMessage] = useState({ text: '', type: '' });

    const navigate = useNavigate(); // ประกาศตัวแปรเพื่อใช้งานระบบนำทาง

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (formData.Password !== formData.ConfirmPassword) {
            setMessage({ text: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน!', type: 'danger' });
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ text: data.message || 'ลงทะเบียนสำเร็จ!', type: 'success' });
                setFormData({ Name: '', Phone: '', UserName: '', Role: '', Class_level: '', Password: '', ConfirmPassword: '' });

                // ลงทะเบียนสำเร็จ 2 วินาที เด้งกลับหน้าล็อกอินให้อัตโนมัติ
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage({ text: data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน', type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', type: 'danger' });
        }
    };

    // สั่งย้ายหน้ากลับไปที่ Path "/login"
    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* 🎨 ฝั่งซ้าย: พื้นหลังรูปตึกโรงเรียน + ข้อความระบบ */}
                <div style={{ ...styles.leftPanel, backgroundImage: `url(${schoolImg})` }}>
                    <div style={styles.logoArea}>
                        <h2 style={styles.logoText}>ระบบบันทึกกิจกรรมนักเรียนระดับปฐมวัย</h2>
                    </div>
                </div>

                {/* 📝 ฝั่งขวา: ฟอร์มลงทะเบียน */}
                <div style={styles.rightPanel}>
                    <div style={styles.formScrollContainer}>
                        <form onSubmit={handleSubmit} style={styles.formContent} autoComplete="off">
                            <h2 style={styles.title}>ลงทะเบียนเข้าใช้งาน</h2>

                            {/* แสดงข้อความแจ้งเตือนสถานะ */}
                            {message.text && (
                                <div style={message.type === 'danger' ? styles.alertDanger : styles.alertSuccess}>
                                    {message.text}
                                </div>
                            )}

                            {/* ชื่อ-นามสกุล */}
                            <div style={styles.field}>
                                <div style={styles.inputContainer}>
                                    <input type="text" name="Name" placeholder="ชื่อ-นามสกุล" value={formData.Name} onChange={handleChange} style={styles.input} required />
                                </div>
                            </div>

                            {/* เบอร์โทร */}
                            <div style={styles.field}>
                                <div style={styles.inputContainer}>
                                    <input type="text" name="Phone" placeholder="เบอร์โทรศัพท์" value={formData.Phone} onChange={handleChange} style={styles.input} required />
                                </div>
                            </div>

                            {/* ชื่อผู้ใช้ */}
                            <div style={styles.field}>
                                <div style={styles.inputContainer}>
                                    <input type="text" name="UserName" placeholder="ชื่อผู้ใช้ (Username)" value={formData.UserName} onChange={handleChange} style={styles.input} required />
                                </div>
                            </div>

                            {/* 🛠️ สถานะ/ตำแหน่ง (เหลือเฉพาะครูผู้สอนและผู้ปกครอง) */}
                            <div style={styles.field}>
                                <div style={styles.inputContainer}>
                                    <select name="Role" value={formData.Role} onChange={handleChange} style={styles.selectInput} required>
                                        <option value="">เลือกสถานะ</option>
                                        <option value="ครูผู้สอน">ครูผู้สอน</option>
                                        <option value="ผู้ปกครอง">ผู้ปกครอง</option>
                                    </select>
                                </div>
                            </div>

                            {/* 🛠️ ห้องเรียนประจำชั้น (แบ่งห้องปกติ และ 3 ภาษา ตั้งแต่อินุบาล 1 - 3) */}
                            <div style={styles.field}>
                                <div style={styles.inputContainer}>
                                    <select name="Class_level" value={formData.Class_level} onChange={handleChange} style={styles.selectInput} required>
                                        <option value="">เลือกห้องเรียนประจำชั้น</option>
                                        <option value="อ.1 ห้องปกติ">อนุบาล 1 ห้องปกติ</option>
                                        <option value="อ.1 ห้อง 3 ภาษา">อนุบาล 1 ห้อง 3 ภาษา</option>
                                        <option value="อ.2 ห้องปกติ">อนุบาล 2 ห้องปกติ</option>
                                        <option value="อ.2 ห้อง 3 ภาษา">อนุบาล 2 ห้อง 3 ภาษา</option>
                                        <option value="อ.3 ห้องปกติ">อนุบาล 3 ห้องปกติ</option>
                                        <option value="อ.3 ห้อง 3 ภาษา">อนุบาล 3 ห้อง 3 ภาษา</option>
                                        <option value="ไม่มี">ไม่มี (สำหรับผู้ปกครอง)</option>
                                    </select>
                                </div>
                            </div>

                            {/* รหัสผ่าน */}
                            <div style={styles.field}>
                                <div style={styles.inputContainer}>
                                    <input type="password" name="Password" placeholder="รหัสผ่าน" value={formData.Password} onChange={handleChange} style={styles.input} required autoComplete="new-password" />
                                </div>
                            </div>

                            {/* ยืนยันรหัสผ่าน */}
                            <div style={styles.field}>
                                <div style={styles.inputContainer}>
                                    <input type="password" name="ConfirmPassword" placeholder="ยืนยันรหัสผ่าน" value={formData.ConfirmPassword} onChange={handleChange} style={styles.input} required />
                                </div>
                            </div>

                            {/* ปุ่มลงทะเบียน */}
                            <button type="submit" style={styles.button}>
                                ยืนยันการลงทะเบียน
                            </button>

                            {/* ปุ่มลิงก์กลับไปหน้า Login */}
                            <div style={styles.loginLinkContainer}>
                                <span style={styles.loginLinkText}>มีบัญชีผู้ใช้งานแล้ว?</span>
                                <button type="button" onClick={handleBackToLogin} style={styles.loginLinkButton}>
                                    เข้าสู่ระบบที่นี่
                                </button>
                            </div>
                        </form>
                    </div>
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
        height: "630px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
    },
    leftPanel: {
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
    rightPanel: {
        padding: "30px 50px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    },
    formScrollContainer: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    formContent: {
        display: "flex",
        flexDirection: "column",
    },
    title: {
        fontSize: "26px",
        fontWeight: "700",
        margin: "0 0 25px 0",
        color: "#1e293b",
        textAlign: "left"
    },
    field: {
        display: "flex",
        flexDirection: "column",
        marginBottom: "14px"
    },
    inputContainer: {
        display: "flex",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#f8fafc"
    },
    input: {
        width: "100%",
        padding: "12px 16px",
        border: "none",
        boxSizing: "border-box",
        outline: "none",
        fontSize: "14px",
        color: "#334155",
        backgroundColor: "transparent",
    },
    selectInput: {
        width: "100%",
        padding: "12px 16px",
        border: "none",
        boxSizing: "border-box",
        outline: "none",
        fontSize: "14px",
        color: "#334155",
        backgroundColor: "transparent",
        cursor: "pointer"
    },
    button: {
        width: "100%",
        padding: "12px",
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
    loginLinkContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "16px",
        gap: "6px",
        fontSize: "14px"
    },
    loginLinkText: {
        color: "#64748b"
    },
    loginLinkButton: {
        background: "none",
        border: "none",
        color: "#4f46e5",
        fontWeight: "600",
        cursor: "pointer",
        padding: "0",
        fontSize: "14px",
        textDecoration: "underline",
    },
    alertDanger: { color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', border: '1px solid #fee2e2', fontSize: '13px', textAlign: 'center', marginBottom: '15px' },
    alertSuccess: { color: '#10b981', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px', border: '1px solid #d1fae5', fontSize: '13px', textAlign: 'center', marginBottom: '15px' }
};

export default Register;